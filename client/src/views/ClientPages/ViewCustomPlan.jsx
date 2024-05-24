import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; 
import FeedbackModal from './FeedbackModal';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';

const ViewCustomPlan = () => {
    const { planId } = useParams();
    const { clientId } = useParams();
    const [generatedPlan, setGeneratedPlan] = useState({});
    const [error, setError] = useState('');
    const [editableData, setEditableData] = useState({});
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();
    const [emailSending, setEmailSending] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);



    useEffect(() => {
        axios.get(`http://localhost:5000/api/get_generated_plan/${planId}`)
            .then(response => {
                setGeneratedPlan(response.data);
                setEditableData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data');
                setLoading(false);
            });
    }, [planId]);

    const toggleEditMode = () => {
        if (!isEditMode) {
            setEditableData({ ...generatedPlan });
        }
        setIsEditMode(!isEditMode);
    };

    const cancelEditMode = () => {
        setIsEditMode(false);
        setEditableData(generatedPlan);
    };

    const handleInputChange = (event) => {
        const { value } = event.target;
        setEditableData(prevState => ({
            ...prevState,
            generated_plan_name: value
        }));
    };

    const sendEmail = () => {
        setEmailSending(true);
        axios.post('http://localhost:5000/api/email_plan_to_client', {
            client_id: clientId,
            generated_plan_details: generatedPlan.generated_plan_details
        })
            .then(response => {
                alert('Email sent successfully!');
                setEmailSending(false);
            })
            .catch(error => {
                const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
                console.error('Failed to send email:', errorMessage);
                alert('Failed to send email: ' + errorMessage);
                setEmailSending(false);
            });
    };
    const openFeedbackModal = () => setShowFeedbackModal(true);
    const closeFeedbackModal = () => setShowFeedbackModal(false);


    const saveChanges = () => {
        axios.post(`http://localhost:5000/api/update_client_generated_plan/${planId}`, {
            name: editableData.generated_plan_name,
            generated_plan_details: editableData.generated_plan_details
        })
            .then(response => {
                console.log("Attempting to update with response:", response.data);

                setGeneratedPlan({ ...editableData });
                setIsEditMode(false);
            })
            .catch(error => {
                console.error("Failed to update the workout plan", error.response ? error.response.data : "No response");
                setError("Failed to update the workout plan: " + (error.response ? error.response.data.message : "No response data"));

                setIsEditMode(true);
            });
    };


    return (
        <div className="bg-white shadow-md rounded-lg p-6" style={{ color: 'black' }}>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Workout Details:</h1>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div>
                    <div className="text-lg font-semibold text-gray-700 mb-2">
                        Client: <span className="font-normal">{generatedPlan.client_first_name} {generatedPlan.client_last_name}</span>
                    </div>
                    <div className="text-lg font-semibold text-gray-700 mb-2">
                        Plan Name: {isEditMode ? (
                            <input
                                type="text"
                                value={editableData.generated_plan_name}
                                onChange={(e) => handleInputChange(e, 'generated_plan_name')}
                                className="ml-2 p-1 border rounded"
                            />
                        ) : (
                            <span className="font-normal">{editableData.generated_plan_name}</span>
                        )}
                    </div>
                    <div className="text-lg font-semibold text-gray-700">
                        Plan Date: <span className="font-normal">{new Date(generatedPlan.generated_plan_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <div>
                            <Tooltip title="Rating helps improve the quality of future plans!" placement="top" arrow>
                                <Button onClick={openFeedbackModal} variant="contained" color="primary">
                                    Rate This Plan
                                </Button>
                            </Tooltip>
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={isEditMode ? saveChanges : toggleEditMode} className="px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out rounded">
                                {isEditMode ? 'Save Changes' : 'Edit Plan'}
                            </button>
                            {isEditMode && (
                                <button onClick={cancelEditMode} className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300 ease-in-out rounded">
                                    Cancel
                                </button>
                            )}
                            <button onClick={sendEmail} disabled={emailSending} className="px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors duration-300 ease-in-out rounded">
                                {emailSending ? 'Sending...' : 'Email to Client'}
                            </button>

                            <button onClick={() => navigate(-1)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
                                Return Back
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 bg-gray-100 p-4 rounded">
                        <h2 className="text-gray-800 font-semibold mb-2">Workout Details:</h2>
                        {isEditMode ? (
                            <textarea
                                rows="20"
                                value={editableData.generated_plan_details}  
                                onChange={(e) => setEditableData({
                                    ...editableData,
                                    generated_plan_details: e.target.value  // Update editableData on change
                                })}
                                className="w-full p-2 border rounded"
                            />
                        ) : (
                            <p className="text-gray-600 whitespace-pre-wrap">{generatedPlan.generated_plan_details}</p>
                        )}
                    </div>
                    {showFeedbackModal && <FeedbackModal planId={planId} onClose={closeFeedbackModal} />}
                </div>
            )}
        </div>
    );
};

export default ViewCustomPlan;
