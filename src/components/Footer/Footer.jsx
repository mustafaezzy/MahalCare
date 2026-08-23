import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";
import "./Footer.css";

export default function Footer({ onOpenFAQ }) {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        {/* Column 1: Brand & Tagline */}
        <div className="footer__col footer__col--brand">
          <div className="footer__brand-logo">
            <span className="footer__logo-bg">
              <img src="/mahal-al-shifa-logo.png" alt="Mahal al Shifa Logo" style={{ height: '32px', width: 'auto', objectFit: 'contain', display: 'block' }} />
            </span>
            <strong className="footer__brand-name">Mahal al Shifa</strong>
          </div>
          <p className="footer__powered-tag">Powered by Umoor Sehhat Indore</p>
          <p className="footer__desc">
            Simplifying healthcare scheduling & doctor rosters for our community with effortless booking.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer__col">
          <h4 className="footer__col-title">Quick Links</h4>
          <ul className="footer__list">
            <li><a href="#home">Home</a></li>
            <li><a href="#next-day">Find a Doctor</a></li>
            <li><a href="#monthly-roster">Monthly Roster</a></li>
            <li><a href="#health-advice">Health Advice</a></li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div className="footer__col">
          <h4 className="footer__col-title">Support</h4>
          <ul className="footer__list">
            <li>
              <a
                href="#faq"
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenFAQ) onOpenFAQ();
                }}
              >
                FAQ
              </a>
            </li>
            <li><a href="https://wa.me/919244064277" target="_blank" rel="noopener noreferrer">WhatsApp Support</a></li>

            <li><a href="#monthly-roster">Schedule Roster</a></li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div className="footer__col">
          <h4 className="footer__col-title">Contact</h4>
          <ul className="footer__contact-list">

            <li>
              <svg viewBox="0 0 24 24" className="footer__contact-icon" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
              <a href="https://wa.me/919244064277" target="_blank" rel="noopener noreferrer">+91 92440 64277</a>
            </li>
            <li>
              <Mail size={16} className="footer__contact-icon" />
              <a href="mailto:mahalshifaindore@gmail.com">mahalshifaindore@gmail.com</a>
            </li>
            <li>
              <MapPin size={16} className="footer__contact-icon" />
              <span>Mahal al Shifa Medical Center</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>© {new Date().getFullYear()} Mahal al Shifa. All rights reserved.</p>
        <span className="footer__top-credit">
          Developed by <a href="https://ameroids.in" target="_blank" rel="noopener noreferrer" className="footer__credit-link" title="Visit Ameroids Tech Studio"><strong>Ameroids Tech Studio</strong></a>
        </span>
      </div>
    </footer>
  );
}
