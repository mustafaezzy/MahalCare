import React, { useState, useEffect } from "react";
import { 
  Stethoscope, Heart, User, UserCheck, Baby, 
  Activity, UserPlus, Phone, Clock, MapPin, Search, ArrowLeft,
  ChevronRight, ShieldCheck, Users, CheckCircle2, Loader2,
  X
} from "lucide-react";
import { loadDirectory, loadDirectoryMeta } from "../../data/directoryService";
import "./DoctorsDirectory.css";

const ICON_COLORS = [
  { icon: Activity, color: "linear-gradient(135deg, #1a5a4a, #2e8b7a)" },
  { icon: Activity, color: "linear-gradient(135deg, #619a3b, #8dc75d)" },
  { icon: Heart, color: "linear-gradient(135deg, #c72929, #e65c5c)" },
  { icon: Stethoscope, color: "linear-gradient(135deg, #1d4e9e, #4a7fdc)" },
  { icon: UserCheck, color: "linear-gradient(135deg, #6b358e, #9c59c5)" },
  { icon: User, color: "linear-gradient(135deg, #9a1a47, #d03d72)" },
  { icon: UserPlus, color: "linear-gradient(135deg, #2ea169, #54cc92)" },
  { icon: Activity, color: "linear-gradient(135deg, #17449e, #4272d4)" },
  { icon: Activity, color: "linear-gradient(135deg, #b53535, #e05e5e)" },
  { icon: Baby, color: "linear-gradient(135deg, #8a248f, #be4cc5)" },
  { icon: Activity, color: "linear-gradient(135deg, #2c3e50, #4ca1af)" },
  { icon: Activity, color: "linear-gradient(135deg, #e67e22, #f39c12)" },
  { icon: Activity, color: "linear-gradient(135deg, #82a822, #a8d335)" },
  { icon: Baby, color: "linear-gradient(135deg, #56ab2f, #a8e063)" },
  { icon: Activity, color: "linear-gradient(135deg, #5e35b1, #8e54e9)" },
  { icon: Activity, color: "linear-gradient(135deg, #0f4c75, #3282b8)" },
  { icon: Activity, color: "linear-gradient(135deg, #118a7e, #3bbaa9)" }
];

