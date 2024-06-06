import React from 'react';
import styles from './Feature.module.css';

const Feature = ({ title, text }) => (
  <div className={styles.feature}>
    <div className={styles.featureTitle}>
      <div />
      <h1>{title}</h1>
    </div>
    <div className={styles.featureText}>
      <p>{text}</p>
    </div>
  </div>
);

export default Feature;
