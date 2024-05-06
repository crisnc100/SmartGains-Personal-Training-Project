import React from 'react';
import styles from './HomePage.module.css'; // Import styles
import { useState } from 'react';
import Navbar from '../../../components/NavBar/NavBar.jsx';

const HomePage = () => {
    const [workoutType, setWorkoutType] = useState('strength');
    const [intensity, setIntensity] = useState(5);
    const [duration, setDuration] = useState(60);
    const [generatedPlan, setGeneratedPlan] = useState('');

    const generatePlan = () => {
        setGeneratedPlan(
            <div style={{ color: 'white', textAlign: 'center' }}>
                Generated Plan for a <strong>{workoutType}</strong> workout:
                <strong> {duration} minutes</strong> at
                <strong> intensity {intensity}</strong>.
            </div>
        );
    };

    return (
        <div>
            <Navbar />

            <div className={styles.heroSection}>
                <h1>Empower Your Fitness Journey</h1>
                <p>Manage clients and leverage AI to create personalized workout and nutrition plans.</p>
            </div>


            <div className={`description-section ${styles.descriptionSection}`}>
                <h2 className={styles.subHeaders}>About Our Project</h2>
                <p>Revolutionizing the personal training experience, our platform offers cutting-edge AI technology to create
                    personalized workout and nutrition plans tailored to each client's specific needs. With a user-friendly
                    interface, trainers can effortlessly manage their clients and seamlessly integrate AI-generated plans for a
                    truly customized fitness journey. Our innovative approach blends the precision of technology with the
                    personal touch of expert trainers, ensuring every client's goal is within reach. Join us at the forefront of
                    fitness innovation.</p>
            </div>

            <div className={`content-section ${styles.contentSection}`}>
                <h2 className={styles.subHeaders}>AI-Powered Prompt Engineering</h2>
                <p>Our platform uses advanced AI to generate personalized workout plans based on specific parameters selected by
                    trainers. This dynamic approach allows for a high level of customization, adapting plans according to
                    individual client needs and preferences.</p>
                <div className={`example-prompt ${styles.examplePrompt}`}>
                    <strong style={{color: 'red'}}>Bad Prompt:</strong> "Make a workout." 
                    <strong style={{color: '#4cd137'}}> Good Prompt:</strong> "Develop a 3-day workout plan for a 30-year-old female aiming to improve
                    strength and endurance, focusing on core, legs, and cardio, using gym equipment."
                </div>
            </div>

            <div className={`slider-container ${styles.sliderContainer}`}>
                <label htmlFor="type-slider">Workout Type:</label>
                <select id="type-slider" className={`custom-select ${styles.customSelect}`} value={workoutType} onChange={e => setWorkoutType(e.target.value)}>
                    <option value="strength">Strength</option>
                    <option value="cardio">Cardio</option>
                    <option value="flexibility">Flexibility</option>
                    <option value="balance">Balance</option>
                </select>
            </div>

            <div className={`slider-container ${styles.sliderContainer}`}>
                <label htmlFor="intensity-slider">Intensity:</label>
                <input type="range" id="intensity-slider" min="1" max="10" value={intensity} className={`slider ${styles.slider}`} onChange={e => setIntensity(e.target.value)} />
                <span>{intensity}</span>/10
            </div>

            <div className={`slider-container ${styles.sliderContainer}`}>
                <label htmlFor="duration-slider">Duration (minutes):</label>
                <input type="range" id="duration-slider" min="20" max="120" value={duration} className={`slider ${styles.slider}`} onChange={e => setDuration(e.target.value)} />
                <span>{duration}</span> mins
            </div>

            <div className={`button-container ${styles.buttonContainer}`}>
                <button className={`btn btn-primary ${styles.btnPrimary}`} onClick={generatePlan}>Generate Workout Plan</button>
            </div>
            <div id="workout-plan" className={styles.workoutPlan}>
                {generatedPlan}
                </div>

            <div className={`content-section ${styles.contentSection}`}>
                <video width="100%" controls>
                    <source src="path_to_your_video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
                <p>Watch our AI in action, crafting personalized fitness plans.</p>
            </div>

            <div className={`footer ${styles.footer}`}>
                <p>Copyright © 2023 Personal Trainer Portal</p>
            </div>
        </div>
    );
};

export default HomePage;
