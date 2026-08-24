import React, { useEffect, useState } from "react";
import { Sun, Moon, LogOut, Menu, X } from "lucide-react";
import "./Navbar.css";

const LINKS = [
  { href: "#home", label: "Home", view: "home" },
  // { href: "#directory", label: "Doctors Directory", view: "directory" }, // Save for future use
  { href: "#next-day", label: "Find a Doctor", view: "home" },
  { href: "#monthly-roster", label: "Monthly Roster", view: "home" },
  { href: "#health-advice", label: "Health Advice", view: "home" },
];

export default function Navbar({ onLogout, onBookClick, currentView, onViewChange }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const [activeLink, setActiveLink] = useState('#home');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // Track active section on scroll
  useEffect(() => {
    const sectionIds = LINKS.map(l => l.href.replace('#', ''));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveLink(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleLinkClick = (e, link) => {
    if (link.view === "directory") {
      e.preventDefault();
      onViewChange("directory");
      setActiveLink(link.href);
    } else {
      if (currentView !== "home") {
        onViewChange("home");
      }
      setActiveLink(link.href);
      if (link.href !== "#home") {
        setTimeout(() => {
          const el = document.getElementById(link.href.replace('#', ''));
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
    setOpen(false);
  };

  return (
    <header className={`navbar ${scrolled ? "navbar--scrolled" : ""}`}>
      <div className="navbar__inner">
        {/* Brand */}
        <a href="#home" className="navbar__brand" onClick={(e) => handleLinkClick(e, LINKS[0])} aria-label="Mahal al Shifa Home">
          <img
            src="/mahal-al-shifa-logo.png"
            alt="Mahal al Shifa Logo"
            style={{ height: '42px', width: 'auto', objectFit: 'contain', display: 'block', backgroundColor: '#ffffff', padding: '6px 16px', borderRadius: '8px' }}
          />
          <span className="navbar__wordmark" style={{ marginLeft: '12px' }}>
            <strong className="navbar__brand-text" style={{ fontSize: '1.25rem', color: '#ffffff' }}>Mahal Al Shifa</strong>
          </span>
        </a>

        {/* Navigation Links */}
        <nav className={`navbar__links ${open ? "navbar__links--open" : ""}`} aria-label="Primary Navigation">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={activeLink === link.href ? 'navbar__link--active' : ''}
              onClick={(e) => handleLinkClick(e, link)}
            >
              {link.label}
            </a>
          ))}

          <button
            onClick={() => {
              setOpen(false);
              if (onBookClick) onBookClick();
            }}
            className="btn navbar__cta-btn navbar__cta-desktop"
          >
            Book Appointment
          </button>

          {/* Mobile-only actions */}
          <div className="navbar__mobile-actions">
            <button
              onClick={() => {
                setOpen(false);
                if (onBookClick) onBookClick();
              }}
              className="btn navbar__cta-btn"
            >
              Book Appointment
            </button>
            <button
              onClick={() => setIsDark(!isDark)}
              className="navbar__theme-toggle"
              aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
              <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            {onLogout && (
              <button onClick={onLogout} className="navbar__logout-mobile" aria-label="Logout">
                <LogOut size={16} /> Logout
              </button>
            )}
          </div>
        </nav>

        {/* Right Actions */}
        <div className="navbar__actions">
          <button
            onClick={() => setIsDark(!isDark)}
            className="navbar__theme-toggle"
            aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {onLogout && (
            <button
              onClick={onLogout}
              className="navbar__logout-btn"
              aria-label="Logout"
            >
              <LogOut size={16} /> Logout
            </button>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className={`navbar__toggle ${open ? "navbar__toggle--open" : ""}`}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  );
}
