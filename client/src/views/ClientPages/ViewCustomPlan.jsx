import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import FeedbackModal from './FeedbackModal';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

const ViewCustomPlan = () => {
    const { planId, clientId } = useParams();
    const [generatedPlan, setGeneratedPlan] = useState({});
    const [error, setError] = useState('');
    const [editableData, setEditableData] = useState({});
    const [loading, setLoading] = useState(true);
    const [isEditMode, setIsEditMode] = useState(false);
    const navigate = useNavigate();
    const [emailSending, setEmailSending] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [isUseMode, setIsUseMode] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [currentProgress, setCurrentProgress] = useState({});
    const [visibleInputs, setVisibleInputs] = useState({});
    const [intensity, setIntensity] = useState('Moderate');
    const [exercisesText, setExercisesText] = useState('');
    const [exerciseLogs, setExerciseLogs] = useState([]);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/get_generated_plan/${planId}`)
            .then(response => {
                const planData = response.data;
                console.log('Fetched plan data:', planData);
                setGeneratedPlan(planData);
                setEditableData(planData);
                const exercises = getExercisesFromPlanDetails(planData.generated_plan_details);

                setExercisesText(exercises.exercisesText);
                setExerciseLogs(exercises.exerciseLogs);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data');
                setLoading(false);
            });
    }, [planId]);


    const getExercisesFromPlanDetails = (planDetails) => {
        if (!planDetails) {

            return { warmUp: [], exercises: [] };
        }

        const lines = planDetails.split('\n');
        const warmUp = [];
        const exercises = [];
        let currentSection = null;
        let currentExercise = null;

        lines.forEach((line, index) => {
            const isWarmUpSection = /## Warm-Up/i.test(line);
            const isExerciseLine = /(\d+\.\s|\*\*Exercise|\*\*Exercise:)/i.test(line);
            const isDetailLine = /(\*\*Sets|\*\*Reps|\*\*Rest|\*\*Alternative|\*\*Intensity)/i.test(line);
            const isEndSection = /## Main Workout|## Cool Down|### Notes/i.test(line);

            if (isWarmUpSection) {
                currentSection = 'warmUp';
            } else if (isEndSection) {
                currentSection = null;
                if (currentExercise) {
                    exercises.push(currentExercise);
                    currentExercise = null;
                }
            }

            if (currentSection === 'warmUp') {
                warmUp.push(line);
            } else {
                if (isExerciseLine) {
                    if (currentExercise) {
                        exercises.push(currentExercise);
                    }
                    currentExercise = { text: line, details: [], index };
                } else if (currentExercise && isDetailLine) {
                    currentExercise.details.push(line);
                }
            }
        });

        if (currentExercise) {
            exercises.push(currentExercise);
        }


        return { warmUp, exercises };
    };

    const generateCombinedText = () => {
        const { exercises } = getExercisesFromPlanDetails(generatedPlan.generated_plan_details);
        let combinedText = '';
    
        exercises.forEach((exercise, index) => {
            combinedText += exercise.text + '\n';
            combinedText += exercise.details.join('\n') + '\n';
            combinedText += `**Weight:** ${currentProgress[exercise.index]?.weight || ''}\n`;
            combinedText += `**Notes:** ${currentProgress[exercise.index]?.notes || ''}\n\n`;
        });
    
        return combinedText.trim(); // Trim to remove any trailing new lines
    };

    const handleCombinedTextChange = (value) => {
        const lines = value.split('\n');
        const newExercises = [];
        let currentExercise = { text: '', details: [] };
        let currentIndex = -1;
    
        lines.forEach(line => {
            if (line.startsWith('**Weight:**')) {
                currentProgress[currentIndex].weight = line.replace('**Weight:** ', '');
            } else if (line.startsWith('**Notes:**')) {
                currentProgress[currentIndex].notes = line.replace('**Notes:** ', '');
            } else if (/^\d+\.\s|\*\*Exercise|\*\*Exercise:/i.test(line)) {
                if (currentExercise.text) {
                    newExercises.push(currentExercise);
                }
                currentIndex++;
                currentExercise = { text: line, details: [] };
            } else {
                currentExercise.details.push(line);
            }
        });
    
        if (currentExercise.text) {
            newExercises.push(currentExercise);
        }
    
        setExerciseLogs(newExercises);
        setCurrentProgress({ ...currentProgress }); // Ensure the state is updated with the new progress
    };
    
    


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

    const checkPinStatus = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/api/check_pin_status/${planId}`);
            return response.data.is_pinned;
        } catch (error) {
            console.error("Failed to check pin status:", error);
            return false;
        }
    };
    
    const enterUseMode = async () => {
        try {
            const isPinned = await checkPinStatus();
    
            if (!isPinned) {
                const response = await axios.post(`http://localhost:5000/api/pin_plan_for_today/${planId}`);
                if (!response.data.success) {
                    alert(response.data.message);
                    return;
                }
            }
    
            const exercises = getExercisesFromPlanDetails(generatedPlan.generated_plan_details);
            console.log('Exercises in Use Mode:', exercises);
            setExerciseLogs(exercises.exerciseLogs);
            setIsUseMode(true);
        } catch (error) {
            console.error("Failed to pin the plan for today:", error);
            alert("Failed to pin the plan for today.");
        }
    };
    
    const exitUseMode = () => setIsUseMode(false);

    const logProgress = (exerciseIndex, field, value) => {
        setCurrentProgress(prevState => ({
            ...prevState,
            [exerciseIndex]: {
                ...prevState[exerciseIndex],
                [field]: value
            }
        }));
        console.log('Current Progress:', currentProgress); // Debug log
    };

    const openCompleteModal = () => setShowCompleteModal(true);
    const closeCompleteModal = () => setShowCompleteModal(false);


    const markAsCompleted = async () => {
        try {
            const { exercises } = getExercisesFromPlanDetails(generatedPlan.generated_plan_details);
            const progress = exercises.map((exercise, index) => ({
                exercise: exercise.text,
                weight: currentProgress[exercise.index]?.weight || '',
                notes: currentProgress[exercise.index]?.notes || '',
            }));

            await axios.post(`http://localhost:5000/api/mark_plan_completed/${clientId}/${planId}`, {
                plan_type: 'generated',
                progress,
            });

            setShowCompleteModal(false);
            navigate(`/trainer_dashboard/all_clients/${clientId}/current-client`);
        } catch (error) {
            console.error('Failed to mark the plan as completed:', error);
            alert('Failed to mark the plan as completed.');
        }
    };



    const toggleVisibility = (index) => {
        setVisibleInputs(prevState => ({
            ...prevState,
            [index]: !prevState[index]
        }));
    };

    return (
        <div className="bg-white shadow-md rounded-lg p-6" style={{ color: 'black' }}>
            {isUseMode ? (
                <>
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Today's Session</h1>
                    <div className="text-lg font-semibold text-gray-700 mb-2">
                        Client: <span className="font-normal">{generatedPlan.client_first_name} {generatedPlan.client_last_name}</span>
                    </div>
                    <div className="flex space-x-2">
                        <button onClick={exitUseMode} className="px-4 py-2 border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white transition-colors duration-300 ease-in-out rounded">
                            Exit Use Mode
                        </button>
                        <button onClick={isEditMode ? saveChanges : toggleEditMode} className="px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors duration-300 ease-in-out rounded">
                            {isEditMode ? 'Save Changes' : 'Edit Plan'}
                        </button>
                        {isEditMode && (
                            <button onClick={cancelEditMode} className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300 ease-in-out rounded">
                                Cancel
                            </button>
                        )}
                    </div>
                    <div className="mt-4 bg-gray-100 p-4 rounded">
                        <h2 className="text-gray-800 font-semibold mb-2">Workout Details:</h2>
                        <div className="text-gray-600 whitespace-pre-wrap">
                            {isEditMode ? (
                                <textarea
                                    rows="25"
                                    value={editableData.generated_plan_details}
                                    onChange={(e) => setEditableData({
                                        ...editableData,
                                        generated_plan_details: e.target.value  // Update editableData on change
                                    })}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                ></textarea>
                            ) : (
                                // Ensure `getExercisesFromPlanDetails` is called correctly
                                (() => {
                                    const { warmUp, exercises } = getExercisesFromPlanDetails(generatedPlan.generated_plan_details);
                                    return (
                                        <>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">Warm-Up:</h3>
                                            {warmUp.map((line, index) => (
                                                <div key={index} className="ml-4 text-gray-600">
                                                    {line}
                                                </div>
                                            ))}
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">Main Workout:</h3>
                                            {exercises.map((exercise, index) => {
                                                const isVisible = visibleInputs[index] || false;
                                                return (
                                                    <div key={index} className="mb-4">
                                                        <div>{exercise.text}</div>
                                                        {exercise.details.map((detail, detailIndex) => (
                                                            <div key={detailIndex} className="ml-4 text-gray-600">
                                                                {detail}
                                                            </div>
                                                        ))}
                                                        {isUseMode && (
                                                            <div>
                                                                {isVisible ? (
                                                                    <div className="flex space-x-2 mt-2">
                                                                        <textarea
                                                                            value={currentProgress[exercise.index]?.weight || ''}
                                                                            placeholder="Weight"
                                                                            onChange={(e) => logProgress(exercise.index, 'weight', e.target.value)}
                                                                            className="w-1/4 p-2 border rounded"
                                                                        />
                                                                        <textarea
                                                                            value={currentProgress[exercise.index]?.notes || ''}
                                                                            placeholder="Notes"
                                                                            onChange={(e) => logProgress(exercise.index, 'notes', e.target.value)}
                                                                            className="w-full p-2 border rounded"
                                                                        />
                                                                        <button onClick={() => toggleVisibility(index)} className="text-red-500 hover:text-red-700 transition-colors duration-300 ease-in-out">
                                                                            Remove
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button onClick={() => toggleVisibility(index)} className="text-blue-500 hover:text-blue-700 transition-colors duration-300 ease-in-out mt-2">
                                                                        Add Log
                                                                    </button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </>
                                    );
                                })()
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <button onClick={openCompleteModal} className="px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors duration-300 ease-in-out rounded">
                            Mark as Completed
                        </button>
                    </div>
                </>
            ) : (
                <>
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
                                    {!isUseMode ? (
                                        <button onClick={enterUseMode} className="px-4 py-2 border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-white transition-colors duration-300 ease-in-out rounded">
                                            Use for Today's Session
                                        </button>
                                    ) : (
                                        <button onClick={exitUseMode} className="px-4 py-2 border border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white transition-colors duration-300 ease-in-out rounded">
                                            Exit Use Mode
                                        </button>
                                    )}
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
                                    <div className="text-gray-600 whitespace-pre-wrap">
                                        {generatedPlan.generated_plan_details.split('\n').map((line, index) => (
                                            <div key={index}>{line}</div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {showFeedbackModal && <FeedbackModal planId={planId} onClose={closeFeedbackModal} />}
                </>
            )}
            {showCompleteModal && (
                <Modal
                    open={showCompleteModal}
                    onClose={closeCompleteModal}
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                >
                    <div className="bg-white p-8 rounded shadow-lg max-h-screen overflow-y-auto max-w-lg mx-auto my-4">
                        <h2 className="text-xl font-bold mb-4">Mark Plan as Completed</h2>
                        <form>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Workout Name</label>
                                <input
                                    type="text"
                                    value={editableData.generated_plan_name}
                                    readOnly
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Date Completed</label>
                                <input
                                    type="date"
                                    value={new Date().toISOString().split('T')[0]}
                                    readOnly
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Duration (minutes)</label>
                                <input
                                    type="number"
                                    defaultValue={60}
                                    readOnly
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Intensity Level</label>
                                <FormControl fullWidth>
                                    <InputLabel id="intensity-label"></InputLabel>
                                    <Select
                                        labelId="intensity-label"
                                        value={intensity}
                                        readOnly
                                    >
                                        <MenuItem value="Low">Low</MenuItem>
                                        <MenuItem value="Moderate">Moderate</MenuItem>
                                        <MenuItem value="High">High</MenuItem>
                                    </Select>
                                </FormControl>
                            </div>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Exercises:</label>
                                <textarea
                                    value={generateCombinedText()}
                                    onChange={(e) => handleCombinedTextChange(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    rows={20} // Adjust the number of rows as necessary
                                />
                            </div>


                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Trainer Notes</label>
                                <textarea
                                    rows="4"
                                    placeholder="Enter any additional notes..."
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    onChange={(e) => logProgress('trainerNotes', 'notes', e.target.value)}
                                ></textarea>
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={markAsCompleted}
                                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Log Session
                                </button>
                                <button
                                    type="button"
                                    onClick={closeCompleteModal}
                                    className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                >
                                    Exit
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}
        </div>
    );

};

export default ViewCustomPlan;
