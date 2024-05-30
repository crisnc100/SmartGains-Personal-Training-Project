import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const MedicalHistory = () => {
    const { clientId } = useParams();
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const [medicalForm, setMedicalForm] = useState({
        client_id: clientId,
        existing_conditions: { answer: "no", details: "" },
        medications: { answer: "no", details: "" },
        surgeries_or_injuries: { answer: "no", details: "" },
        allergies: { answer: "no", details: "" },
        family_history: { answer: "no", details: "" }
    });

    const questionLabels = {
        existing_conditions: "Do you have any medical conditions or physical limitations that should be considered? If yes, please specify:",
        medications: "Are you currently taking any medications that affect your physical activity or energy levels? If yes, please list them:",
        surgeries_or_injuries: "Have you had any surgeries or injuries in the past? If yes, please provide details:",
        allergies: "Are you allergic to any medications or foods? If yes, please specify:",
        family_history: "Do you have a family history of any medical conditions? If yes, please specify:"
    };

    const handleYesNoChange = (event, key) => {
        const { value } = event.target;
        setMedicalForm((prevState) => ({
            ...prevState,
            [key]: {
                ...prevState[key],
                answer: value
            }
        }));
    };

    const handleDetailsChange = (event, key) => {
        const { value } = event.target;
        setMedicalForm((prevState) => ({
            ...prevState,
            [key]: {
                ...prevState[key],
                details: value
            }
        }));
    };

    const renderInputField = (key) => {
        if (key === 'client_id') return null; // Exclude client_id from rendering

        return (
            <div className="flex flex-col" style={{color: 'black'}}>
                <div className="flex items-center">
                    <label className="inline-flex items-center mr-4">
                        <input
                            type="radio"
                            name={key}
                            value="yes"
                            checked={medicalForm[key].answer === 'yes'}
                            onChange={(e) => handleYesNoChange(e, key)}
                            className="form-radio"
                            aria-label="Yes"
                        />
                        <span className="ml-2">Yes</span>
                    </label>
                    <label className="inline-flex items-center">
                        <input
                            type="radio"
                            name={key}
                            value="no"
                            checked={medicalForm[key].answer === 'no'}
                            onChange={(e) => handleYesNoChange(e, key)}
                            className="form-radio"
                            aria-label="No"
                        />
                        <span className="ml-2">No</span>
                    </label>
                </div>
                {medicalForm[key].answer === 'yes' && (
                    <input
                        type="text"
                        name={key}
                        value={medicalForm[key].details}
                        onChange={(e) => handleDetailsChange(e, key)}
                        className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 mt-2 focus:border-blue-500 focus:ring-blue-500"
                        aria-label={`Details for ${questionLabels[key]}`}
                    />
                )}
            </div>
        );
    };

    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        Object.keys(medicalForm).forEach(key => {
            if (key === 'client_id') return;
            if (medicalForm[key].answer === 'yes' && !medicalForm[key].details.trim()) {
                tempErrors[key] = 'Details are required for this field';
                isValid = false;
            }
        });

        setErrors(tempErrors);
        return isValid;
    };

    const handleInputChange = (event) => {
        setMedicalForm({
            ...medicalForm,
            [event.target.name]: event.target.value
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            const res = await axios.post('http://localhost:5000/api/add_medical_history', medicalForm, {
                withCredentials: true
            });
            console.log(res.data);
            navigate(`/trainer_dashboard/add_client/${clientId}/additional-services/intake-form/intake-options`);
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
            <form onSubmit={submitHandler} className="w-full max-w-2xl">
                <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">Medical History</h1>
                <div className="space-y-6">
                    {Object.entries(medicalForm).map(([key, value]) => (
                        key !== 'client_id' && (
                            <div key={key} className="form-group">
                                <label className="block text-sm font-medium text-gray-900 capitalize no-transform" style={{ fontWeight: 'bold', fontSize: '15px', textTransform: 'none' }} htmlFor={key}>
                                    {questionLabels[key]}
                                </label>
                                {renderInputField(key)}
                                {errors[key] && (
                                    <p className="mt-2 text-sm text-red-600">{errors[key]}</p>
                                )}
                            </div>
                        )
                    ))}
                </div>
                <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full p-2.5 text-center mt-6">
                    Continue
                </button>
            </form>
        </div>
    );
};

export default MedicalHistory;
