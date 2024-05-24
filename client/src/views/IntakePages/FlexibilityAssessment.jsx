import React, { useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

const FlexibilityAssessment = () => {
    const { clientId } = useParams(); 
    const navigate = useNavigate();
    const [flexibilityForm, setFlexibilityForm] = useState({
        client_id: clientId,
        shoulder_flexibility: "",
        lower_body_flexibility: "",
        joint_mobility: ""
    });

    const questionLabels = {
        shoulder_flexibility: () => (
            <span> <strong>Shoulder Flexibility:</strong> Perform the "reach behind the back" test to assess shoulder range of motion.</span>
        ),
        lower_body_flexibility: () => (
            <span> <strong>Lower Body Flexibility:</strong> Conduct seated or standing hamstring stretches, hip stretches, and calf stretches to assess lower body flexibility.</span>
        ),
        joint_mobility: () => (
            <span> <strong>Joint Mobility:</strong> Observe joint mobility during simple movements like shoulder circles, hip circles, and ankle circles.</span>
        )
    };

    const renderInputField = (key) => {
        if (key === 'client_id') {
            return null; 
        }
        return (
            <input
                type="text"
                id={key}
                name={key}
                value={flexibilityForm[key]}
                onChange={handleInputChange}
                className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
            />
        );
    }

    const [errors, setErrors] = useState({});
    const [warnings, setWarnings] = useState({});


    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        // Checking for empty fields
        Object.keys(flexibilityForm).forEach(key => {
            if (key === 'client_id') return;
            if (!flexibilityForm[key].trim()) {
                tempErrors[key] = 'This field is required';
                isValid = false;
            }
        });



        setErrors(tempErrors);
        return isValid;
    };


    const handleInputChange = (event) => {
        setFlexibilityForm({
            ...flexibilityForm,
            [event.target.name]: event.target.value
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }


        try {
            const res = await axios.post('http://localhost:5000/api/add_flexibility_assessment', flexibilityForm, {
                withCredentials: true
            });
            console.log(res.data);
            navigate(`/trainer_dashboard/add_client/${clientId}/additional-services/intake-form/assessment-choice`);
        } catch (err) {
            console.error(err);
            setErrors(prevErrors => ({
                ...prevErrors,
                ...err.response?.data?.errors
            }));
        }
    };

    return (
        <div>
            <div className="flex justify-end space-x-2 mt-4">
                <button onClick={() => navigate(-1)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
                    Return Back
                </button>
        </div>
        <div className="flex justify-center my-10 px-4">
            <form onSubmit={submitHandler} className="w-full max-w-2xl">
                <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">Flexibility Assessment</h1>
                <div className="space-y-6">
                    {Object.entries(flexibilityForm).map(([key, value]) => (
                        <div key={key} className="form-group">
                            {key !== 'client_id' && ( 
                                <label className="block text-sm font-medium text-gray-900 capitalize no-transform" style={{ fontSize: '15px', textTransform: 'none' }} htmlFor={key}>
                                    {questionLabels[key] ? questionLabels[key]() : `No label defined for ${key}`}
                                </label>
                            )}
                            {renderInputField(key)}
                            {errors[key] && (
                                <p className="mt-2 text-sm text-red-600">{errors[key]}</p>
                            )}
                        </div>
                    ))}
                </div>
                <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full p-2.5 text-center mt-6">
                    Continue
                </button>
            </form>
        </div>
        </div>
    );
};

export default FlexibilityAssessment