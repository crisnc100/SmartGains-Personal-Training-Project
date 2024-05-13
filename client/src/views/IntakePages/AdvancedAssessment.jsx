import React, { useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

const AdvancedAssessment = () => {
    const navigate = useNavigate();
    const { clientId } = useParams(); 
    const [strengthMax, setStrengthMax] = useState([]);
    const [advancedForm, setAdvancedForm] = useState({
        client_id: clientId,
        advanced_technique: "",
        strength_endurance: "",
        circuit: "",
        moderate_cardio: ""
    });

    const addStrengthMax = () => {
        if (strengthMax.length === 0) {
            setStrengthMax([
                { type: 'Squat', result: '' },
                { type: 'Bench', result: '' },
                { type: 'Deadlift', result: '' },
                { type: 'Overhead Press', result: '' }
            ]);
        }
    };

    const handleStrengthChange = (index, value) => {
        const updatedTests = strengthMax.map((test, i) => {
            if (i === index) {
                return { ...test, result: value };
            }
            return test;
        });
        setStrengthMax(updatedTests);
    };
    const questionLabels = {
        advanced_technique: "Evaluate the client's technique during these lifts to ensure proper form and minimize the risk of injury. Focus on key technical points such as posture, joint alignment, and movement patterns.",
        strength_endurance: "Strength Endurance Test: Bench Press (75%)/Push-up/Squat",
        circuit: "Perform a circuit training routine consisting of bodyweight squats, push-ups, rows, lunges, planks, and burpees, with each exercise lasting for one minute.",
        moderate_cardio: "Cardiovascular Endurance Test: Choose a cardiovascular activity such as cycling, rowing, or running and assess the client's ability to maintain a moderate intensity for 10-15 minutes"
    };

    const renderInputField = (key) => {
        if (key === 'client_id') {
            return null; // Do not render anything for client_id
        }
        if (key === 'advanced_technique' || key === 'moderate_cardio') {
            return (
                <textarea
                    id={key}
                    name={key}
                    value={advancedForm[key]}
                    onChange={(e) => setAdvancedForm({ ...advancedForm, [e.target.name]: e.target.value })}
                    className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
                    rows="4"
                />
            );
        }
        return (
            <input
                type="text"
                id={key}
                name={key}
                value={advancedForm[key]}
                onChange={(e) => setAdvancedForm({ ...advancedForm, [e.target.name]: e.target.value })}
                className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
            />
        );
    };

    const [errors, setErrors] = useState({});
    const [warnings, setWarnings] = useState({});

    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        // Checking for empty fields
        Object.keys(advancedForm).forEach(key => {
            if (key === 'client_id') return;
            if (!advancedForm[key].trim()) {
                tempErrors[key] = 'This field is required';
                isValid = false;
            }
        });



        setErrors(tempErrors);
        return isValid;
    };

    const handleInputChange = (event) => {
        setAdvancedForm({
            ...advancedForm,
            [event.target.name]: event.target.value
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        const strengthMaxResultsStr = strengthMax.map(test => `${test.type}: ${test.result}`).join(', ');

        const formData = {
            ...advancedForm,
            strength_max: strengthMaxResultsStr
        };

        try {
            const res = await axios.post('http://localhost:5000/api/add_advanced_assessment', formData, {
                withCredentials: true
            });
            console.log(res.data);
            navigate(`/trainer_dashboard/add_client/${clientId}/additional-services/intake-form/client-highlights`);
        } catch (err) {
            console.error(err);
            setErrors(prevErrors => ({
                ...prevErrors,
                ...err.response?.data?.errors
            }));
        }
    };


    return (
        <div className="flex justify-center my-10 px-4">
            <form onSubmit={submitHandler}>
                <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6" style={{ fontSize: '35px' }}>Advanced Assessment</h1>
                <div className="space-y-6">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-900 capitalize no-transform" style={{ fontSize: '15px', textTransform: 'none' }} htmlFor="advanced_technique">
                            {questionLabels.advanced_technique}
                        </label>
                        {renderInputField('advanced_technique')}
                    </div>
                    <div className="form-group">
                        <button type="button" onClick={addStrengthMax} className="text-white bg-green-500 hover:bg-green-700 font-medium rounded-lg text-sm px-4 py-2">
                            Add Exercise
                        </button>
                        {strengthMax.map((test, index) => (
                            <div key={index} className="mt-2">
                                <label className="block text-sm font-medium text-gray-900">{test.type}</label>
                                <input
                                    type="text"
                                    value={test.result}
                                    onChange={(e) => handleStrengthChange(index, e.target.value)}
                                    className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder={`Enter ${test.type} result`}
                                />
                            </div>
                        ))}
                    </div>
                    {['strength_endurance', 'circuit', 'moderate_cardio'].map((key) => (
                        <div key={key} className="form-group">
                            <label className="block text-sm font-medium text-gray-900 capitalize no-transform" style={{ fontSize: '15px', textTransform: 'none' }} htmlFor={key}>
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
                    View Client Highlights
                </button>
            </form>
        </div>
    );
};

export default AdvancedAssessment;