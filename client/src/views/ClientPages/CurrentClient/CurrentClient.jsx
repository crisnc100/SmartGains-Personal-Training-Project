import React, { useState, useEffect } from 'react';
import axios, { all } from 'axios';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import ClientAssessments from '../ClientAssessments';
import ClientWorkouts from '../ClientWorkouts';
import styles from './CurrentClient.module.css'
import { Tooltip } from 'react-tooltip';
import { format, differenceInYears, addMinutes } from 'date-fns';




const CurrentClient = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [allClientData, setAllClientData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editableData, setEditableData] = useState({});
    const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'personal');


    useEffect(() => {
        axios.get(`http://localhost:5000/api/current_client/${clientId}`)
            .then(response => {
                console.log("Initial data fetched:", response.data);
                setAllClientData(response.data);
                setEditableData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data');
                setLoading(false);
            });
    }, [clientId]);


    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
    }, [activeTab]);


    const calculateAge = (dob) => {
        if (!dob) return null;
        return differenceInYears(new Date(), new Date(dob));
    };
    const toggleEditMode = () => {
        if (!isEditMode) {
            setEditableData({ ...allClientData });
        }
        setIsEditMode(!isEditMode);
    };


    const cancelEditMode = () => {
        setAllClientData({ ...allClientData });
        setIsEditMode(false);
    };

    const handleInputChange = (event, section, field) => {
        const { value } = event.target;
        setEditableData(prevState => ({
            ...prevState,
            [section]: {
                ...prevState[section],
                [field]: value
            }
        }));
    };

    const handleDeletePlan = (updatedPlans, type) => {
        setAllClientData(prevData => ({
            ...prevData,
            client_demo_plans: type === 'quick-plan' ? updatedPlans : prevData.client_demo_plans,
            client_plans: type === 'custom-plan' ? updatedPlans : prevData.client_plans,
            workout_progress_data: type === 'progress-session' ? updatedPlans : prevData.workout_progress_data
        }));
    };




    const saveChanges = () => {
        console.log("Attempting to save changes:", editableData);
        axios.post(`http://localhost:5000/api/update_client_data/${clientId}`, editableData)
            .then(() => {
                console.log("Data saved successfully, updating state...");
                setAllClientData({ ...editableData });
                setEditableData({ ...editableData });
                setIsEditMode(false);
            })
            .catch(error => {
                console.error('Error updating client data', error);
            });
    };



    if (loading) return <div className="text-center">Loading...</div>;
    if (error) return <div className="text-red-500 text-center">Error: {error}</div>;

    const TabButton = ({ label, tabName }) => (
        <button
            className={`inline-block py-2 px-4 text-sm font-medium text-center rounded-md ${activeTab === tabName ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
            onClick={() => setActiveTab(tabName)}
            style={{ transition: 'background-color 0.3s, color 0.3s' }}
        >
            {label}
        </button>
    );
    const formatDateToLocal = (dateString) => {
        const date = new Date(dateString);
        const timezoneOffset = date.getTimezoneOffset();
        return addMinutes(date, timezoneOffset);
    };


    return (
        <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-center my-6" style={{ color: 'black' }}>Client Information</h1>
            <div className="text-right">
                <button
                    onClick={isEditMode ? saveChanges : toggleEditMode}
                    className={`py-2 px-4 font-semibold rounded-lg border-2 ${isEditMode ? 'border-green-500 hover:bg-green-500 text-green-500 hover:text-white' : 'border-blue-500 hover:bg-blue-500 text-blue-500 hover:text-white'} transition-all duration-300 ease-in-out`}
                >
                    {isEditMode ? "Save Changes" : "Edit Information"}
                </button>
                {isEditMode && (
                    <button
                        onClick={cancelEditMode}
                        className="ml-2 py-2 px-4 font-semibold rounded-lg border-2 border-gray-500 text-gray-500 hover:bg-gray-500 hover:text-white transition-all duration-300 ease-in-out"
                    >
                        Cancel
                    </button>
                )}
            </div>

            <div className="flex" style={{ color: 'black' }}>
                <div className="w-1/4 bg-white shadow-lg rounded-lg p-6 mr-6">
                    <h3 className="text-xl font-bold mb-4">Basic Info</h3>
                    <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                        <span className={styles.label}>Name:</span>
                        {isEditMode ? (
                            <>
                                <input
                                    type="text"
                                    value={allClientData.client_data.first_name ? editableData.client_data.first_name : ''}
                                    onChange={(e) => handleInputChange(e, 'client_data', 'first_name')}
                                    className={styles.editableField}
                                />
                                <input
                                    type="text"
                                    value={editableData.client_data ? editableData.client_data.last_name : ''}
                                    onChange={(e) => handleInputChange(e, 'client_data', 'last_name')}
                                    className={styles.editableField}
                                />
                            </>) : (
                            ` ${allClientData.client_data.first_name} ${allClientData.client_data.last_name}`)}</p>
                    <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                        <span className={styles.label}>Email:</span>
                        {isEditMode ? (
                            <input
                                type="text"
                                value={allClientData.client_data.email ? editableData.client_data.email : ''}
                                onChange={(e) => handleInputChange(e, 'client_data', 'email')}
                                className={styles.editableField}
                            />) : (` ${allClientData.client_data.email}`)}</p>
                    <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                        <span className={styles.label}>Date of Birth:</span>
                        {isEditMode ? (
                            <input
                                type="date"
                                value={editableData.client_data.dob ? editableData.client_data.dob : ''}
                                onChange={(e) => handleInputChange(e, 'client_data', 'dob')}
                                className={styles.editableField}
                            />
                        ) : (
                            <>
                                {allClientData.client_data.dob ? format(formatDateToLocal(allClientData.client_data.dob), 'MMMM d, yyyy') : ''} 
                                {allClientData.client_data.dob && ` (${calculateAge(allClientData.client_data.dob)} years old)`}
                            </>
                        )}
                    </p>
                    <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                        <span className={styles.label}>Gender:</span>
                        {isEditMode ? (
                            <input
                                type="text"
                                value={allClientData.client_data.gender ? editableData.client_data.gender : ''}
                                onChange={(e) => handleInputChange(e, 'client_data', 'gender')}
                                className={styles.editableField}
                            />) : (` ${allClientData.client_data.gender}`)}</p>
                    <div className="flex flex-col space-y-4 mt-4 relative">

                        <div className="flex space-x-4">
                            <NavLink
                                to="create-quick-plan"
                                className="group box-border relative inline-flex items-center whitespace-nowrap justify-center w-auto px-2 py-2 overflow-hidden text-sm text-white font-bold bg-green-500 hover:bg-green-700 rounded-md cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none"
                                data-tooltip-id="quick3dayplan"
                                data-tooltip-content="Generate a 3-day workout plan quickly using predefined prompts tailored to the client's level."
                                data-tooltip-place="bottom"
                            >
                                <svg className="w-4 h-4 mr-1 fill-current text-white" viewBox="0 0 24 24">
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Quick Plan
                            </NavLink>

                            <NavLink
                                to="create-custom-plan"
                                className="group box-border relative inline-flex items-center justify-center whitespace-nowrap w-auto px-2 py-2 overflow-hidden text-sm text-white font-bold bg-blue-500 hover:bg-blue-700 rounded-md cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none"
                                data-tooltip-id="customplan"
                                data-tooltip-content="Create a personalized workout plan by selecting specific parameters to tailor the plan to your client's needs."
                                data-tooltip-place="bottom"
                            >
                                <svg className="w-4 h-4 mr-1 fill-current text-white" viewBox="0 0 24 24">
                                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                Custom Plan
                            </NavLink>
                        </div>

                        <NavLink
                            to="record-workout"
                            className="group box-border relative inline-flex items-center justify-center whitespace-nowrap w-auto px-2 py-2 overflow-hidden text-sm text-orange-500 font-bold border border-orange-500 hover:bg-orange-500 hover:text-white rounded-md cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none"
                            data-tooltip-id="recordworkout"
                            data-tooltip-content="Log the details of a client's workout session, including exercises, sets, and reps."
                            data-tooltip-place="bottom"
                        >
                            <svg className="w-4 h-4 mr-1 fill-current text-white" viewBox="0 0 24 24">

                                <path d="M5 13l4 4L19 7" />
                            </svg>
                            Record Workout
                        </NavLink>

                        {/* Created a <Tooltip /> elements and set the id prop */}
                        <Tooltip style={{ width: '200px', fontSize: '12px' }} id="quick3dayplan" />
                        <Tooltip style={{ width: '200px', fontSize: '12px' }} id="customplan" />
                        <Tooltip style={{ width: '200px', fontSize: '12px' }} id="recordworkout" />
                    </div>
                </div>
                <div className="w-3/4 bg-white shadow-lg rounded-lg p-6">
                    <div className="border-b border-gray-200">
                        <div className="mb-4 flex space-x-2 overflow-x-auto">
                            <TabButton label="Personal Details" tabName="personal" />
                            <TabButton label="Exercise Intake" tabName="exercise" />
                            <TabButton label="Medical History" tabName="medical" />
                            <TabButton label="Assessments" tabName="assessments" />
                            <TabButton label="Workouts" tabName="workout" />
                            <TabButton label="Nutrition" tabName="nutrition" />
                        </div>
                    </div>
                    <div className="mt-4">
                        {activeTab === 'personal' && <div>
                            <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                <span className={styles.label}>Phone Number:</span>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={allClientData.client_data.phone_number ? editableData.client_data.phone_number : ''}
                                        onChange={(e) => handleInputChange(e, 'client_data', 'phone_number')}
                                        className={styles.editableField}
                                    />) : (
                                    ` ${allClientData.client_data.phone_number}`)}</p>
                            <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                <span className={styles.label}>Home Address:</span>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={allClientData.client_data.address ? editableData.client_data.address : ''}
                                        onChange={(e) => handleInputChange(e, 'client_data', 'address')}
                                        className={styles.editableField}
                                    />) : (
                                    ` ${allClientData.client_data.address}`)}</p>
                            <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                <span className={styles.label}>Location Gym:</span>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={allClientData.client_data.location_gym ? editableData.client_data.location_gym : ''}
                                        onChange={(e) => handleInputChange(e, 'client_data', 'location_gym')}
                                        className={styles.editableField}
                                    />) : (
                                    ` ${allClientData.client_data.location_gym}`)} </p>
                            <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                <span className={styles.label}>Occupation:</span>
                                {isEditMode ? (
                                    <input
                                        type="text"
                                        value={allClientData.client_data.occupation ? editableData.client_data.occupation : ''}
                                        onChange={(e) => handleInputChange(e, 'client_data', 'occupation')}
                                        className={styles.editableField}
                                    />) : (
                                    ` ${allClientData.client_data.occupation}`)}</p>
                        </div>}
                        {activeTab === 'exercise' && (
                            <div>
                                {!allClientData.consultation_data || Object.keys(allClientData.consultation_data).length === 0 ? (
                                    <div>
                                        <p>No data is available</p>
                                        <div>
                                            <NavLink
                                                to='intake-form'
                                                className="group box-border relative inline-flex items-center whitespace-nowrap 
                                                justify-center w-auto px-2 py-2 overflow-hidden text-sm text-white font-bold bg-blue-500 
                                                hover:bg-blue-700 rounded-md cursor-pointer shadow-lg hover:shadow-xl transform 
                                                hover:translate-y-1 transition-all duration-300 ease-out focus:outline-none">
                                                Add Intake Form
                                            </NavLink>
                                        </div>

                                    </div>
                                ) : (
                                    <>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Prior Exercise Programs:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.prior_exercise_programs || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'prior_exercise_programs')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.prior_exercise_programs}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Exercise Habits:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.exercise_habits || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'exercise_habits')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.exercise_habits}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Exercise Time of Day:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.exercise_time_day || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'exercise_time_day')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.exercise_time_day}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Fitness Level Rating:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.self_fitness_level || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'self_fitness_level')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.self_fitness_level}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Fitness Goals:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.fitness_goals || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'fitness_goals')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.fitness_goals}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Current Motivations:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.motivation || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'motivation')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.motivation}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Progress Measurement:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.progress_measurement || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'progress_measurement')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.progress_measurement}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Barriers and Challenges:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.barriers_challenges || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'barriers_challenges')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.barriers_challenges}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Areas of Improvement:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.area_specifics || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'area_specifics')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.area_specifics}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Exercise Likes:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.exercise_likes || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'exercise_likes')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.exercise_likes}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Exercise Dislikes:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.exercise_dislikes || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'exercise_dislikes')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.exercise_dislikes}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Warm Up Routine:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.warm_up_info || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'warm_up_info')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.warm_up_info}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Cool Down Routine:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.cool_down_info || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'cool_down_info')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.cool_down_info}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Stretching and Mobility Routine:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.stretching_mobility || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'stretching_mobility')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.stretching_mobility}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Daily Water Intake:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.daily_water_intake || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'daily_water_intake')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.daily_water_intake}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Daily Routine:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.daily_routine || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'daily_routine')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.daily_routine}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Stress Levels:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.stress_level || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'stress_level')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.stress_level}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Smoking and Alcohol Habits:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.smoking_alcohol_habits || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'smoking_alcohol_habits')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.smoking_alcohol_habits}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Hobbies:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.consultation_data.hobbies || ''}
                                                    onChange={(e) => handleInputChange(e, 'consultation_data', 'hobbies')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.consultation_data.hobbies}`
                                            )}
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                        {activeTab === 'medical' && (
                            <div>
                                {!allClientData.history_data || Object.keys(allClientData.history_data).length === 0 ? (
                                    <div>
                                        <p>No data is available</p>
                                        <div>
                                            <NavLink
                                                to='medical-history'
                                                className="group box-border relative inline-flex items-center whitespace-nowrap 
                                                    justify-center w-auto px-2 py-2 overflow-hidden text-sm text-white font-bold bg-blue-500 
                                                    hover:bg-blue-700 rounded-md cursor-pointer shadow-lg hover:shadow-xl transform 
                                                    hover:translate-y-1 transition-all duration-300 ease-out focus:outline-none">
                                                Add Medical History
                                            </NavLink>
                                        </div>

                                    </div>

                                ) : (
                                    <>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Existing Conditions:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.history_data.existing_conditions || ''}
                                                    onChange={(e) => handleInputChange(e, 'history_data', 'existing_conditions')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.history_data.existing_conditions}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Medications:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.history_data.medications || ''}
                                                    onChange={(e) => handleInputChange(e, 'history_data', 'medications')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.history_data.medications}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Past Surgeries or Injuries:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.history_data.surgeries_or_injuries || ''}
                                                    onChange={(e) => handleInputChange(e, 'history_data', 'surgeries_or_injuries')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.history_data.surgeries_or_injuries}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Allergies:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.history_data.allergies || ''}
                                                    onChange={(e) => handleInputChange(e, 'history_data', 'allergies')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.history_data.allergies}`
                                            )}
                                        </p>
                                        <p className='mb-1' style={isEditMode ? { backgroundColor: '#ffffe0' } : {}}>
                                            <span className={styles.label}>Family History Conditions:</span>
                                            {isEditMode ? (
                                                <input
                                                    type="text"
                                                    value={editableData.history_data.family_history || ''}
                                                    onChange={(e) => handleInputChange(e, 'history_data', 'family_history')}
                                                    className={styles.editableField}
                                                />
                                            ) : (
                                                ` ${allClientData.history_data.family_history}`
                                            )}
                                        </p>
                                    </>
                                )}
                            </div>
                        )}
                        {activeTab === 'assessments' &&
                            <ClientAssessments
                                clientAssessmentData = {editableData.client_assessment_data}
                            />
                        }
                        {activeTab === 'workout' && <ClientWorkouts
                            clientId={clientId}
                            clientDemoPlans={allClientData.client_demo_plans || []}
                            clientPlans={allClientData.client_plans}
                            workoutProgressData={allClientData.workout_progress_data}
                            onDeletePlan={handleDeletePlan}
                        />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CurrentClient;
