import React, { useState } from 'react';
import { RiMenu3Line, RiCloseLine } from 'react-icons/ri';
import styles from './Navbar.module.css';
import { Link } from 'react-router-dom';
import logo_horziontal from '../../assets/logo_horziontal.png';

const Navbar = () => {
  const [toggleMenu, setToggleMenu] = useState(false);

  return (
    <div className={styles.navbar}>
      <div className={styles.navbarLinks}>
        <div className={styles.navbarLinksLogoWrapper}>
          <a href="/" className={styles.navbarLinksLogo}>
            <img src={logo_horziontal} alt="SmartGains Logo" />
          </a>
        </div>
        <div className={styles.navbarLinksContainer}>
          <p><a href="#features-pricing">Features & Pricing</a></p>
          <p><a href="#resources">Resources</a></p>
          <p><a href="#about-contact">About & Contact</a></p>
          <p><a href="#tdee-calculator">TDEE Calculator</a></p>
          <p><a href="#test-product">Test the Product</a></p>
        </div>
      </div>
      <div className={styles.navbarSign}>
        <p><Link to="/login_page">Sign in</Link></p>
        <button type="button"><Link to="/new_trainer">Sign up</Link></button>
      </div>
      <div className={styles.navbarMenu}>
        {toggleMenu
          ? <RiCloseLine color="#fff" size={27} onClick={() => setToggleMenu(false)} />
          : <RiMenu3Line color="#fff" size={27} onClick={() => setToggleMenu(true)} />}
        {toggleMenu && (
          <div className={`${styles.navbarMenuContainer} scale-up-center`}>
            <div className={styles.navbarMenuContainerLinks}>
              <p><a href="#features-pricing">Features & Pricing</a></p>
              <p><a href="#resources">Resources</a></p>
              <p><a href="#about-contact">About & Contact</a></p>
              <p><a href="#tdee-calculator">TDEE Calculator</a></p>
              <p><a href="#test-product">Test the Product</a></p>
            </div>
            <div className={styles.navbarMenuContainerLinksSign}>
              <p><Link to="/login_page">Sign in</Link></p>
              <button type="button"><Link to="/new_trainer">Sign up</Link></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
