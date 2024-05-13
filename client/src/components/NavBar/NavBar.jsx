import React from 'react';
import styles from './Navbar.module.css'; 

const Navbar = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.brand}><a href="/">SmartGains</a></div>
      <div className={styles.navItems}>
        <a href="/login_page" className={styles.navLink}>Sign in</a>
        <a href="/new_trainer" className={styles.navLink}>Register</a>
      </div>
    </nav>
  );
};

export default Navbar;