export default function DoctorsDirectory({ onBookClick }) {
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Supabase states
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const data = await loadDirectory();
      if (data) {
        setDoctors(data);
      }
      const metaData = loadDirectoryMeta();
      if (metaData) {
        setMeta(metaData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Compute dynamic specialties from fetched data
  const specialtyNames = [...new Set(doctors.map(d => d.category))].filter(Boolean).sort();
  const dynamicSpecialties = specialtyNames.map((name, idx) => {
    const mapped = ICON_COLORS[idx % ICON_COLORS.length];
    return {
      name,
      icon: mapped.icon,
      color: mapped.color
    };
  });

  const handleSpecialtyClick = (specialtyName) => {
    setSelectedSpecialty(specialtyName);
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedSpecialty(null);
    setSearchQuery("");
  };

  // Determine if we should show the detail view
  const isDetailView = selectedSpecialty !== null || searchQuery.trim().length > 0;
  
  // Filter doctors
  let displayedDoctors = doctors;
  if (selectedSpecialty) {
     displayedDoctors = displayedDoctors.filter(d => d.category && d.category.toLowerCase() === selectedSpecialty.toLowerCase());
  }
  if (searchQuery.trim().length > 0) {
     displayedDoctors = displayedDoctors.filter(doc => 
        (doc.names && doc.names.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (doc.type && doc.type.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.category && doc.category.toLowerCase().includes(searchQuery.toLowerCase()))
     );
  }

  return (
    <div className="dir-container">
      {/* Premium Animated Hero Section */}
      <div className="dir-hero">
        <div className="dir-hero-bg">
          <div className="dir-blob dir-blob-1"></div>
          <div className="dir-blob dir-blob-2"></div>
          <div className="dir-blob dir-blob-3"></div>
        </div>
        
        <div className="dir-hero-content-wrapper">
          <div className="dir-glass-panel">
            <h2 className="dir-hero-subtitle">Mumineen Indore</h2>
            <h1 className="dir-hero-title">Doctors Directory</h1>
            <p className="dir-hero-desc">Find top specialists, view clinic locations, and check timings instantly.</p>
            
            <div className="dir-search-bar">
              <Search className="dir-search-icon" size={22} />
              <input 
                type="text" 
                className="dir-search-input"
                placeholder="Search doctors, specialties, or clinics..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="dir-search-clear" onClick={() => setSearchQuery("")} aria-label="Clear Search">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dir-main-content">
        {loading ? (
          <div className="dir-loading-state">
            <Loader2 className="animate-spin" size={48} />
            <p>Loading directory...</p>
          </div>
        ) : isDetailView ? (
          /* ----- DETAIL / SEARCH RESULTS VIEW ----- */
          <div className="dir-results-view">
            <div className="dir-results-header">
              <button className="dir-back-btn" onClick={handleBack}>
                <ArrowLeft size={20} /> Back to Directory
              </button>
              {selectedSpecialty ? (
                <h2 className="dir-results-title">{selectedSpecialty.toUpperCase()}</h2>
              ) : (
                <h2 className="dir-results-title">Search Results</h2>
              )}
            </div>

            <div className="dir-doctor-grid">
              {displayedDoctors.map((doc, idx) => (
                <div key={doc.id || idx} className="dir-doctor-card" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="dir-doctor-card-header">
                    <div className="dir-doctor-avatar-wrapper">
                      {doc.photo ? (
                        <img 
                          src={doc.photo} 
                          alt={doc.names} 
                          className="dir-doctor-avatar"
                        />
                      ) : (
                        <div className="dir-doctor-avatar-placeholder">
                          {doc.names?.replace(/^Dr\.?\s*/i, "").slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="dir-doctor-name-group">
                      <h3 className="dir-doctor-name">{doc.names}</h3>
                      <p className="dir-doctor-type">{doc.type}</p>
                      {!selectedSpecialty && (
                        <span className="dir-doctor-badge">{doc.category}</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="dir-doctor-card-body">
                    <div className="dir-detail-pill">
                      <User size={16} className="dir-detail-icon" />
                      <span>{doc.qualifications}</span>
                    </div>
                    <div className="dir-detail-pill">
                      <Clock size={16} className="dir-detail-icon" />
                      <span>{doc.time}</span>
                    </div>
                    <div className="dir-detail-pill dir-detail-pill--contact">
                      <Phone size={16} className="dir-detail-icon" />
                      <span>{doc.mobile_no}</span>
                    </div>
                    <div className="dir-detail-pill dir-detail-pill--address">
                      <MapPin size={16} className="dir-detail-icon" />
                      <span>{doc.address}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {displayedDoctors.length === 0 && (
              <div className="dir-empty-state">
                <Search size={48} className="dir-empty-icon" />
                <h3>No Doctors Found</h3>
                <p>We couldn't find any doctors matching "{searchQuery}" in this category.</p>
                <button className="btn btn-primary" onClick={handleBack}>View All Specialties</button>
              </div>
            )}
          </div>
        ) : (
          /* ----- INDEX VIEW ----- */
          <div className="dir-index-view">
            <div className="dir-index-header">
              <h2 className="dir-section-title">Browse Specialties</h2>
              {meta?.uploadedAt && (
                <span className="dir-meta-text">
                  Last updated: {new Date(meta.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>

            {dynamicSpecialties.length === 0 ? (
              <div className="dir-empty-state">
                <p>No specialties available at the moment.</p>
              </div>
            ) : (
              <div className="dir-specialty-grid">
                {dynamicSpecialties.map((spec, idx) => {
                  const Icon = spec.icon;
                  return (
                    <button 
                      key={spec.name} 
                      className="dir-specialty-card"
                      onClick={() => handleSpecialtyClick(spec.name)}
                      style={{ animationDelay: `${idx * 0.05}s` }}
                    >
                      <div className="dir-specialty-left">
                        <div className="dir-specialty-icon-circle" style={{ background: spec.color }}>
                          <Icon size={24} color="white" strokeWidth={2.5} />
                        </div>
                        <span className="dir-specialty-name">{spec.name}</span>
                      </div>
                      <div className="dir-specialty-right">
                        <ChevronRight size={20} className="dir-specialty-arrow" />
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Features Footer */}
      {!isDetailView && (
        <div className="dir-features-footer">
          <div className="dir-feature">
            <ShieldCheck size={40} className="dir-feature-icon" />
            <div className="dir-feature-text">
              <h4>Verified Profiles</h4>
              <p>Authentic and updated information provided by medical professionals.</p>
            </div>
          </div>
          <div className="dir-feature-divider"></div>
          <div className="dir-feature">
            <Users size={40} className="dir-feature-icon" />
            <div className="dir-feature-text">
              <h4>All Specialities</h4>
              <p>From General Physicians to specialized surgeons in one place.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
