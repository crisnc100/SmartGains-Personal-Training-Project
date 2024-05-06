import React, { useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate, useParams } from 'react-router-dom';


const MedicalHistory = () => {
    const { clientId } = useParams(); // This captures the client ID from the URL
    const [errors, setErrors] = useState({});
    const [warnings, setWarnings] = useState({});
    const navigate = useNavigate();
    const [medicalForm, setMedicalForm] = useState({
        client_id: clientId,
        existing_conditions: "",
        medications: "",
        surgeries_or_injuries: "",
        allergies: "",
        family_history: ""
    });

    const questionLabels = {
        existing_conditions: "Do you have any medical conditions or physical limitations that should be considered? If yes, please specify:",
        medications: "Are you currently taking any medications that affects your physical acitivity or energy levels? If yes, please list them:",
        surgeries_or_injuries: "Have you had any surgeries or injuries in the past? If yes, please provide details:",
        allergies: "Are you allergic to any medications or foods, If yes, please specify:",
        family_history: "Do you have family history of any medical conitions? If yes, please specify:"
    };

    const renderInputField = (key) => {
        if (key === 'client_id') {
            return null; // Do not render anything for client_id
        }
        return (
            <input
                type="text"
                id={key}
                name={key}
                value={medicalForm[key]}
                onChange={handleInputChange}
                className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
            />
        );
    }



    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;
  
        // Checking for empty fields
        Object.keys(medicalForm).forEach(key => {
            if (key === 'client_id') return;
            if (!medicalForm[key].trim()) {
                tempErrors[key] = 'This field is required';
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
              Continue
          </button>
      </form>
  </div>
);
};

export default MedicalHistory;