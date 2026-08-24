import React, { useRef, useState, useEffect } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle, X, Download, RotateCcw, Camera, Edit, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";
import { saveDirectory, loadDirectoryMeta, clearDirectory, loadDirectory } from "../../data/directoryService";
import "../AdminUpload/AdminUpload.css"; // Reuse existing styles

const SAMPLE_JSON = [
  { Specialty: "Anaesthesiologist", Name: "Dr. Talib Husain Saifee", Title: "Family Consultant", Qualifications: "MBBS, DA", Timings: "2:00 pm – 3:00 pm", Contact: "+91 94240 51222", Address: "158, Mohammadi, Haidery Township" },
  { Specialty: "Ayush", Name: "Dr. Aamir Tayyebi", Title: "Gen Physician", Qualifications: "BUMS", Timings: "4:00 pm – 7:30 pm", Contact: "+91 98269 12120", Address: "Tayyebi Dawakhana, 51, Bohra Bazar" },
];

function downloadSampleTemplate() {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_JSON);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Directory Template");
  XLSX.writeFile(wb, "mahal-us-shifa-directory-template.xlsx");
}

export default function AdminDirectoryUpload({ onDone }) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ status: "idle", error: null });
  const [meta, setMeta] = useState(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const inputRef = useRef(null);

  const fetchMeta = () => {
    setMeta(loadDirectoryMeta());
  };

  useEffect(() => {
    fetchMeta();
    window.addEventListener("directory:updated", fetchMeta);
    return () => window.removeEventListener("directory:updated", fetchMeta);
  }, []);

  const handleFile = async (file) => {
    if (!file) return;
    setUploadStatus({ status: "loading", error: null });
    
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[firstSheetName];
          const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
          
          if (rows.length === 0) {
            setUploadStatus({ status: "error", error: "File is empty or could not be parsed." });
            return;
          }
          
          setPreview({ entries: rows, fileName: file.name });
          setUploadStatus({ status: "idle", error: null });
        } catch (err) {
          setUploadStatus({ status: "error", error: "Failed to parse file. Make sure it's a valid Excel or CSV file." });
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      setUploadStatus({ status: "error", error: "Failed to read file." });
    }
  };

  const handlePhotoUploadForRow = (index, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.8);

        setPreview((prev) => {
          if (!prev) return prev;
          const updatedEntries = [...prev.entries];
          // Try to get a consistent name field
          const getDoctorName = (entry) => entry.names || entry.Names || entry.name || entry.Name;
          const targetDoctorName = getDoctorName(updatedEntries[index]);
          
          updatedEntries.forEach((row, i) => {
            const currentName = getDoctorName(row);
            if ((targetDoctorName && currentName && currentName.toLowerCase() === targetDoctorName.toLowerCase()) || i === index) {
              row.photo = compressedDataUrl;
            }
          });
          return { ...prev, entries: updatedEntries };
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoRemoveForRow = (index) => {
    setPreview((prev) => {
      if (!prev) return prev;
      const updatedEntries = [...prev.entries];
      const getDoctorName = (entry) => entry.names || entry.Names || entry.name || entry.Name;
      const targetDoctorName = getDoctorName(updatedEntries[index]);
      
      updatedEntries.forEach((row, i) => {
        const currentName = getDoctorName(row);
        if ((targetDoctorName && currentName && currentName.toLowerCase() === targetDoctorName.toLowerCase()) || i === index) {
          row.photo = null;
        }
      });
      return { ...prev, entries: updatedEntries };
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const confirm = async () => {
    try {
      setUploadStatus({ status: "loading", error: null });
      const newMeta = await saveDirectory(preview.entries, { fileName: preview.fileName });
      setMeta(newMeta);
      setPreview(null);
      setUploadStatus({ status: "idle", error: null });
      onDone?.();
    } catch (err) {
      setUploadStatus({ status: "error", error: "Failed to save directory to database." });
    }
  };

  const cancel = () => {
    setPreview(null);
    setUploadStatus({ status: "idle", error: null });
  };

  const resetData = async () => {
    try {
      setUploadStatus({ status: "loading", error: null });
      await clearDirectory();
      setMeta(null);
      setShowConfirmReset(false);
      setUploadStatus({ status: "idle", error: null });
    } catch (err) {
      setUploadStatus({ status: "error", error: "Failed to reset directory." });
      setShowConfirmReset(false);
    }
  };

  const openUpdatePhotos = async () => {
    try {
      setUploadStatus({ status: "loading", error: null });
      const currentData = await loadDirectory();
      if (currentData && currentData.length > 0) {
        setPreview({ entries: currentData, fileName: meta?.fileName || "Current Directory" });
      } else {
        setUploadStatus({ status: "error", error: "No data found to update." });
      }
      setUploadStatus({ status: "idle", error: null });
    } catch (err) {
      setUploadStatus({ status: "error", error: "Failed to load current directory." });
    }
  };

  if (preview) {
    return (
      <section className="admin-upload" aria-labelledby="admin-upload-preview-heading">
        <header className="admin-upload__preview-head">
          <div>
            <h3 id="admin-upload-preview-heading">Directory Preview: {preview.fileName}</h3>
            <p>{preview.entries.length} doctors found. Click <strong>Upload Photo</strong> to attach pictures before publishing.</p>
          </div>
        </header>

        <div className="admin-upload__preview-table-wrap">
          <table className="admin-upload__preview-table">
            <thead>
              <tr>
                <th scope="col">Photo</th>
                <th scope="col">Names</th>
                <th scope="col">Category</th>
                <th scope="col">Type</th>
                <th scope="col">Mobile No</th>
                <th scope="col">Attach Photo</th>
              </tr>
            </thead>
            <tbody>
              {preview.entries.map((e, idx) => {
                const docName = e.names || e.Names || e.name || e.Name || "";
                return (
                  <tr key={idx}>
                    <td>
                      {e.photo ? (
                        <img src={e.photo} alt={docName} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }} />
                      ) : (
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                          {docName.replace(/^Dr\.?\s*/i, "").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </td>
                    <td><strong>{docName}</strong></td>
                    <td>{e.category || e.Category || e.specialty || e.Specialty}</td>
                    <td>{e.type || e.Type || e.title || e.Title}</td>
                    <td>{e.mobile_no || e["mobile no"] || e["Mobile No"] || e.contact || e.Contact}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <label className="btn btn-ghost btn-sm" style={{ cursor: 'pointer', fontSize: '0.8rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Camera size={13} /> {e.photo ? "Change Photo" : "Upload Photo"}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            onChange={(evt) => handlePhotoUploadForRow(idx, evt.target.files?.[0])}
                          />
                        </label>
                        {e.photo && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            style={{ color: '#ef4444', fontSize: '0.8rem', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px', border: 'none', background: 'transparent' }}
                            onClick={() => handlePhotoRemoveForRow(idx)}
                            aria-label="Remove Photo"
                          >
                            <Trash2 size={13} /> Remove
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="admin-upload__actions">
          {uploadStatus.status === "error" && (
            <p className="admin-upload__status admin-upload__status--error" style={{ color: 'red', marginRight: 'auto' }}>
              {uploadStatus.error}
            </p>
          )}
          {uploadStatus.status === "loading" && <span style={{ marginRight: 'auto' }}>Saving...</span>}
          <button className="btn btn-secondary" onClick={cancel} disabled={uploadStatus.status === "loading"}>
            <X size={16} /> Cancel
          </button>
          <button className="btn btn-primary" onClick={confirm} disabled={uploadStatus.status === "loading"}>
            <CheckCircle size={16} /> Confirm & Publish
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-upload" aria-labelledby="admin-directory-heading">
      <h3 id="admin-directory-heading" className="visually-hidden">Upload Doctors Directory</h3>
      
      <div
        className={`admin-upload__dropzone ${dragOver ? "admin-upload__dropzone--active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
      >
        <UploadCloud size={48} className="admin-upload__dropzone-icon" />
        <p><strong>Click to upload</strong> or drag and drop</p>
        <span>.xlsx or .csv — for the Doctors Directory</span>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="visually-hidden"
          onClick={(e) => { e.target.value = null; }}
          onChange={(e) => handleFile(e.target.files?.[0])}
          tabIndex={-1}
        />
      </div>

      <div aria-live="polite">
        {uploadStatus.status === "loading" && <p className="admin-upload__status">Processing…</p>}
        {uploadStatus.status === "error" && <p className="admin-upload__status admin-upload__status--error">{uploadStatus.error}</p>}
      </div>

      <div className="admin-upload__meta">
        <p>
          {meta ? (
            <>Current directory: <strong>{meta.entryCount} doctors</strong>{meta.fileName ? <> from “{meta.fileName}”</> : null}.</>
          ) : (
            <>No directory uploaded yet.</>
          )}
        </p>
        <div className="admin-upload__meta-actions">
          <button className="btn btn-ghost btn-sm" onClick={downloadSampleTemplate}>
            <Download size={14} /> Template
          </button>
          {meta && (
            <>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={openUpdatePhotos}
                aria-label="Update Photos"
                style={{ color: '#0ea5e9' }}
              >
                <Edit size={14} aria-hidden="true" /> Update Photos
              </button>
              <button 
                className="btn btn-ghost btn-sm text-red" 
                onClick={() => setShowConfirmReset(true)} 
                aria-label="Reset Data"
              >
                <RotateCcw size={14} aria-hidden="true" /> Reset Data
              </button>
            </>
          )}
        </div>
      </div>

      <div className="admin-upload__note">
        <FileSpreadsheet size={16} />
        <p>
          Expected columns: <code>category</code>, <code>names</code>, <code>type</code>, <code>qualifications</code>, <code>mobile no</code>, <code>time</code>, <code>address</code>, and optionally <code>photo</code>.
        </p>
      </div>

      {showConfirmReset && (
        <div 
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', padding: '20px' }} 
          onMouseDown={(e) => e.target === e.currentTarget && setShowConfirmReset(false)}
        >
          <div 
            role="alertdialog" 
            aria-modal="true" 
            aria-labelledby="reset-title" 
            aria-describedby="reset-desc" 
            style={{ 
              width: '100%',
              maxWidth: '420px', 
              background: '#ffffff', 
              padding: '32px', 
              borderRadius: '16px', 
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0',
              animation: 'popIn 0.2s ease-out' 
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={20} />
                </div>
                <h3 id="reset-title" style={{ margin: 0, fontSize: '1.25rem', color: '#0f172a', fontWeight: 'bold' }}>Reset Data</h3>
              </div>
              <button onClick={() => setShowConfirmReset(false)} aria-label="Close" style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px' }}>×</button>
            </div>
            
            <p id="reset-desc" style={{ marginBottom: '28px', color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Are you sure you want to delete all directory data? <strong>This action cannot be undone.</strong>
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setShowConfirmReset(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', background: 'transparent', border: '1px solid #cbd5e1', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)' }} 
                onClick={resetData}
              >
                Yes, Reset Data
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
