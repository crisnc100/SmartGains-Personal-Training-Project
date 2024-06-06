import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Outlet } from 'react-router-dom';

const AddClient = () => {
    const [clientForm, setClientForm] = useState({
        first_name: "",
        last_name: "",
        dob: "",
        gender: "",
        occupation: "",
        email: "",
        phone_number: "",
        street_address: "",
        city: "",
        state: "",
        zip_code: "",
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
            }, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error checking for existing client:', error);
            setErrors(prevErrors => ({
                ...prevErrors,
                apiError: 'Failed to check for existing client.'
            }));
            return null;
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

        // Combine address fields into one address field
        const combinedAddress = `${clientForm.street_address}, ${clientForm.city}, ${clientForm.state}, ${clientForm.zip_code}`;

        // No issues, proceed with creating the client
        try {
            const res = await axios.post('http://localhost:5000/api/add_client', {
                ...clientForm,
                address: combinedAddress
            }, {
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
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-900" htmlFor="first_name">First Name</label>
                        <input
                            type="text"
                            id="first_name"
                            name="first_name"
                            value={clientForm.first_name}
                            onChange={handleInputChange}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            required
                        />
                        {errors.first_name && <p className="mt-2 text-sm text-red-600">{errors.first_name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900" htmlFor="last_name">Last Name</label>
                        <input
                            type="text"
                            id="last_name"
                            name="last_name"
                            value={clientForm.last_name}
                            onChange={handleInputChange}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            required
                        />
                        {errors.last_name && <p className="mt-2 text-sm text-red-600">{errors.last_name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900" htmlFor="dob">Date of Birth</label>
                        <input
                            type="date"
                            id="dob"
                            name="dob"
                            value={clientForm.dob}
                            onChange={handleInputChange}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            required
                        />
                        {errors.dob && <p className="mt-2 text-sm text-red-600">{errors.dob}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900" htmlFor="gender">Gender</label>
                        <select
                            id="gender"
                            name="gender"
                            value={clientForm.gender}
                            onChange={handleInputChange}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            required
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                        {errors.gender && <p className="mt-2 text-sm text-red-600">{errors.gender}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900" htmlFor="occupation">Occupation</label>
                        <input
                            type="text"
                            id="occupation"
                            name="occupation"
                            value={clientForm.occupation}
                            onChange={handleInputChange}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            required
                        />
                        {errors.occupation && <p className="mt-2 text-sm text-red-600">{errors.occupation}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900" htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={clientForm.email}
                            onChange={handleInputChange}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            required
                        />
                        {errors.email && <p className="mt-2 text-sm text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900" htmlFor="phone_number">Phone Number</label>
                        <input
                            type="tel"
                            id="phone_number"
                            name="phone_number"
                            value={clientForm.phone_number}
                            onChange={handleInputChange}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            placeholder="Enter phone number"
                            required
                        />
                        {errors.phone_number && <p className="mt-2 text-sm text-red-600">{errors.phone_number}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900" htmlFor="street_address">Street Address</label>
                        <input
                            type="text"
                            id="street_address"
                            name="street_address"
                            value={clientForm.street_address}
                            onChange={handleInputChange}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            placeholder="Enter street address"
                            required
                        />
                        {errors.street_address && <p className="mt-2 text-sm text-red-600">{errors.street_address}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900" htmlFor="city">City</label>
                        <input
                            type="text"
                            id="city"
                            name="city"
                            value={clientForm.city}
                            onChange={handleInputChange}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            placeholder="Enter city"
                            required
                        />
                        {errors.city && <p className="mt-2 text-sm text-red-600">{errors.city}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900" htmlFor="state">State</label>
                        <input
                            type="text"
                            id="state"
                            name="state"
                            value={clientForm.state}
                            onChange={handleInputChange}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            placeholder="Enter state"
                            required
                        />
                        {errors.state && <p className="mt-2 text-sm text-red-600">{errors.state}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900" htmlFor="zip_code">Zip Code</label>
                        <input
                            type="text"
                            id="zip_code"
                            name="zip_code"
                            value={clientForm.zip_code}
                            onChange={handleInputChange}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            placeholder="Enter zip code"
                            required
                        />
                        {errors.zip_code && <p className="mt-2 text-sm text-red-600">{errors.zip_code}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900" htmlFor="location_gym">Location Gym</label>
                        <input
                            type="text"
                            id="location_gym"
                            name="location_gym"
                            value={clientForm.location_gym}
                            onChange={handleInputChange}
                            className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5"
                            placeholder="Enter gym location"
                        />
                        {errors.location_gym && <p className="mt-2 text-sm text-red-600">{errors.location_gym}</p>}
                    </div>
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
            <Outlet />
        </div>
    );
};

export default AddClient;
