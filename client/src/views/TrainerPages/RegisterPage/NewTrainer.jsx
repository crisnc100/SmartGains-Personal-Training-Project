import React, { useState } from 'react';
import styles from './NewTrainer.module.css';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../../contexts/UserContext';

function NewTrainer() {
    const { updateUser } = useUser();
    const [trainerForm, setTrainerForm] = useState({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        confirm_password: ""
    });
    const [errors, setErrors] = useState({});
    const [warnings, setWarnings] = useState({});
    const navigate = useNavigate();

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setTrainerForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        // Checking for required field and minimum length
        ['first_name', 'last_name', 'email', 'password', 'confirm_password'].forEach(key => {
            if (!trainerForm[key].trim()) {
                tempErrors[key] = 'This field is required';
                isValid = false;
            } else if ((key === 'first_name' || key === 'last_name') && trainerForm[key].length < 3) {
                tempErrors[key] = 'Must be at least 3 characters';
                isValid = false;
            }
        });

        // Email validation
        if (!/\S+@\S+\.\S+/.test(trainerForm.email)) {
            tempErrors.email = 'Email format is invalid';
            isValid = false;
        }

        // Password validation
        if (trainerForm.password.length < 8) {
            tempErrors.password = 'Password must be at least 8 characters';
            isValid = false;
        }

        // Confirm password validation
        if (trainerForm.confirm_password !== trainerForm.password) {
            tempErrors.confirm_password = 'Passwords must match';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const checkExistingTrainer = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/check_trainer', {
                email: trainerForm.email,
                first_name: trainerForm.first_name,
                last_name: trainerForm.last_name
            });
            return response.data;
        } catch (error) {
            console.error('Error checking for existing trainer:', error);
            setErrors(prevErrors => ({
                ...prevErrors,
                apiError: 'Failed to check for existing trainer.'
            }));
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
    
        const existingTrainer = await checkExistingTrainer();
        if (existingTrainer.email_exists || existingTrainer.name_exists) {
            let newWarnings = {};
            if (existingTrainer.email_exists) {
                setErrors(prev => ({ ...prev, email: 'Email already exists' }));
            }
            if (existingTrainer.name_exists) {
                newWarnings.duplicate_name = 'A trainer with this name already exists. Do you want to proceed?';
            }
            setWarnings(newWarnings);
            return;
        }
    
        try {
            const res = await axios.post('http://localhost:5000/api/register_trainer', trainerForm, {
                withCredentials: true
            });
            if (res.data.trainer_id) {
                console.log("Trainer added, ID:", res.data.trainer_id);
                navigate(`/new_trainer/${res.data.trainer_id}/success/create-profile`);
            }
        } catch (err) {
            console.error("Error adding trainer:", err);
            setErrors(prevErrors => ({
                ...prevErrors,
                ...err.response?.data?.errors
            }));
        }
    };

    return (
        <div className={styles.registerPage}>
            <div className={styles.leftContainer}>
                <header className={styles.header}>
                    <Link to="/" className={styles.header}>
                        <h1>SmartGains</h1>
                    </Link>
                </header>
                <div className={styles.formContainer}>
                    <form onSubmit={handleSubmit}>
                        {Object.keys(trainerForm).map((key) => (
                            <div className={styles.inputContainer} key={key}>
                                <input
                                    type={key.includes('password') ? 'password' : 'text'}
                                    name={key}
                                    placeholder={key.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    value={trainerForm[key]}
                                    onChange={handleInputChange}
                                />
                                {errors[key] && <p className={styles.error}>{errors[key]}</p>}
                            </div>
                        ))}
                        <button type="submit" className={styles.registerButton}>Get Started</button>
                    </form>
                    {warnings.duplicate_name && (
                        <div className={styles.warning}>
                            <p style={{color: 'red'}}>{warnings.duplicate_name}</p>
                            <button style={{color: 'green'}} onClick={() => navigate(`/new_trainer/${res.data.trainer_id}/success/create-profile`)}>Proceed Anyway</button>
                        </div>
                    )}
                </div>
            </div>
            <div className={styles.rightContainer}>
                <div className={styles.registerMessage}>Start your journey</div>
            </div>
        </div>
    );
}

export default NewTrainer;
