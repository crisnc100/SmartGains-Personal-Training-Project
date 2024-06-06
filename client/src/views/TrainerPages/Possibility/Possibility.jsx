import React from 'react';
import possibilityImage from '../../../assets/possibility.png';
import styles from './Possibility.module.css';

const Possibility = () => (
  <div className={styles.possibility} id="possibility">
    <div className={styles.possibilityImage}>
      <img src={possibilityImage} alt="possibility" />
    </div>
    <div className={styles.possibilityContent}>
      <h4>Join the Revolution</h4>
      <h1 className="gradient__text">Achieve Unimaginable Results with <br /> AI Technology</h1>
      <p>
        Discover the future of personal training with SmartGains. Our advanced AI-driven platform revolutionizes how trainers create and manage workout and nutrition plans.
      </p>
      <div className={styles.testimonials}>
        <div className={styles.testimonial}>
          <p>"SmartGains has completely transformed my approach to training. The AI-generated plans are spot on and save me so much time!"</p>
          <h5>— Jane Doe, Personal Trainer</h5>
        </div>
        <div className={styles.testimonial}>
          <p>"Thanks to SmartGains, my clients are seeing better results faster. The platform is incredibly easy to use."</p>
          <h5>— John Smith, Fitness Coach</h5>
        </div>
      </div>
      <button className={styles.requestButton} type="button">Join Now</button>
    </div>
  </div>
);

export default Possibility;
