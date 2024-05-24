import React, { useState } from 'react';
import axios from 'axios';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

const BeginnerAssessment = () => {
    const { clientId } = useParams(); 
    const [balanceTests, setBalanceTests] = useState([]);
    const [beginnerForm, setBeginnerForm] = useState({
        client_id: clientId,
        basic_technique: "",
        chair_sit_to_stand: "",
        arm_curl: "",
        cardio_test: ""
    });

    const addBalanceTest = () => {
        if (balanceTests.length === 0) { // Only add balance tests once
            setBalanceTests([
                { type: 'Narrow Stance', result: '' },
                { type: 'Tandem Stance', result: '' },
                { type: 'Single-Leg', result: '' }
            ]);
        }
    };

    const handleBalanceChange = (index, value) => {
        const updatedTests = balanceTests.map((test, i) => {
            if (i === index) {
                return { ...test, result: value };
            }
            return test;
        });
        setBalanceTests(updatedTests);
    };

    const questionLabels = {
        basic_technique: () => (<span><strong>Observe Movement Techniques:</strong> Bodyweight squats, Push-ups, Row, Planks</span>),
        chair_sit_to_stand: () => (<span><strong>Chair Sit-to-Stand Test:</strong> Number of times the client can stand up from a chair and sit back down in 30 seconds</span>),
        arm_curl: () => (<span><strong>Arm Curl Test:</strong> Measure the number of times of arm curls the client can perform with a lightweight dumbbell in 30 seconds</span>),
        balance_test_results: () => (<span><strong>Balance Assessments:</strong> Conduct simple balance exercises such as standing on one leg, with eyes open and closed, or tandem stance (heel-to-toe) for 30 seconds each</span>),
        cardio_test: () => (<span><strong>Cardio Assessment:</strong> Assess cardiovascular fitness with low-impact aerobic exercises.</span>)
    };

    const renderInputField = (key) => {
        if (key === 'client_id') {
            return null; 
        }
        if (key === 'cardio_test') {
            return (
                <textarea
                    id={key}
                    name={key}
                    value={beginnerForm[key]}
                    onChange={(e) => setBeginnerForm({ ...beginnerForm, [e.target.name]: e.target.value })}
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
                value={beginnerForm[key]}
                onChange={(e) => setBeginnerForm({ ...beginnerForm, [e.target.name]: e.target.value })}
                className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
            />
        );
    };

    const [errors, setErrors] = useState({});
    const [warnings, setWarnings] = useState({});
    const navigate = useNavigate();

    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        // Checking for empty fields
        Object.keys(beginnerForm).forEach(key => {
            if (key === 'client_id') return;
            if (!beginnerForm[key].trim()) {
                tempErrors[key] = 'This field is required';
                isValid = false;
            }
        });



        setErrors(tempErrors);
        return isValid;
    };

    const handleInputChange = (event) => {
        setBeginnerForm({
            ...beginnerForm,
            [event.target.name]: event.target.value
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        const balanceTestResultsStr = balanceTests.map(test => `${test.type}: ${test.result}`).join(', ');
        

        const formData = {
            ...beginnerForm,
            balance_tests: balanceTestResultsStr
        };


        try {
            const res = await axios.post('http://localhost:5000/api/add_beginner_assessment', formData, {
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
                <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6" style={{ fontSize: '35px' }}>Beginner Assessment</h1>
                <div className="space-y-6">
                    {Object.entries(beginnerForm).map(([key, value]) => (
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
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-900 capitalize no-transform" style={{ fontSize: '15px', textTransform: 'none' }}>
                            {questionLabels.balance_test_results()}
                        </label>
                        <button type="button" onClick={addBalanceTest} className="text-white bg-green-500 hover:bg-green-700 font-medium rounded-lg text-sm px-4 py-2">
                            Add Balance Results
                        </button>
                        {balanceTests.map((test, index) => (
                            <div key={index} className="mt-2">
                                <label className="block text-sm font-medium text-gray-900">{test.type}</label>
                                <input
                                    type="text"
                                    value={test.result}
                                    onChange={(e) => handleBalanceChange(index, e.target.value)}
                                    className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder={`Enter ${test.type} result`}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full p-2.5 text-center mt-6">
                    View Client Highlights
                </button>
            </form>
        </div>
    );
};

export default BeginnerAssessment;