import React, { useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle, X, Download, RotateCcw, Camera, Edit, Trash2 } from "lucide-react";
import { useRoster } from "../../context/RosterContext.jsx";
import * as XLSX from "xlsx";
import "./AdminUpload.css";

const SAMPLE_JSON = [
  { Date: "2026-07-19", DoctorName: "Dr. Ayesha Khan", Specialty: "General Physician", Timing: "9:00 AM - 12:00 PM", Photo: "" },
  { Date: "2026-07-19", DoctorName: "Dr. Imran Siddiqui", Specialty: "Cardiology", Timing: "10:00 AM - 1:00 PM", Photo: "" },
  { Date: "2026-07-20", DoctorName: "Dr. Rukhsana Ali", Specialty: "Pediatrics", Timing: "4:00 PM - 7:00 PM", Photo: "" },
];

function downloadSampleTemplate() {
  const ws = XLSX.utils.json_to_sheet(SAMPLE_JSON);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Template");
  XLSX.writeFile(wb, "mahal-us-shifa-roster-template.xlsx");
}

export default function AdminUpload({ onDone }) {
  const { uploadFile, uploadState, confirmUpload, resetUploadState, isDemo, meta, resetToDemo, entries } = useRoster();
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null); // { entries, skipped, fileName }
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const result = await uploadFile(file);
    if (result.ok) {
      setPreview({ entries: result.entries, skipped: result.skipped, fileName: result.fileName });
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
          const targetDoctorName = updatedEntries[index].doctorName;
          updatedEntries.forEach((row, i) => {
            if (row.doctorName.toLowerCase() === targetDoctorName.toLowerCase() || i === index) {
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
      const targetDoctorName = updatedEntries[index].doctorName;
      updatedEntries.forEach((row, i) => {
        if (row.doctorName.toLowerCase() === targetDoctorName.toLowerCase() || i === index) {
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

  const confirm = () => {
    confirmUpload(preview.entries, preview.fileName);
    setPreview(null);
    onDone?.();
  };

  const cancel = () => {
    setPreview(null);
    resetUploadState();
  };

  if (preview) {
    return (
      <section className="admin-upload" aria-labelledby="admin-upload-preview-heading">
        <header className="admin-upload__preview-head">
          <div>
            <h3 id="admin-upload-preview-heading">Preview: {preview.fileName}</h3>
            <p>{preview.entries.length} appointments found{preview.skipped > 0 ? `, ${preview.skipped} row(s) skipped` : ""}. Click <strong>Upload Photo</strong> to attach doctor pictures directly from your device before publishing.</p>
          </div>
        </header>

        <div className="admin-upload__preview-table-wrap">
          <table className="admin-upload__preview-table">
            <thead>
              <tr>
                <th scope="col">Photo</th>
                <th scope="col">Date</th>
                <th scope="col">Doctor</th>
                <th scope="col">Specialty</th>
                <th scope="col">Timing</th>
                <th scope="col">Attach Photo</th>
              </tr>
            </thead>
            <tbody>
              {preview.entries.map((e, idx) => (
                <tr key={e.id || idx}>
                  <td>
                    {e.photo ? (
                      <img src={e.photo} alt={e.doctorName} style={{ width: 34, height: 34, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }} />
                    ) : (
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e2e8f0', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>
                        {e.doctorName?.replace(/^Dr\.?\s*/i, "").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td>{e.date}</td>
                  <td><strong>{e.doctorName}</strong></td>
                  <td>{e.specialty}</td>
                  <td>{e.timing}</td>
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
              ))}
            </tbody>
          </table>
        </div>

        <div className="admin-upload__actions">
          <button className="btn btn-secondary" onClick={cancel} aria-label="Cancel Upload">
            <X size={16} aria-hidden="true" /> Cancel
          </button>
          <button className="btn btn-primary" onClick={confirm} aria-label="Confirm and Publish Roster">
            <CheckCircle size={16} aria-hidden="true" /> Confirm & Publish
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-upload" aria-labelledby="admin-upload-heading">
      <h3 id="admin-upload-heading" className="visually-hidden">Upload Doctor Roster</h3>
      
      <div
        className={`admin-upload__dropzone ${dragOver ? "admin-upload__dropzone--active" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="File Upload Dropzone"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <UploadCloud size={48} className="admin-upload__dropzone-icon" aria-hidden="true" />
        <p><strong>Click to upload</strong> or drag and drop</p>
        <span>.xlsx, .xls, or .json — one row per doctor appointment</span>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls,.json,application/json"
          className="visually-hidden"
          onClick={(e) => { e.target.value = null; }}
          onChange={(e) => handleFile(e.target.files?.[0])}
          aria-hidden="true"
          tabIndex={-1}
        />
      </div>

      <div aria-live="polite">
        {uploadState.status === "loading" && <p className="admin-upload__status">Reading file…</p>}
        {uploadState.status === "error" && <p className="admin-upload__status admin-upload__status--error">{uploadState.error}</p>}
      </div>

      <div className="admin-upload__meta">
        <p>
          {isDemo ? (
            <>Currently showing <strong>sample demo data</strong> — no roster uploaded yet.</>
          ) : (
            <>Current roster: <strong>{entries.length} appointments</strong>{meta?.fileName ? <> from “{meta.fileName}”</> : null}.</>
          )}
        </p>
        <div className="admin-upload__meta-actions">
          <button className="btn btn-ghost btn-sm" onClick={downloadSampleTemplate} aria-label="Download Sample Template">
            <Download size={14} aria-hidden="true" /> Template
          </button>
          {!isDemo && (
            <>
              <button 
                className="btn btn-ghost btn-sm" 
                onClick={() => setPreview({ entries: [...entries], skipped: 0, fileName: meta?.fileName || "Current Roster" })} 
                aria-label="Update Photos"
                style={{ color: '#0ea5e9' }}
              >
                <Edit size={14} aria-hidden="true" /> Update Photos
              </button>
              <button 
                className="btn btn-ghost btn-sm text-red" 
                onClick={() => setShowConfirmReset(true)} 
                aria-label="Reset to Demo Data"
              >
                <RotateCcw size={14} aria-hidden="true" /> Reset Data
              </button>
            </>
          )}
        </div>
      </div>

      <div className="admin-upload__note">
        <FileSpreadsheet size={16} aria-hidden="true" />
        <p>
          Expected columns: <code>Date</code>, <code>DoctorName</code>, <code>Specialty</code>, <code>Timing</code>, and optionally <code>Photo</code>, <code>Phone</code>, <code>Notes</code>. Column names are matched flexibly.
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
              Are you sure you want to reset the roster data back to the demo defaults? <strong>This action cannot be undone.</strong>
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
                onClick={() => {
                  resetToDemo();
                  setShowConfirmReset(false);
                }}
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
