import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const AssessmentForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { clientId } = useParams();
    const { selectedAssessments } = location.state || { selectedAssessments: [] };
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});

    useEffect(() => {
        console.log("Selected Assessments:", selectedAssessments);
    }, [selectedAssessments]);

    if (!selectedAssessments.length) {
        return <div className="container mx-auto p-4">No assessments selected. Please go back and select assessments.</div>;
    }

    const handleChange = (assessmentId, field, value) => {
        setFormData(prevData => ({
            ...prevData,
            [assessmentId]: {
                ...prevData[assessmentId],
                [field]: value
            }
        }));
    };

    const handleSubmit = async () => {
        try {
            const assessmentsToSubmit = selectedAssessments.map(assessment => ({
                client_id: clientId,
                assessment_id: assessment.id,
                input_data: formData[assessment.id]
            }));
            const res = await axios.post('http://localhost:5000/api/add_assessment_for_client', { assessments: assessmentsToSubmit }, {
                withCredentials: true
            });
            console.log(res.data);
            navigate(`highlights`);
        } catch (err) {
            console.error(err);
            setErrors(prevErrors => ({
                ...prevErrors,
                ...err.response?.data?.errors
            }));
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Fill Out Assessments</h1>
            <div className="space-y-4">
                {selectedAssessments.map(assessment => (
                    <AssessmentItem 
                        key={assessment.id} 
                        assessment={assessment} 
                        formData={formData[assessment.id] || {}} 
                        handleChange={handleChange} 
                    />
                ))}
            </div>
            <button 
                className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                onClick={handleSubmit}
            >
                Submit
            </button>
        </div>
    );
};

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const AssessmentItem = ({ assessment, formData, handleChange }) => {
    const [isVisible, setIsVisible] = useState(true);

    const toggleVisibility = () => {
        setIsVisible(!isVisible);
    };

    // Parse input_fields JSON
    let inputFields = [];
    try {
        inputFields = JSON.parse(assessment.input_fields);
    } catch (error) {
        console.error("Error parsing input_fields JSON:", error);
    }

    return (
        <div className="border rounded p-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{assessment.name}</h2>
                <button 
                    className="text-sm text-blue-500" 
                    onClick={toggleVisibility}
                >
                    {isVisible ? 'Hide' : 'Show'}
                </button>
            </div>
            {isVisible && (
                <div className="mt-2 space-y-2">
                    <p>{assessment.instructions}</p>
                    {inputFields.map((field, index) => (
                        <div key={index} className="flex flex-col">
                            <label className="font-medium">{capitalizeFirstLetter(field.name)}</label>
                            <input 
                                type="text" 
                                placeholder={field.placeholder} 
                                value={formData[field.name] || ''} 
                                onChange={(e) => handleChange(assessment.id, field.name, e.target.value)}
                                className="p-2 border rounded"
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssessmentForm;
