import React from 'react';
import people from '../../../assets/people.png';
import headerphoto1 from '../../../assets/headerphoto1.png';
import styles from './Header.module.css';

const Header = () => (
  <div className={styles.header} id="home">
    <div className={styles.headerContent}>
      <h1 className="gradient__text">Empower Your Fitness Journey</h1>
      <p>
        Revolutionizing personal training with cutting-edge AI technology, SmartGains creates personalized workout and
        nutrition plans tailored to each client's specific needs. Effortlessly manage clients and seamlessly integrate AI-generated plans for a truly customized fitness journey. Start your personalized fitness journey today!
      </p>
      <div className={styles.headerContentInput}>
        <button type="button">Get Started</button>
      </div>
      
      <div className={styles.headerContentPeople}>
        <img src={people} alt="people" />
        <p>1,000+ trainers joined</p>
      </div>
    </div>
    <div className={styles.headerImage}>
      <img src={headerphoto1} alt="AI" />
    </div>
  </div>
);

export default Header;
