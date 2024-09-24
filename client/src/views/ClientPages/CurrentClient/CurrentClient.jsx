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
    const [expandedForms, setExpandedForms] = useState({});



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
    const toggleFormExpansion = (formId) => {
        setExpandedForms(prevState => ({
            ...prevState,
            [formId]: !prevState[formId]
        }));
    };

    const capitalizeFirstLetter = (string) => {
        return string
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const handleDeletePlan = (updatedPlans, type) => {
        setAllClientData(prevData => ({
            ...prevData,
            client_demo_plans: type === 'quick-plan' ? updatedPlans : prevData.client_demo_plans,
            client_plans: type === 'custom-plan' ? updatedPlans : prevData.client_plans,
            workout_progress_data: type === 'progress-session' ? updatedPlans : prevData.workout_progress_data
        }));
    };

    const handleDeleteForm = (formId) => {
        if (window.confirm("Are you sure you want to delete this intake form? This action cannot be undone.")) {
            axios.delete(`http://localhost:5000/api/delete_intake_form/${formId}`)
                .then(response => {
                    if (response.data.success) {
                        console.log(`Form with ID ${formId} deleted successfully.`);
                        // Remove the deleted form from both allClientData and editableData states
                        const updatedIntakeForms = allClientData.intake_forms.filter(form => form.id !== formId);
                        setAllClientData(prevData => ({
                            ...prevData,
                            intake_forms: updatedIntakeForms
                        }));
                        setEditableData(prevData => ({
                            ...prevData,
                            intake_forms: updatedIntakeForms
                        }));
                    } else {
                        console.error(`Failed to delete form: ${response.data.message}`);
                    }
                })
                .catch(error => {
                    console.error('Error deleting form:', error);
                });
        }
    };


    const handleCreateUpdatedForm = (formId) => {
        const formIndex = allClientData.intake_forms.findIndex(form => form.id === formId);
        if (formIndex !== -1) {
            const currentForm = allClientData.intake_forms[formIndex];
    
            // Count existing updated forms to append the right number
            const updatedFormCount = allClientData.intake_forms.filter(form => form.form_type.startsWith('Updated Consultation')).length;
    
            const updatedForm = {
                ...currentForm,
                id: null, // New form ID will be created
                created_at: new Date(),
                status: 'draft', // Reset status to draft
                form_type: `Updated Consultation - ${updatedFormCount + 1}`, // Generate distinct name
                client_id: clientId,
                answers: currentForm.answers.map(answer => ({ ...answer, answer: '' })) // Reset answers
            };
    
            // Add new form to the backend and state
            axios.post(`http://localhost:5000/api/current_client/${clientId}/new_form`, updatedForm)
                .then(response => {
                    setAllClientData(prevData => ({
                        ...prevData,
                        intake_forms: [...prevData.intake_forms, response.data] // Add new form
                    }));
    
                    // Navigate to the new form with mode=update
                    navigate(`intake-form?mode=update&formId=${response.data.id}`);
                })
                .catch(error => {
                    console.error('Error creating updated form:', error);
                });
        }
    };
    
    const handleFinishDraftForm = (formId) => {
        const formIndex = allClientData.intake_forms.findIndex(form => form.id === formId);
        if (formIndex !== -1) {
            const form = allClientData.intake_forms[formIndex];

            // Collect the necessary data: form ID, client ID, and answers
            const submissionData = {
                form_id: form.id,
                client_id: clientId,
                answers: form.answers
            };

            // Send this data to the backend (without updating the status)
            navigate(`intake-form?mode=finish&formId=${formId}`);

        }
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
                                {(!allClientData.intake_forms || allClientData.intake_forms.length === 0) ? (
                                    <div className="text-center">
                                        <p className="text-gray-600">No data is available</p>
                                        <NavLink
                                            to='intake-form'
                                            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white font-bold rounded-md shadow hover:bg-blue-700 transition duration-300"
                                        >
                                            Add Intake Form
                                        </NavLink>
                                    </div>
                                ) : (
                                    allClientData.intake_forms.map((form, formIndex) => {
                                        const isLatestForm = formIndex === allClientData.intake_forms.length - 1;

                                        return (
                                            <div key={form.id} className="mb-6">
                                                <div
                                                    className={`p-4 cursor-pointer flex justify-between items-center rounded-t-md ${form.status === 'draft' ? 'bg-yellow-100' : 'bg-green-100'}`}
                                                    onClick={() => toggleFormExpansion(form.id)}
                                                >
                                                    <h3 className="font-bold text-xl">{capitalizeFirstLetter(form.form_type)}</h3>
                                                    <p className='text-xl'>{format(new Date(form.created_at), 'MM-dd-yyyy')}</p>
                                                    <span className={`text-sm ${form.status === 'draft' ? 'text-yellow-600' : 'text-green-600'}`}>
                                                        {form.status === 'draft' ? 'Draft' : 'Completed'}
                                                    </span>
                                                </div>
                                                {isEditMode && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent collapsing the form when clicking delete
                                                            handleDeleteForm(form.id);
                                                        }}
                                                        className="py-1 px-2 font-semibold rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 ease-in-out"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                                {expandedForms[form.id] && (
                                                    <div className="p-4 bg-white rounded-b-md shadow-md">
                                                        {/* Answers rendering */}
                                                        {form.answers.map((answer, answerIndex) => (
                                                            <div key={answer.id} className="mb-4 p-2 border rounded-md bg-gray-50">
                                                                <p className="font-semibold text-gray-700 mb-1">{answer.question_text}</p>
                                                                {isEditMode ? (
                                                                    <input
                                                                        type="text"
                                                                        name="answer"
                                                                        value={editableData.intake_forms[formIndex].answers[answerIndex].answer || ''}
                                                                        onChange={(e) => handleInputChange(e, formIndex, answerIndex)}
                                                                        className={styles.editableField}
                                                                    />
                                                                ) : (
                                                                    <p className="text-gray-800">{answer.answer}</p>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                {form.status === 'draft' && (
                                                    <button
                                                        className="mt-2 py-1 px-2 font-semibold rounded-lg border-2 border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-300 ease-in-out"
                                                        onClick={() => handleFinishDraftForm(form.id)}
                                                    >
                                                        Finish Intake Form
                                                    </button>
                                                )}

                                                {/* Add "Create Updated Version" button only for latest form and if it's complete */}
                                                {isLatestForm && form.status === 'completed' && (
                                                    <button
                                                        className="mt-4 py-1 px-2 font-semibold rounded-lg border-2 border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-all duration-300 ease-in-out"
                                                        onClick={() => handleCreateUpdatedForm(form.id)}
                                                    >
                                                        Create Updated Version
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {activeTab === 'assessments' &&
                        <ClientAssessments
                            clientAssessmentData={editableData.client_assessment_data}
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
    );
}

export default CurrentClient;
