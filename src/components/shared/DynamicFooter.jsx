import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './DynamicFooter.css';

const DynamicFooter = ({ footerType = 'marketing' }) => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  if (footerType === 'minimalist') {
    return (
      <footer className="footer-minimalist">
        <div className="footer-minimalist-content">
          <Link to="/terms">Terms of Service</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <span>&copy; 2024 Budget Tracker</span>
        </div>
      </footer>
    );
  }

  if (footerType === 'utility') {
    return (
      <footer className="footer-utility">
        <div className="footer-utility-content">
          <div className="footer-left">
            <span>&copy; 2024 Budget Tracker</span>
            <span className="version">v1.2.0</span>
          </div>
          <div className="footer-right">
            <Link to="/help">Help Center</Link>
            <Link to="/report-bug">Report a Bug</Link>
            <button onClick={handleLogout} className="logout-link">Logout</button>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="footer-marketing">
      <div className="footer-marketing-content">
        <div className="footer-columns">
          <div className="footer-column">
            <h3>Budget Tracker</h3>
            <p>Take control of your financial future with smart budgeting.</p>
          </div>
          <div className="footer-column">
            <h4>Product</h4>
            <Link to="/features">Features</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/how-it-works">How It Works</Link>
          </div>
          <div className="footer-column">
            <h4>Company</h4>
            <Link to="/about">About Us</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/careers">Careers</Link>
          </div>
          <div className="footer-column footer-cta">
            <h4>Ready to take control?</h4>
            <Link to="/register" className="cta-button">Sign Up for Free</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2024 Budget Tracker. All rights reserved.</span>
          <div className="social-icons">
            <button type="button" aria-label="Twitter" className="social-icon-btn">𝕏</button>
            <button type="button" aria-label="Facebook" className="social-icon-btn">f</button>
            <button type="button" aria-label="LinkedIn" className="social-icon-btn">in</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DynamicFooter;