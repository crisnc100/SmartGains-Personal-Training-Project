import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';



const getLocalStorageKey = (clientId, key) => `client_${clientId}_${key}`;

const IntakeForm = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [formId, setFormId] = useState(null); // New state for form ID
    const [questions, setQuestions] = useState([]);
    const [intakeForm, setIntakeForm] = useState({});
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [loadingError, setLoadingError] = useState(false);
    const [submitting, setSubmitting] = useState(false); // New state for form submission
    const [isAutoSaving, setIsAutoSaving] = useState(false); // New state
    const [deletedAnswers, setDeletedAnswers] = useState({});



    useEffect(() => {
        const initializeFormState = async () => {
            const savedFormId = localStorage.getItem(getLocalStorageKey(clientId, 'formId'));
            const savedCurrentQuestions = localStorage.getItem(getLocalStorageKey(clientId, 'currentQuestions'));
    
            if (savedFormId) {
                setFormId(parseInt(savedFormId, 10));  // Ensure formId is treated as an integer
                try {
                    const response = await axios.get('http://localhost:5000/api/get_saved_answers', {
                        params: {
                            client_id: clientId,
                            form_id: savedFormId
                        },
                        withCredentials: true
                    });
                    const savedAnswers = response.data.answers.reduce((acc, answer) => {
                        acc[answer.question_id] = answer.answer;
                        return acc;
                    }, {});
                    setIntakeForm(savedAnswers);
    
                    if (savedCurrentQuestions) {
                        const parsedQuestions = JSON.parse(savedCurrentQuestions);
                        if (Array.isArray(parsedQuestions)) {
                            const questionsWithSource = parsedQuestions.map(question => ({
                                ...question,
                                source: question.source || 'global'
                            }));
                            setQuestions(questionsWithSource);
                        } else {
                            console.error('Parsed questions is not an array:', parsedQuestions);
                            fetchDefaultQuestions();
                        }
                    } else {
                        fetchDefaultQuestions();
                    }
                } catch (error) {
                    console.error('Error fetching saved answers:', error);
                    fetchDefaultQuestions();
                }
            } else {
                fetchDefaultQuestions();
            }
            setLoading(false);
        };
    
        initializeFormState();
    }, [clientId]);
    

    const fetchDefaultQuestions = async () => {
        try {
            console.log('Fetching default questions');
            const response = await axios.get('http://localhost:5000/api/get_user_default_questions');
            const questionsWithSource = response.data.map(question => ({
                ...question,
                source: question.source || 'global' // Default to 'global' if source is missing
            }));
            setQuestions(questionsWithSource);
            localStorage.setItem(getLocalStorageKey(clientId, 'currentQuestions'), JSON.stringify(questionsWithSource)); // Save questions to local storage
            initializeForm(questionsWithSource);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching default questions:', error);
        }
    };


    const initializeForm = (questions, savedAnswers = {}) => {
        const formState = {};
        questions.forEach(question => {
            formState[question.id] = savedAnswers[question.id] || (question.question_type === 'checkbox' ? [] : '');
        });
        setIntakeForm(formState);
        console.log('Initialized form state:', formState);
    };


    const handleInputChange = async (event, questionId) => {
        if (!formId) {
            try {
                console.log('Creating a new intake form');
                const response = await axios.post('http://localhost:5000/api/add_intake_form', {
                    withCredentials: true,
                    form_type: 'initial consultation',
                    client_id: clientId,
                });
                const newFormId = response.data.id;
                console.log('New form created with ID:', newFormId);
    
                if (newFormId) {
                    setFormId(newFormId);
                    localStorage.setItem(getLocalStorageKey(clientId, 'formId'), newFormId);
                } else {
                    console.error('Failed to get new form ID from response');
                    return;
                }
            } catch (error) {
                console.error('Error creating new form:', error);
                return;
            }
        }
    
        const updatedForm = {
            ...intakeForm,
            [questionId]: event.target.value
        };
        setIntakeForm(updatedForm);
        localStorage.setItem(getLocalStorageKey(clientId, 'currentAnswers'), JSON.stringify(updatedForm));
        console.log('Updated form state:', updatedForm);
    };
    

    const handleCheckboxChange = (event, questionId) => {
        const { value } = event.target;
        setIntakeForm((prevState) => {
            const updatedArray = Array.isArray(prevState[questionId])
                ? prevState[questionId].includes(value)
                    ? prevState[questionId].filter(item => item !== value)
                    : [...prevState[questionId], value]
                : [value]; // Initialize as an array if it's not already
    
            const updatedForm = {
                ...prevState,
                [questionId]: updatedArray
            };
            localStorage.setItem(getLocalStorageKey(clientId, 'currentAnswers'), JSON.stringify(updatedForm));
            return updatedForm;
        });
    };


    const renderInputField = (question) => {
        const { id, question_text, question_type, options } = question;
        const value = intakeForm[id];

        if (question_type === 'select') {
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
                                checked={value.includes(option)}
                                onChange={(e) => handleCheckboxChange(e, id)}
                                className="form-checkbox"
                                aria-label={option}
                            />
                            <span className="ml-2">{option}</span>
                        </label>
                    ))}
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

    useEffect(() => {
        const autoSave = async () => {
            if (!formId) {
                console.log('No formId found. Skipping auto-save.');

                return; // Skip auto-save if formId is not set
            }
            setIsAutoSaving(true);
            try {
                const filteredAnswers = questions
                    .map(question => ({
                        question_source: question.source || 'global',
                        question_id: question.id,
                        answer: intakeForm[question.id]
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
    }, [clientId, formId, intakeForm, questions]);
    
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
        setSubmitting(true);
    
        try {
            // Step 1: Update the intake form status to 'completed'
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
                await axios.post('http://localhost:5000/api/save_intake_form_answers', {
                    withCredentials: true,
                    form_id: formId,
                    answers: answers
                });
            }
    
            // Step 3: Clear local storage
            localStorage.removeItem(getLocalStorageKey('currentAnswers'));
            localStorage.removeItem(getLocalStorageKey('currentQuestions'));
            localStorage.removeItem(getLocalStorageKey('formId'));
    
            // Step 4: Generate AI insights if not skipped
            if (!skipAI) {
                const formData = gatherFormData(questions, intakeForm);
                await axios.post('http://localhost:5000/api/generate_ai_insights', {
                    withCredentials: true,
                    data: formData
                });
                navigate('success-overview');
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
            setSubmitting(false);
        }
    };
    

    const goBack = () => {
        navigate(-1);
    };
    const handleCustomize = () => {
        // Save current answers before navigating to customization
        localStorage.removeItem(getLocalStorageKey(clientId, 'currentAnswers'));
        localStorage.removeItem(getLocalStorageKey(clientId, 'currentQuestions'));
        navigate('customize');
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
                                    <div key={question.id} className="form-group">
                                        <label className="block text-sm font-medium text-gray-900 capitalize no-transform mb-2" style={{ fontWeight: 'bold', fontSize: '15px', textTransform: 'none' }} htmlFor={question.id}>
                                            {question.question_text}
                                        </label>
                                        {renderInputField(question)}
                                        {errors[question.id] && (
                                            <p className="mt-2 text-sm text-red-600">{errors[question.id]}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-between">
                        <button type="button" onClick={(e) => handleSubmit(e, true)} className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full p-2.5 text-center mt-6 mr-2" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit"}
                        </button>
                        <button type="submit" className="text-white bg-green-600 hover:bg-green-700 font-medium rounded-lg text-sm w-full p-2.5 text-center mt-6 ml-2" disabled={submitting}>
                            {submitting ? "Submitting..." : "Submit with AI Insights"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default IntakeForm;
