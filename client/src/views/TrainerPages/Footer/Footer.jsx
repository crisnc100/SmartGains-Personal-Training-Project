import React from 'react';
import logo_horziontal from '../../../assets/logo_horziontal.png';
import styles from './Footer.module.css';

const Footer = () => (
  <footer className={styles.footer} id="footer">
    <div className={styles.footerHeading}>
      <h1>Join SmartGains Today</h1>
      <p>Step into the future of personal training and nutrition with us.</p>
    </div>

    <div className={styles.footerBtn}>
      <p>Try it Free</p>
    </div>

    <div className={styles.footerLinks}>
      <div className={styles.footerLinksLogo}>
        <img src={logo_horziontal} alt="SmartGains Logo" />
        <p>Your trusted partner in fitness and nutrition.</p>
      </div>
      <div className={styles.footerLinksDiv}>
        <h4>Explore</h4>
        <p>About Us</p>
        <p>Blog</p>
        <p>Features & Pricing</p>
        <p>Testimonials</p>
      </div>
      <div className={styles.footerLinksDiv}>
        <h4>Support</h4>
        <p>FAQs</p>
        <p>Customer Support</p>
        <p>Contact</p>
      </div>
      <div className={styles.footerLinksDiv}>
        <h4>Company</h4>
        <p>Terms & Conditions</p>
        <p>Privacy Policy</p>
        <p>Careers</p>
      </div>
      <div className={styles.footerLinksDiv}>
        <h4>Get in touch</h4>
        <p>1234 SmartGains Ave, Suite 567</p>
        <p>(123) 456-7890</p>
        <p>info@smartgains.com</p>
      </div>
    </div>

    <div className={styles.footerCopyright}>
      <p>&copy; 2024 SmartGains. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
