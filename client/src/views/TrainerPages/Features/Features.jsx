import React from 'react';
import { Feature } from '../../../components';
import styles from './Features.module.css';

const featuresData = [
  { title: 'Client Management', text: 'Efficiently manage all your clients with our intuitive platform.' },
  { title: 'Workout Plan Generator', text: 'Generate personalized workout plans using advanced AI algorithms.' },
  { title: 'Nutrition Plan Generator', text: 'Create detailed nutrition plans tailored to individual needs.' },
  { title: 'AI Integration', text: 'Leverage AI to enhance your training methods and client results.' },
];

const Features = () => (
  <div className={styles.features} id="features">
    <div className={styles.featuresHeading}>
      <h1 className="gradient__text">The Future of Personal Training</h1>
      <p style={{color: 'white'}}>Explore the powerful features of SmartGains</p>
    </div>
    <div className={styles.featuresContainer}>
      {featuresData.map((item, index) => (
        <Feature title={item.title} text={item.text} key={index} />
      ))}
    </div>
  </div>
);

export default Features;
