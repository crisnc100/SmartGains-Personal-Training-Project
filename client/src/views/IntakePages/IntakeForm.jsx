import React, { useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

const IntakeForm = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();

    const goBack = () => {
        navigate(-1);
    };
    const [intakeForm, setIntakeForm] = useState({
        client_id: clientId,
        prior_exercise_programs: "",
        exercise_habits: "",
        fitness_goals: "",
        progress_measurement: "",
        area_specifics: "",
        exercise_likes: "",
        exercise_dislikes: "",
        diet_description: "",
        dietary_restrictions: "",
        processed_food_consumption: "",
        daily_water_intake: "",
        daily_routine: "",
        stress_level: "",
        smoking_alcohol_habits: "",
        hobbies: ""
    });

    const questionLabels = {
        prior_exercise_programs: "Have you participated in any fitness programs or worked with a personal trainer before? Please describe.",
        exercise_habits: "What are your current exercise habits? (Include frequency, duration, and types of exercise)",
        fitness_goals: "What are your fitness goals? (e.g., weight loss, muscle gain, improved endurance)",
        progress_measurement: "How do you prefer to measure progress in your fitness journey?",
        area_specifics: "Are there specific areas of your body you want to focus on?",
        exercise_likes: "What types of exercise do you enjoy most?",
        exercise_dislikes: "Are there any types of exercise you dislike or avoid?",
        diet_description: "Describe your typical daily diet (including meals, snacks, and beverages).",
        dietary_restrictions: "Do you have any dietary restrictions or preferences? (e.g., vegetarian, gluten-free)",
        processed_food_consumption: "How often do you eat out or consume processed foods?",
        daily_water_intake: "What are your hydration habits? How much water do you typically drink in a day?",
        daily_routine: "Describe your typical daily routine, including your work schedule, sleep patterns, and stress levels.",
        stress_level: "On a scale of 1 to 10, how would you rate your stress levels?",
        smoking_alcohol_habits: "Do you smoke or consume alcohol? If yes, how frequently?",
        hobbies: "What are your hobbies or activities you enjoy outside of work?"
    };

    const renderInputField = (key) => {

        if (key === 'client_id') {
            return null; // Do not render anything for client_id
        }
        if (key === 'stress_level') {
            return (
                <div className="flex justify-between">
                    {Array.from({ length: 10 }, (_, i) => i + 1).map(value => (
                        <label key={value} className="inline-flex flex-col items-center" style={{ color: 'black' }}>
                            <span className="text-sm">{value}</span> 
                            <input
                                type="radio"
                                name={key}
                                value={value}
                                checked={intakeForm[key] === String(value)}
                                onChange={handleInputChange}
                                className="form-radio mt-1"
                            />
                        </label>
                    ))}
                </div>
            );
        } else if (key === 'diet_description' || key === 'daily_routine') {
            return (
                <textarea
                    name={key}
                    id={key}
                    onChange={handleInputChange}
                    value={intakeForm[key]}
                    className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
                    rows="3"
                />
            );
        } else {
            return (
                <input
                    type="text"
                    id={key}
                    name={key}
                    value={intakeForm[key]}
                    onChange={handleInputChange}
                    className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
                />
            );
        }
    };


    const [errors, setErrors] = useState({});
    const [warnings, setWarnings] = useState({});

    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        // Checking for empty fields
        Object.keys(intakeForm).forEach(key => {
            if (key === 'client_id') return;
            if (typeof intakeForm[key] !== 'string' || !intakeForm[key].trim()) {
                tempErrors[key] = 'This field is required';
                isValid = false;
            }
        });

        setErrors(tempErrors);
        return isValid;
    };

    const handleInputChange = (event) => {
        setIntakeForm({
            ...intakeForm,
            [event.target.name]: event.target.value
        });
    };


    const submitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            console.log('Validation failed', errors);
            return;
        }

        try {
            console.log("Sending data:", intakeForm);
            const res = await axios.post('http://localhost:5000/api/add_consultation', intakeForm, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log("Response Data:", res.data);
            navigate('medical-history'); 
        } catch (err) {
            console.error("Submission error:", err);
            if (err.response) {
                console.error("Error response data:", err.response.data);
                console.error("Error status:", err.response.status);
                setErrors(prevErrors => ({
                    ...prevErrors,
                    ...err.response.data.errors, 
                }));
            } else {
              
                setErrors(prevErrors => ({
                    ...prevErrors,
                    general: 'An unexpected error occurred. Please try again.'
                }));
            }
        }
    };
    return (
        <div>
            <div className="flex justify-end space-x-2 mt-4">
                <button onClick={() => navigate(-1)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
                    Return Back
                </button>
            </div>
            <div className="flex justify-center my-2 px-4">
                <form onSubmit={submitHandler} className="w-full max-w-2xl">
                    <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">Consultation Intake Form</h1>
                    <div className="space-y-6">
                        {Object.entries(intakeForm).map(([key, value]) => (
                            <div key={key} className="form-group">
                                <label className="block text-sm font-medium text-gray-900 capitalize no-transform" style={{ fontWeight: 'bold', fontSize: '15px', textTransform: 'none' }} htmlFor={key}>
                                    {questionLabels[key]}
                                </label>
                                {renderInputField(key)}
                                {errors[key] && (
                                    <p className="mt-2 text-sm text-red-600">{errors[key]}</p>
                                )}
                            </div>
                        ))}
                    </div>
                    <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full p-2.5 text-center mt-6">
                        Continue to Medical History
                    </button>
                </form>
            </div>
        </div>
    );
};

export default IntakeForm;