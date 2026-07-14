import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="site-footer">
    <div className="site-footer__inner">
      <div>
        <div className="footer-wordmark">TableFlow</div>
        <p>Reservation and restaurant operations, designed around the rhythm of real service.</p>
      </div>
      <div className="site-footer__links">
        <Link to="/login">Sign in</Link>
        <Link to="/register">Create account</Link>
        <a href="/#technology">MERN architecture</a>
      </div>
      <div className="site-footer__meta">
        <span>© {new Date().getFullYear()} TableFlow</span>
        <span>Built with MongoDB · Express · React · Node</span>
      </div>
    </div>
  </footer>
);

export default Footer;
