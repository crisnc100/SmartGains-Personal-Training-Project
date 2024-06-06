import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Resources.module.css';

const Resources = () => (
  <div className={styles.resources} id="resources">
    <div className={styles.resourcesHeading}>
      <h1 className="gradient__text">Explore Our Resources</h1>
      <p>Access a wealth of knowledge to enhance your training and nutrition plans.</p>
    </div>
    <div className={styles.resourcesContainer}>
      <Link to="/resources/fitness-training" className={styles.card}>
        <h3>Fitness Training</h3>
      </Link>
      <Link to="/resources/ai-technology" className={styles.card}>
        <h3>AI Technology in Fitness</h3>
      </Link>
      <Link to="/resources/nutrition-planning" className={styles.card}>
        <h3>Nutrition and Diet Planning</h3>
      </Link>
      <Link to="/resources/prompt-engineering" className={styles.card}>
        <h3>Prompt Engineering</h3>
      </Link>
      <Link to="/resources/client-management" className={styles.card}>
        <h3>Client Management</h3>
      </Link>
      <Link to="/resources/platform-tutorials" className={styles.card}>
        <h3>Platform Tutorials</h3>
      </Link>
    </div>
  </div>
);

export default Resources;
