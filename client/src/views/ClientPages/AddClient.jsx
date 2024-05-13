import React, { useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';

const AddClient = () => {
    const [clientForm, setClientForm] = useState({
        first_name: "",
        last_name: "",
        age: "",
        gender: "",
        occupation: "",
        email: "",
        phone_number: "",
        address: "",
        location_gym: ""
    });

    const [errors, setErrors] = useState({});
    const [warnings, setWarnings] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        // Checking for empty fields
        Object.keys(clientForm).forEach(key => {
            if (!clientForm[key].trim()) {
                tempErrors[key] = 'This field is required';
                isValid = false;
            }
        });

        // Email validation
        if (!/\S+@\S+\.\S+/.test(clientForm.email)) {
            tempErrors.email = 'Email format is invalid';
            isValid = false;
        }

        // Phone number validation
        if (!/^\d{10}$/.test(clientForm.phone_number)) {
            tempErrors.phone_number = 'Phone number must be 10 digits';
            isValid = false;
        }

        setErrors(tempErrors);
        return isValid;
    };

    const handleInputChange = (event) => {
        setClientForm({
            ...clientForm,
            [event.target.name]: event.target.value
        });
    };

    const checkExistingClient = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/check_client', {
                email: clientForm.email,
                phone_number: clientForm.phone_number,
                first_name: clientForm.first_name,
                last_name: clientForm.last_name
            });
            return response.data;
        } catch (error) {
            console.error('Error checking for existing client:', error);
            setErrors(prevErrors => ({
                ...prevErrors,
                apiError: 'Failed to check for existing client.'
            }));
            return null;  // Return null or a default object to handle error state
        }
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
    
        const existingClient = await checkExistingClient();
        if (existingClient && existingClient.exists) {
            let newErrors = {};
            if (existingClient.by_email) {
                newErrors.email = 'Email already exists';
            }
            if (existingClient.by_phone) {
                newErrors.phone_number = 'Phone number already exists';
            }
            setErrors(newErrors);
    
            if (existingClient.by_name) {
                setWarnings({
                    duplicate_name: 'A client with this name already exists. Do you want to proceed?'
                });
                return; // Stop submission to ask for user confirmation
            }
            return; // Stop submission due to errors
        }
    
        // No issues, proceed with creating the client
        try {
            const res = await axios.post('http://localhost:5000/api/add_client', clientForm, {
                withCredentials: true
            });
            console.log("Client added, ID:", res.data.client_id);
            navigate(`${res.data.client_id}/additional-services`); 
        } catch (err) {
            console.error("Error adding client:", err);
            setErrors(prevErrors => ({
                ...prevErrors,
                ...err.response?.data?.errors
            }));
        }
    };
    
    const confirmProceed = async () => {
        setWarnings({}); 
        submitHandler(); 
    };

    return (
        <div className="flex justify-center my-10 px-4">
            <form onSubmit={submitHandler} className="w-full max-w-2xl">
                <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">Add New Client</h1>
                <div className="space-y-6">
                    {Object.entries(clientForm).map(([key, value]) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-gray-900 capitalize" style={{ fontWeight: 'bold', fontSize: '15px' }} htmlFor={key}>
                                {key.replace(/_/g, ' ')}
                            </label>
                            {key === 'gender' ? (
                                <select
                                    id={key}
                                    name={key}
                                    value={value}
                                    onChange={handleInputChange}
                                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                <input
                                    type={key === 'age' || key === 'phone_number' ? 'number' : 'text'}
                                    id={key}
                                    name={key}
                                    value={value}
                                    onChange={handleInputChange}
                                    className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder={`Enter ${key.replace(/_/g, ' ')}`}
                                    required={key !== 'location_gym'}  
                                />
                            )}
                            {errors[key] && (
                                <p className="mt-2 text-sm text-red-600">{errors[key]}</p>
                            )}
                        </div>
                    ))}
                </div>
                {!warnings.duplicate_name && (
                    <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full p-2.5 text-center mt-6">
                        Add Client
                    </button>
                )}
                {warnings.duplicate_name && (
                    <div className="mt-6 text-center">
                        <p className="text-sm text-yellow-500">{warnings.duplicate_name}</p>
                        <button onClick={confirmProceed} className="mt-4 text-white bg-orange-500 hover:bg-orange-600 font-medium rounded-lg text-sm w-full p-2.5">
                            Yes, proceed
                        </button>
                    </div>
                )}
            </form>
            <Outlet />  {/* This component renders the matching child route component */}
        </div>
    );
};

export default AddClient;






