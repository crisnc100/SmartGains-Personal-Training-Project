import React, { useState } from 'react';
import styles from './LoginPage.module.css'; // Import styles
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Link } from 'react-router-dom';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        let tempErrors = {};
        if (!email) {
            tempErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            tempErrors.email = "Email address is invalid.";
        }
        if (!password) {
            tempErrors.password = "Password is required.";
        }

        setErrors(tempErrors);

        if (Object.keys(tempErrors).length > 0) return; // Stop here if there are errors

        try {
            const response = await axios.post(
                'http://localhost:5000/api/login_trainer',
                { email, password },
                { withCredentials: true }
            );
            if (response.data.success) {
                navigate('/trainer_dashboard'); // Navigate to dashboard on successful login
            } else {
                setErrors({ [response.data.field]: response.data.error_message });
            }
        } catch (error) {
            console.error('Login failed:', error);
            setErrors({ global: "An unexpected error occurred." });
        }
    };

    return (
        <div className={styles.loginPage}>
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
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            {errors.email && <div style={{ color: 'red' }}>{errors.email}</div>}

                        </div>
                        <div className={styles.inputContainer}>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            {errors.password && <div style={{ color: 'red' }}>{errors.password}</div>}

                        </div>
                        <button type="submit" className={styles.signInButton}>Sign In</button>
                        {errors.global && <div style={{ color: 'red', fontWeight: 'bold' }}>{errors.global}</div>}
                        <div className={styles.options}>
                            <Link to="/forgot_password">Forgot password?</Link>
                            <Link to="/new_trainer">Create new account</Link>
                        </div>
                    </form>
                </div>
            </div>
            <div className={styles.rightContainer}>
                <div className={styles.welcomeBack}>Welcome back</div>
                {/* Background image would be set in CSS */}
            </div>
        </div>
    );
}

export default LoginForm;
