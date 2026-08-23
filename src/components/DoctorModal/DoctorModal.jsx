import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Printer, Share2, CalendarCheck, CheckCircle2, ArrowLeft, Hash, ZoomIn } from "lucide-react";
import { formatLongDate } from "../../utils/dateUtils.js";
import { useBookings } from "../../context/BookingContext.jsx";
import ImageZoomModal from "../ImageZoomModal/ImageZoomModal.jsx";
import "./DoctorModal.css";

export default function DoctorModal({ entry, onClose }) {
  const [view, setView] = useState("details"); // 'details' | 'booking' | 'success'
  const [formData, setFormData] = useState({ name: "", its: "", phone: "", reason: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookedToken, setBoostedToken] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  
  const { bookAppointment } = useBookings();
  const componentRef = useRef();
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Appointment_${entry?.doctorName?.replace(/\s+/g, '_') || 'Doctor'}`,
  });

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!entry) return null;

  const appointmentDetailsText = `Appointment Details:\nDoctor: ${entry.doctorName}\nSpecialty: ${entry.specialty}\nDate: ${formatLongDate(entry.date)}\nTime: ${entry.timing}\n${entry.phone ? `Contact: ${entry.phone}` : ''}`;
  
  const handleWhatsAppShare = () => {
    const encodedText = encodeURIComponent(appointmentDetailsText);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await bookAppointment({
      ...formData,
      doctorName: entry.doctorName,
      date: entry.date,
      timing: entry.timing,
      specialty: entry.specialty
    });
    setBoostedToken(result.booking.token);
    setIsSubmitting(false);
    setView("success");

    const message = 
`*Mahal al Shifa Appointment Request*
---------------------------------
*Patient Name:* ${formData.name}
*ITS Number:* ${formData.its}
*Phone:* ${formData.phone}
*Doctor:* ${entry.doctorName}
*Specialty:* ${entry.specialty}
*Scheduled:* ${formatLongDate(entry.date)} (${entry.timing})
${formData.reason ? `*Reason:* ${formData.reason}\n` : ""}*Booking Token:* #${result.booking.token}
---------------------------------
Please confirm my appointment. Thank you!`;

    window.open(`https://wa.me/917723868522?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <>
      <div className="doctor-modal__backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
        <div className="doctor-modal glass-card" role="dialog" aria-modal="true" aria-label={`Details for ${entry.doctorName}`}>
          <button className="doctor-modal__close" onClick={onClose} aria-label="Close modal">×</button>

          {view === "details" && (
            <>
              {/* Printable Area */}
              <div ref={componentRef} className="doctor-modal__print-area">
                <header className="doctor-modal__head">
                  {entry.photo ? (
                    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setIsZoomed(true)} title="Click to zoom photo">
                      <img className="doctor-modal__photo" src={entry.photo} alt={entry.doctorName} />
                      <div style={{ position: 'absolute', inset: 0, borderRadius: 'var(--r-lg)', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '1'} onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}>
                        <ZoomIn size={20} />
                      </div>
                    </div>
                  ) : (
                    <div className="doctor-modal__avatar">{entry.doctorName.replace(/^Dr\.?\s*/i, "").slice(0, 1)}</div>
                  )}
                  <div className="doctor-modal__title-group">
                    <h3 id="modal-doctor-name">{entry.doctorName}</h3>
                    <span className="badge badge-teal">{entry.specialty}</span>
                  </div>
                </header>

              <dl className="doctor-modal__facts">
                <div>
                  <dt>Date</dt>
                  <dd>{formatLongDate(entry.date)}</dd>
                </div>
                <div>
                  <dt>Consultation timing</dt>
                  <dd>{entry.timing}</dd>
                </div>
                {entry.phone && (
                  <div>
                    <dt>Contact</dt>
                    <dd>{entry.phone}</dd>
                  </div>
                )}
                {entry.notes && (
                  <div className="doctor-modal__notes">
                    <dt>Notes</dt>
                    <dd>{entry.notes}</dd>
                  </div>
                )}
              </dl>

              <p className="doctor-modal__foot">
                Please arrive 15 minutes before the consultation window. Schedules can change.
              </p>
            </div>

            {/* Actions (Not Printed) */}
            <div className="doctor-modal__actions">
              <button className="btn btn-secondary btn-sm doctor-modal__icon-btn doctor-modal__wa-btn" onClick={handleWhatsAppShare} aria-label="Share details" title="Share">
                <Share2 size={18} aria-hidden="true" /> Share Details
              </button>
            </div>
          </>
        )}

        {view === "booking" && (
          <div className="doctor-modal__booking">
            <button className="btn btn-ghost btn-sm doctor-modal__back" onClick={() => setView("details")}>
              <ArrowLeft size={16} /> Back
            </button>
            <h3 className="doctor-modal__booking-title">Book Appointment</h3>
            <p className="doctor-modal__booking-subtitle">with {entry.doctorName} on {formatLongDate(entry.date)}</p>
            
            <form onSubmit={handleBookSubmit} className="doctor-modal__form">
              <div className="form-group">
                <label>Patient Name</label>
                <input 
                  type="text" 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  placeholder="Full Name"
                />
              </div>
              <div className="form-group">
                <label>ITS Number</label>
                <input 
                  type="text" 
                  required 
                  pattern="[0-9]{8}" 
                  maxLength={8}
                  value={formData.its} 
                  onKeyDown={(e) => {
                    if (
                      ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key) || 
                      e.ctrlKey || 
                      e.metaKey
                    ) {
                      return;
                    }
                    if (!/^[0-9]$/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  onChange={e => setFormData({...formData, its: e.target.value.replace(/\D/g, '')})} 
                  placeholder="8-digit ITS"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  required 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  placeholder="+91..."
                />
              </div>
              <div className="form-group">
                <label>Reason for Visit</label>
                <textarea 
                  required 
                  rows={2}
                  value={formData.reason} 
                  onChange={e => setFormData({...formData, reason: e.target.value})} 
                  placeholder="Briefly describe your symptoms"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
                {isSubmitting ? "Booking..." : "Confirm Booking"}
              </button>
            </form>
          </div>
        )}

        {view === "success" && (
          <div className="doctor-modal__success">
            <CheckCircle2 size={64} className="text-teal" />
            <h3>Booking Confirmed!</h3>
            {bookedToken && (
              <div className="doctor-modal__token">
                <Hash size={18} aria-hidden="true" />
                <span>Your Token</span>
                <strong>{bookedToken}</strong>
              </div>
            )}
            <p>Your appointment with <strong>{entry.doctorName}</strong> on <strong>{formatLongDate(entry.date)}</strong> is confirmed.</p>
            <p className="doctor-modal__token-hint">Please save your token number. You'll need it at the reception.</p>
            <div className="doctor-modal__success-actions">
              <button className="btn btn-primary" onClick={onClose} style={{ width: '100%' }}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>

    {isZoomed && entry?.photo && (
      <ImageZoomModal
        src={entry.photo}
        alt={entry.doctorName}
        onClose={() => setIsZoomed(false)}
      />
    )}
  </>
);
}
