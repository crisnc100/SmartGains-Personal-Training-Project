import React from 'react';
import Feature from '../../../components/Feature/Feature';
import styles from './WhatSmartGains.module.css';

const WhatSmartGains = () => (
  <div className={styles.whatSmartGains} id="wsg3">
    <div className={styles.heading}>
    <h1 className="gradient__text">Revolutionizing Personal Training with AI</h1>
      <p style={{color: 'white'}}>Explore the power of prompt engineering SmartGains offers</p>
    </div>
    <div className={styles.features}>
      <div className={styles.feature}>
        <Feature title="What is SmartGains" text="SmartGains is an innovative personal training platform that leverages advanced AI technology to revolutionize client management and workout plan creation. By integrating AI, we provide trainers with the tools to generate highly personalized workout and nutrition plans, ensuring each client achieves their fitness goals efficiently." />
      </div>
      <div className={styles.feature}>
        <Feature title="AI-Driven Customization" text="Our platform uses the newest OpenAI model to generate personalized workout plans based on specific parameters selected by trainers. This dynamic approach allows for a high level of customization, adapting plans according to individual client needs and preferences." />
      </div>
    </div>
    <div className={styles.promptSection}>
      <Feature title="Prompt Engineering" text="Effective prompt engineering is key to unlocking the full potential of our AI. Trainers select parameters and specific client data, which are passed into a well-developed prompt to ensure the AI receives all necessary information for optimal performance. Trainers don't have to manually type in information." />
      <div className={styles.examplePrompt}>
        <p><strong style={{color: 'red'}}>Bad Prompt:</strong> "Make a workout."</p>
        <p><strong style={{color: '#4cd137'}}>Good Prompt:</strong> "Develop a 3-day workout plan for a 30-year-old female aiming to improve strength and endurance, focusing on core, legs, and cardio, using gym equipment."</p>
      </div>
    </div>
    <div className={styles.features}>
      <div className={styles.feature}>
        <Feature title="Knowledgebase" text="Our AI is constantly learning and evolving, drawing from a vast knowledge base of fitness and nutrition information to provide the most effective and up-to-date plans." />
      </div>
      <div className={styles.feature}>
        <Feature title="Education" text="We provide trainers with the resources they need to master AI integration and prompt engineering, ensuring they can maximize the benefits for their clients." />
      </div>
    </div>
  </div>
);

export default WhatSmartGains;
