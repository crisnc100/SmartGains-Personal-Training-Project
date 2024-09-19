import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import Modal from 'react-modal';




const getLocalStorageKey = (clientId, key) => `client_${clientId}_${key}`;

const IntakeForm = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [formId, setFormId] = useState(null); // New state for form ID
    const [questions, setQuestions] = useState([]);
    const [intakeForm, setIntakeForm] = useState({});
    const [allQuestions, setAllQuestions] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(false);
    const [submitting, setSubmitting] = useState(false); // New state for form submission
    const [isAutoSaving, setIsAutoSaving] = useState(false); // New state
    const [deletedAnswers, setDeletedAnswers] = useState({});
    const [isGeneratingInsights, setIsGeneratingInsights] = useState(false); // New state for AI insights
    const [errorMessage, setErrorMessage] = useState(null);
    const [createFormTimeout, setCreateFormTimeout] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [reloading, setReloading] = useState(false);
    const [customizeTriggered, setCustomizeTriggered] = useState(false);



    useEffect(() => {
        const initializeFormState = async () => {
            console.log("Initializing form state...");
            const savedCurrentQuestions = localStorage.getItem(getLocalStorageKey(clientId, 'currentQuestions'));
            const savedFormId = localStorage.getItem(getLocalStorageKey(clientId, 'formId'));
            const hasLeftComponent = sessionStorage.getItem(`hasLeftIntakeForm_${clientId}`) === 'true';

            console.log("Saved Form ID:", savedFormId);
            console.log("Has Left Component:", hasLeftComponent);

            // Step 1: Load updated questions from local storage if they exist
            if (savedCurrentQuestions) {
                const parsedQuestions = JSON.parse(savedCurrentQuestions);
                if (Array.isArray(parsedQuestions)) {
                    console.log("Loading updated questions from local storage...");
                    const parsedQuestionsWithUniqueId = parsedQuestions.map((question) => {
                        const uniqueId = `${question.question_source}_${question.id}`;
                        return { ...question, uniqueId };
                    });
                    setQuestions(parsedQuestionsWithUniqueId);
                    initializeForm(parsedQuestionsWithUniqueId); // Initialize the form with the updated questions
                } else {
                    fetchDefaultQuestions();
                }
            } else {
                fetchDefaultQuestions(); // If no updated questions are found, fetch the default questions
            }

            // Step 2: Check if a form ID exists and handle loading saved answers
            if (savedFormId && !customizeTriggered) {
                setFormId(parseInt(savedFormId, 10));
                try {
                    const response = await axios.get('http://localhost:5000/api/get_saved_answers', {
                        params: { client_id: clientId, form_id: savedFormId },
                        withCredentials: true
                    });
                    const savedAnswers = Array.isArray(response.data.answers)
                        ? response.data.answers.reduce((acc, answer) => {
                            acc[answer.question_id] = answer.answer;
                            return acc;
                        }, {})
                        : {}; // Fallback to an empty object if answers are not available or in an unexpected format

                    setIntakeForm(savedAnswers);
                    console.log("Loaded answers into state:", savedAnswers);
                } catch (error) {
                    console.error('Error fetching saved answers:', error);
                }
            }

            // Step 3: Handle case when the form was customized
            if (customizeTriggered) {
                console.log("Customization triggered, reinitializing questions...");
                fetchDefaultQuestions();
                setCustomizeTriggered(false); // Reset the customizeTriggered flag
            }

            // Step 4: Handle case when no form ID exists but an intake form may exist on the server
            if (!savedFormId && !customizeTriggered) {
                try {
                    const response = await axios.get(`http://localhost:5000/api/check_intake_form/${clientId}`, {
                        withCredentials: true,
                    });

                    if (response.data.form_exists && hasLeftComponent) {
                        const existingFormId = response.data.form_id;
                        setFormId(existingFormId);
                        console.log('Form ID set from check intake form:', existingFormId);

                        setShowPopup(true);
                        setFirstName(response.data.client_first_name); // Capture first name from the response
                        setLastName(response.data.client_last_name); // Capture last name from the response
                    }
                } catch (error) {
                    console.error('Error checking existing form:', error);
                }
            }

            // Finish initialization by setting loading to false
            setLoading(false);
        };

        initializeFormState();

        // Set the flag in sessionStorage when the user leaves the component
        return () => {
            sessionStorage.setItem(`hasLeftIntakeForm_${clientId}`, 'true');
        };
    }, [clientId, customizeTriggered]);

    const fetchDefaultQuestions = async () => {
        console.log("Fetching default questions...");

        try {
            const response = await axios.get('http://localhost:5000/api/get_user_questions');
            const questions = response.data;

            // Filter for questions where is_default === 1, both global and trainer questions
            const defaultQuestions = questions.filter(question =>
                question.is_default === 1 // Include both global and trainer default questions
            );

            // Log default questions for debugging
            console.log("Filtered Default Questions:", defaultQuestions);

            // Add the uniqueId for each question to ensure uniqueness
            const defaultQuestionsWithUniqueIds = defaultQuestions.map(question => ({
                ...question,
                uniqueId: `${question.question_source}_${question.id}` // Ensure uniqueId is set
            }));

            // Save the default questions to state and local storage
            setQuestions(defaultQuestionsWithUniqueIds);
            localStorage.setItem(getLocalStorageKey(clientId, 'currentQuestions'), JSON.stringify(defaultQuestionsWithUniqueIds));
        } catch (error) {
            console.error('Error fetching default questions:', error);
        }
    };






    const initializeForm = (questions, savedAnswers = {}) => {
        console.log("Initializing form with questions and answers...", questions, savedAnswers);
        const formState = {};

        // Map answers to questions using the original question ID
        questions.forEach(question => {
            const questionId = question.id;  // Use the original question ID
            formState[questionId] = savedAnswers[questionId] || '';  // Match saved answer to question ID
        });

        setIntakeForm(formState);
        console.log('Initialized form state:', formState);
    };









    const handleInputChange = async (event, uniqueId) => {
        const newValue = event.target.value;
        console.log(`Input changed for question ID ${uniqueId}:`, newValue);
        const updatedForm = {
            ...intakeForm,
            [uniqueId]: newValue
        };
        setIntakeForm(updatedForm);
        localStorage.setItem(getLocalStorageKey(clientId, 'currentAnswers'), JSON.stringify(updatedForm));
        console.log('Updated form state:', updatedForm);

        if (!formId && !createFormTimeout) {
            const timeoutId = setTimeout(async () => {
                try {
                    console.log('Creating a new intake form');
                    const response = await axios.post('http://localhost:5000/api/add_intake_form', {
                        withCredentials: true,
                        form_type: 'initial consultation',
                        client_id: clientId,
                    });

                    console.log('Form creation response:', response); // Log the full response
                    const newFormId = response.data.form_id; // Access form_id from response data
                    console.log('New form created with ID:', newFormId);

                    if (newFormId) {
                        setFormId(newFormId);
                        localStorage.setItem(getLocalStorageKey(clientId, 'formId'), newFormId);
                        // Start auto-save mechanism after form is created
                        startAutoSave(newFormId);
                    } else {
                        console.error('Failed to get new form ID from response');
                    }
                } catch (error) {
                    console.error('Error creating new form:', error);
                } finally {
                    setCreateFormTimeout(null); // Clear the timeout state
                }
            }, 12000);

            setCreateFormTimeout(timeoutId); // Store the timeout ID
        }
    };

    const handleLoadExistingForm = async () => {
        setReloading(true);  // Start showing the spinner
        try {
            console.log("handleLoadExistingForm triggered. Form ID:", formId);

            // Fetch the saved answers and questions for the existing form
            const response = await axios.get('http://localhost:5000/api/get_saved_answers', {
                params: { client_id: clientId, form_id: formId },
                withCredentials: true
            });
            console.log("Load existing form API response:", response.data);

            if (response.data.answers && Array.isArray(response.data.answers)) {
                const savedAnswers = response.data.answers.reduce((acc, answer) => {
                    const uniqueId = `${answer.question_source}_${answer.question_id}`;  // Use uniqueId here
                    acc[uniqueId] = answer.answer;
                    return acc;
                }, {});

                setIntakeForm(savedAnswers);
                console.log("Loaded answers into state:", savedAnswers);
            }

            if (response.data.questions && Array.isArray(response.data.questions)) {
                const questionsWithSource = response.data.questions.map(question => ({
                    ...question,
                    source: question.source || 'global',
                    category: question.category || 'General', // Ensure each question has a category
                }));
                setQuestions(questionsWithSource);
                localStorage.setItem(getLocalStorageKey(clientId, 'currentQuestions'), JSON.stringify(questionsWithSource));
                console.log("Loaded questions into state:", questionsWithSource);
            }

            // Save the form ID to local storage
            localStorage.setItem(getLocalStorageKey(clientId, 'formId'), formId);

            // Wait until the state is fully updated before refreshing
            setTimeout(() => {
                // Force reload the page to fully refresh the state
                window.location.reload();
            }, 1000);  // Adding a 1-second delay before refreshing
        } catch (error) {
            console.error('Error loading existing form:', error);
            setReloading(false);  // Stop showing the spinner if there's an error
        } finally {
            setShowPopup(false);  // Close the modal
        }
    };



    const handleCreateNewForm = async () => {
        try {
            const response = await axios.post('http://localhost:5000/api/add_intake_form', {
                withCredentials: true,
                form_type: 'Updated Intake Form',
                client_id: clientId,
            });

            const newFormId = response.data.form_id;
            setFormId(newFormId);
            fetchDefaultQuestions();
        } catch (error) {
            console.error('Error creating new form:', error);
        } finally {
            setShowPopup(false);
        }
    };

    const handleCheckboxChange = (event, questionId) => {
        const { value } = event.target;
        const isOtherSelected = value === 'Other';
    
        setIntakeForm((prevState) => {
            const updatedArray = Array.isArray(prevState[questionId])
                ? prevState[questionId].includes(value)
                    ? prevState[questionId].filter(item => item !== value)
                    : [...prevState[questionId], value]
                : [value]; // Initialize as an array if it's not already
    
            const updatedForm = {
                ...prevState,
                [questionId]: updatedArray, // Use questionId to update the state
            };
    
            // If "Other" is selected, add an empty field for user input for "Other"
            if (isOtherSelected) {
                updatedForm[`${questionId}_other`] = updatedForm[`${questionId}_other`] || ''; // Create "Other" field if not already there
            } else if (!updatedArray.includes('Other')) {
                // If "Other" is unchecked, remove the "Other" field
                delete updatedForm[`${questionId}_other`];
            }
    
            // Save the updated form to local storage
            localStorage.setItem(getLocalStorageKey(clientId, 'currentAnswers'), JSON.stringify(updatedForm));
            return updatedForm;
        });
    };
    



    const renderInputField = (question) => {
        const { id, question_text, question_type, options } = question;
        const value = intakeForm[id] || '';  // Use question id to access answer
        const otherValue = intakeForm[`${id}_other`] || ''; // Value for "Other" input

        if (question_type === 'dropdown') {
            return (
                <select
                    name={id}
                    id={id}
                    value={value}
                    onChange={(e) => handleInputChange(e, id)}
                    className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="">Select an option</option>
                    {options.split(',').map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            );
        } else if (question_type === 'checkbox') {
            return (
                <div className="flex flex-col md:flex-row md:flex-wrap" style={{ color: 'black' }}>
                    {options.split(',').map(option => (
                        <label key={option} className="inline-flex items-center md:w-1/2">
                            <input
                                type="checkbox"
                                name={id}
                                value={option}
                                checked={value.includes(option)} // Check if the option is included in the value array
                                onChange={(e) => handleCheckboxChange(e, id)}
                                className="form-checkbox"
                                aria-label={option}
                            />
                            <span className="ml-2">{option}</span>
                        </label>
                    ))}

                    {/* Render input field for "Other" if selected */}
                    {value.includes('Other') && (
                        <input
                            type="text"
                            placeholder="Please specify"
                            value={otherValue}
                            onChange={(e) => handleInputChange(e, `${id}_other`)}
                            className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500 mt-2"
                        />
                    )}
                </div>
            );
        } else if (question_type === 'textarea') {
            return (
                <textarea
                    id={id}
                    name={id}
                    value={value}
                    onChange={(e) => handleInputChange(e, id)}
                    className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
                    rows="4"
                    style={{ maxWidth: '100%', maxHeight: '150px' }}
                />
            );
        } else {
            return (
                <input
                    type="text"
                    id={id}
                    name={id}
                    value={value}
                    onChange={(e) => handleInputChange(e, id)}
                    className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
                />
            );
        }
    };


    const startAutoSave = (formId) => {
        const autoSave = async () => {
            if (!formId || customizeTriggered) {
                console.log('No formId found. Skipping auto-save.');
                return; // Skip auto-save if formId is not set
            }
            setIsAutoSaving(true);
            try {
                const filteredAnswers = questions
                    .map(question => ({
                        question_source: question.source || 'global',
                        question_id: question.id,
                        answer: intakeForm[question.id]  // Use question.id to access the answer
                    }))
                    .filter(answer => answer.answer !== '');
                localStorage.setItem(getLocalStorageKey(clientId, 'currentAnswers'), JSON.stringify(intakeForm)); // Save answers to local storage

                const response = await axios.post('http://localhost:5000/api/auto_save_intake_form', {
                    withCredentials: true,
                    client_id: clientId,
                    form_data: { form_id: formId, form_type: 'initial consultation' },
                    answers: filteredAnswers
                });
                if (response.data.form_id) {
                    console.log(`Auto-save: form_id set to ${response.data.form_id}`);
                    setFormId(parseInt(response.data.form_id, 10));  // Ensure form_id is set as an integer
                    localStorage.setItem(getLocalStorageKey(clientId, 'formId'), response.data.form_id);
                }
            } catch (error) {
                console.error('Auto-save error:', error);
            } finally {
                setIsAutoSaving(false); // Ensure this runs even if there's an error
            }
        };

        const intervalId = setInterval(autoSave, 12000); // Auto-save every 12 seconds

        return () => clearInterval(intervalId);
    };

    // Call this function when formId is set
    useEffect(() => {
        if (formId) {
            const cleanup = startAutoSave(formId);
            return cleanup; // Clear interval when component unmounts or dependencies change
        }
    }, [formId, clientId, intakeForm, questions]);

    const gatherFormData = (questions, answers) => {
        console.log('Gathering form data...');
        console.log('Questions:', questions);
        console.log('Answers:', answers);

        const formData = questions.map(question => {
            const data = {
                question: question.question_text,
                answer: answers[question.id]
            };
            console.log('Form Data Entry:', data);
            return data;
        });

        console.log('Final Form Data:', formData);
        return formData;
    };


    const handleSubmit = async (e, skipAI = false) => {
        e.preventDefault();

        if (!skipAI) {
            setIsGeneratingInsights(true);
        } else {
            setSubmitting(true);
        }

        console.log("Submitting with AI Insights:", !skipAI);
        console.log("Submitting without AI Insights:", skipAI);

        try {
            // Step 1: Update the intake form status to 'completed'
            console.log("Updating form status to 'completed'");
            await axios.post('http://localhost:5000/api/update_intake_form_status', {
                withCredentials: true,
                form_id: formId,
                status: 'completed'
            });

            // Step 2: Prepare answers (if there are any unsaved answers)
            const answers = questions
                .map(question => ({
                    question_source: question.source || 'global',
                    question_id: question.id,
                    answer: intakeForm[question.id],
                    form_id: formId
                }))
                .filter(answer => answer.answer !== '');

            if (answers.length > 0) {
                console.log("Saving answers:", answers);
                await axios.post('http://localhost:5000/api/final_intake_save', {
                    withCredentials: true,
                    form_id: formId,
                    answers: answers
                });
            }

            // Step 3: Clear local storage
            console.log("Clearing local storage");
            localStorage.removeItem(getLocalStorageKey(clientId, 'currentAnswers'));
            localStorage.removeItem(getLocalStorageKey(clientId, 'currentQuestions'));
            localStorage.removeItem(getLocalStorageKey(clientId, 'formId'));

            if (!skipAI) {
                console.log("Generating AI insights");
                try {
                    await axios.post(`http://localhost:5000/api/create_client_summary/${clientId}`, {
                        form_id: formId, // Pass the formId to the AI summary endpoint
                        data: gatherFormData(questions, intakeForm)
                    }, {
                        withCredentials: true
                    });
                    navigate('success-overview'); // Navigate to the insights page
                } catch (error) {
                    console.error("Error generating AI insights:", error);
                    setErrorMessage('Something went wrong. Please try again later.');
                } finally {
                    setIsGeneratingInsights(false);
                }
            } else {
                navigate('success-intake_options'); // Skipping AI insights
            }
        } catch (error) {
            console.error("Submission error:", error);
            if (error.response) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    ...error.response.data.errors,
                }));
            } else {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    general: 'An unexpected error occurred. Please try again.'
                }));
            }
        } finally {
            if (skipAI) {
                setSubmitting(false);
            }
        }
    };

    const goBack = () => {
        navigate(-1);
    };
    const handleCustomize = async () => {
        setLoading(true);
        try {
            await navigate('customize');
            // Ensure questions are updated after customization
            setCustomizeTriggered(true);
        } catch (error) {
            console.error('Error navigating to customization:', error);
        } finally {
            setLoading(false);
        }
    };


    const groupedQuestions = questions.reduce((acc, question) => {
        if (!acc[question.category]) {
            acc[question.category] = [];
        }
        acc[question.category].push(question);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <ClipLoader color="#3498db" size={150} />
                <p className="text-lg text-gray-700 mt-4">Loading questions...</p>
            </div>
        );
    }

    if (loadingError) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-lg text-red-600 mt-4">Failed to load questions. Please try again later.</p>
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-end space-x-2 mt-2">
                <button onClick={goBack} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
                    Return Back
                </button>
            </div>
            <div className="flex justify-center px-4">
                <form onSubmit={(e) => handleSubmit(e, false)} className="w-full max-w-4xl">
                    <div className="text-center mb-4">
                        <h1 className="text-4xl font-semibold text-gray-900">Consultation Intake Form</h1>
                        <button
                            type="button"
                            onClick={handleCustomize}
                            className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm p-2.5 mt-4 mb-6"
                        >
                            Customize Form
                        </button>
                        {isAutoSaving && (
                            <p className="text-sm text-green-600 mt-2">Auto-saving...</p>
                        )}
                    </div>
                    {Object.keys(groupedQuestions).map(category => (
                        <div key={category} className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 ">{category}:</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {groupedQuestions[category].map(question => (
                                    <div key={question.uniqueId} className="form-group">
                                        <label className="block text-sm font-medium text-gray-900 capitalize no-transform mb-2" style={{ fontWeight: 'bold', fontSize: '15px', textTransform: 'none' }} htmlFor={question.id}>
                                            {question.question_text}
                                        </label>
                                        {renderInputField(question)}
                                        {errors[question.uniqueId] && (
                                            <p className="mt-2 text-sm text-red-600">{errors[question.uniqueId]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between">
                        {/*<button type="button" onClick={(e) => handleSubmit(e, true)} className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full p-2.5 text-center mt-6 mr-2" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit"}
                        </button>*/}
                        <button type="submit" className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm w-full p-2.5 text-center mt-6 ml-2" disabled={isGeneratingInsights}>
                            {isGeneratingInsights ? <ClipLoader size={20} color={"#ffffff"} /> : "Submit"}
                        </button>
                    </div>
                    {isGeneratingInsights && (
                        <div className="flex justify-center items-center mt-4">
                            <ClipLoader size={50} color={"#123abc"} />
                        </div>
                    )}
                    {errorMessage && (
                        <div className="mt-4 text-red-500 text-center">
                            {errorMessage}
                        </div>
                    )}

                </form>
            </div>
            <Modal
                isOpen={showPopup}
                onRequestClose={() => setShowPopup(false)}
                contentLabel="Existing Intake Form Found"
                className="flex items-center justify-center min-h-screen"
                overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center"
                style={{
                    content: {
                        border: 'none',  // Ensure no border is applied
                        outline: 'none', // Ensure no outline is applied
                    },
                    overlay: {
                        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Keep the dark overlay
                    },
                }}
            >
                <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4">Existing Intake Form Found</h2>
                    <p className="text-lg text-gray-700 mb-6">We found an existing intake form for {firstName} {lastName}. Would you like to load the existing data or create a new form?</p>
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={handleLoadExistingForm}
                            className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-300"
                        >
                            Load Existing Form
                        </button>
                        <button
                            onClick={handleCreateNewForm}
                            className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition duration-300"
                        >
                            Create New Form
                        </button>
                    </div>
                </div>
            </Modal>


        </div>
    );
};

export default IntakeForm;
