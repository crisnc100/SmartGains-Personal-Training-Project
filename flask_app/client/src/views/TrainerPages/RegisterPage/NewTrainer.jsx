import React, { useState } from 'react';
import styles from './NewTrainer.module.css'; // Import styles
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import axios from 'axios';

function NewTrainer() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('')
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate('/home'); // Implement your login logic and redirect on success
    };

    return (
        <div className={styles.registerPage}>
            <div className={styles.leftContainer}>
                <header className={styles.header}>
                <Link to="/" className={styles.header}>
                    <h1>FitForge</h1>
                </Link>
                </header>
                
                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit}>
                    <div className={styles.inputContainer}>
                            <input 
                                type="firstName" 
                                placeholder="First Name" 
                                value={firstName} 
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <input 
                                type="lastName" 
                                placeholder="Last Name" 
                                value={lastName} 
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <input 
                                type="email" 
                                placeholder="Email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <input 
                                type="password" 
                                placeholder="Password"
                                value={password} 
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputContainer}>
                            <input 
                                type="password" 
                                placeholder="Confirm Password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                        <button type="submit" className={styles.registerButton}>Get Started</button>
                    </form>
                </div>
            </div>
            <div className={styles.rightContainer}>
                <div className={styles.registerMessage}>Start your journey</div>
                {/* Background image would be set in CSS */}
            </div>
        </div>
    );
}

export default NewTrainer;
