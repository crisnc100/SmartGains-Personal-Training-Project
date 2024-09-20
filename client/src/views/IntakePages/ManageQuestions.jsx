import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaUndo } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';



const getLocalStorageKey = (clientId, key) => `client_${clientId}_${key}`;

const ManageQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const { clientId } = useParams();
    const [newQuestion, setNewQuestion] = useState({
        question_text: '',
        question_type: '',
        options: '',
        category: 'Exercise History and Preferences',
        other_category: ''
    });
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [backupQuestion, setBackupQuestion] = useState(null); // New state to store the original question
    const [notification, setNotification] = useState({ show: false, message: '' });
    const [categories, setCategories] = useState(['Exercise History and Preferences', 'Fitness Goals and Motivation', 'Exercise Routine and Recovery', 'Lifestyle and Challenges', 'Medical History', 'Basic Nutrition', 'Other']);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, questionId: null });
    const [restoreConfirm, setRestoreConfirm] = useState(false);
    const [restoreOneConfirm, setRestoreOneConfirm] = useState({ show: false, questionId: null });

    const [addValidationErrors, setAddValidationErrors] = useState(''); // For adding questions
    const [editValidationErrors, setEditValidationErrors] = useState(''); // For editing questions



    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = () => {
        axios.get('http://localhost:5000/api/get_user_questions')
            .then(response => {
                const fetchedQuestions = response.data.map(question => ({
                    ...question,
                    uniqueId: `${question.question_source}_${question.id}`, // Assign uniqueId
                    isEdited: question.action === 'edit' // Mark questions with action = 'edit' as edited

                }));
                setQuestions(fetchedQuestions);
            })
            .catch(error => console.error('Error fetching questions:', error));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewQuestion({ ...newQuestion, [name]: value });
    };

    const handleEditInputChange = (e, uniqueId) => {
        const { name, value } = e.target;

        const updatedQuestions = questions.map(question => {
            if (question.uniqueId === uniqueId) {
                // If editing 'options' for select question, ensure it's a string
                if (name === 'options' && question.question_type === 'dropdown') {
                    return { ...question, options: value.split(',').map(option => option.trim()).join(',') };
                }
                return { ...question, [name]: value };
            }
            return question;
        });

        setQuestions(updatedQuestions);
    };

    const startEditing = (uniqueId) => {
        const questionToEdit = questions.find(q => q.uniqueId === uniqueId);
        setBackupQuestion({ ...questionToEdit }); // Save original question
        setEditingQuestion(uniqueId); // Enter edit mode
    };

    const cancelEdit = () => {
        setQuestions(prevQuestions =>
            prevQuestions.map(q => (q.uniqueId === backupQuestion.uniqueId ? backupQuestion : q))
        );
        setEditingQuestion(null); // Exit edit mode
        setBackupQuestion(null); // Clear backup
        setEditValidationErrors(null);  // Clear the error messages when cancelling

    };


    // Validate question
    const validateQuestion = (question) => {
        const { question_text, question_type, options, category, other_category } = question;
        const specialCharRegex = /[^a-zA-Z0-9\s?.]/;
        let errors = '';

        // Check required fields
        if (!question_text || !question_type || (!category && !other_category)) {
            errors += 'All fields are required. ';
        }

        // Check if question text contains special characters
        if (specialCharRegex.test(question_text)) {
            errors += 'Question text contains special characters. Only alphanumeric characters are allowed. ';
        }

        // Check minimum character length for question text
        if (question_text.trim().length < 5) {
            errors += 'Question must be at least 5 characters long. ';
        }

        // Check for uniqueness of the question text
        const questionExists = questions.some(q => q.question_text.toLowerCase() === question_text.toLowerCase() && q.id !== question.id);
        if (questionExists) {
            errors += 'This question already exists. ';
        }

        // Validate options for dropdown/checkbox types
        if ((question_type === 'dropdown' || question_type === 'checkbox') && options.split(',').length < 2) {
            errors += 'At least two options are required for dropdown and checkbox questions. ';
        }

        // Validate unique category for 'Other'
        if (category === 'Other' && categories.includes(other_category.trim())) {
            errors += 'This category already exists. ';
        }

        return errors || null;  // Return the string of errors, or null if no errors
    };





    const addQuestion = () => {
        const category = newQuestion.category === 'Other' ? newQuestion.other_category : newQuestion.category;
        const errors = validateQuestion(newQuestion);
        if (errors) {
            setAddValidationErrors(errors);  // Show errors in the adding section
            return;
        }
        axios.post('http://localhost:5000/api/add_user_question', { ...newQuestion, category, action: 'add' })
            .then(response => {
                const addedQuestion = response.data;
                const uniqueId = `trainer_${addedQuestion.id}`;  // Create uniqueId for the new question

                // Manually populate the missing fields using the current state of `newQuestion`
                const completeQuestion = {
                    id: addedQuestion.id,
                    uniqueId: uniqueId,
                    question_text: newQuestion.question_text,  // Use the newQuestion values
                    question_type: newQuestion.question_type,
                    options: newQuestion.options,
                    category: newQuestion.category,
                    other_category: newQuestion.other_category,
                };

                // Update the state with the complete question
                setQuestions(prevQuestions => [...prevQuestions, completeQuestion]);
                setNewQuestion({ question_text: '', question_type: '', options: '', category: 'Exercise History and Preferences', other_category: '' });
                setAddValidationErrors('');  // Clear validation errors after successful add
                showNotification('Question added successfully');
            })
            .catch(error => console.error('Error adding question:', error));
    };


    const editQuestion = (uniqueId) => {
        const question = questions.find(q => q.uniqueId === uniqueId);
        const errors = validateQuestion(question);
        if (errors) {
            setEditValidationErrors(errors);  // Show errors in the editing section
            return;
        }

        // Log the full question object for debugging
        console.log("Full question object:", question);

        // For trainer questions, keep action as "add"
        const options = Array.isArray(question.options) ? question.options.join(',') : question.options;
        const isTrainerQuestion = question.question_source === 'trainer';
        const action = isTrainerQuestion ? 'add' : 'edit';
        const category = question.category === 'Other' ? question.other_category : question.category;

        axios.post(`http://localhost:5000/api/update_user_question/${question.id}`, {
            question_text: question.question_text,
            question_type: question.question_type,
            options: options || "",  // Ensure options are a string
            category,
            action,
            question_source: question.question_source,
            is_default: question.is_default || 0,  // Ensure `is_default` is passed (default to 0 if not present)

        })
            .then(() => {
                setQuestions(prevQuestions =>
                    prevQuestions.map(q =>
                        q.uniqueId === uniqueId ? { ...q, isEdited: true } : q
                    )
                );
                setEditingQuestion(null);
                setEditValidationErrors('');  // Clear validation errors after successful edit
                showNotification('Question updated successfully');
                updateLocalStorageAndState(question);
            })
            .catch(error => console.error('Error updating question:', error));
    };


    const updateLocalStorageAndState = (updatedQuestion) => {
        const key = getLocalStorageKey(clientId, 'currentQuestions');
        let savedCurrentQuestions = JSON.parse(localStorage.getItem(key));

        if (savedCurrentQuestions) {
            const updatedCurrentQuestions = savedCurrentQuestions.map(cq => {
                if (cq.uniqueId === updatedQuestion.uniqueId) {
                    return { ...cq, ...updatedQuestion };  // Merge the updated question details
                }
                return cq;
            });

            localStorage.setItem(key, JSON.stringify(updatedCurrentQuestions));
        }

        setQuestions(prevQuestions =>
            prevQuestions.map(q => q.uniqueId === updatedQuestion.uniqueId ? { ...q, ...updatedQuestion } : q)
        );
    };



    const deleteQuestion = (uniqueId) => {
        const question = questions.find(q => q.uniqueId === uniqueId);

        axios.delete(`http://localhost:5000/api/delete_user_question/${question.id}`, {
            data: { question_source: question.question_source }  // Send source to backend
        })
            .then(() => {
                // Update the state: remove the question from the `questions` array
                setQuestions(prevQuestions => prevQuestions.filter(q => q.uniqueId !== uniqueId));

                // Update local storage: remove the question from local storage
                const key = getLocalStorageKey(clientId, 'currentQuestions');
                let savedCurrentQuestions = JSON.parse(localStorage.getItem(key));

                // Remove the deleted question from local storage
                if (savedCurrentQuestions) {
                    savedCurrentQuestions = savedCurrentQuestions.filter(q => q.uniqueId !== uniqueId);
                    localStorage.setItem(key, JSON.stringify(savedCurrentQuestions));
                }

                // Show notification after successful deletion
                showNotification('Question deleted successfully');
            })
            .catch(error => console.error('Error deleting question:', error));
    };



    const showNotification = (message) => {
        setNotification({ show: true, message });
        setTimeout(() => {
            setNotification({ show: false, message: '' });
        }, 3000);
    };

    const confirmDeleteQuestion = (questionId) => {
        setDeleteConfirm({ show: true, questionId });
    };

    const handleDeleteConfirm = () => {
        deleteQuestion(deleteConfirm.questionId);
        setDeleteConfirm({ show: false, questionId: null });
    };

    const handleDeleteCancel = () => {
        setDeleteConfirm({ show: false, questionId: null });
    };

    const confirmRestoreQuestions = () => {
        setRestoreConfirm(true);
    };

    const handleRestoreConfirm = () => {
        restoreAllQuestions();
        setRestoreConfirm(false);
    };

    const handleRestoreCancel = () => {
        setRestoreConfirm(false);
    };

    const restoreAllQuestions = () => {
        axios.get('http://localhost:5000/api/restore_user_questions')
            .then(response => {
                setQuestions(response.data);
                setRestoreConfirm(false);
            })
            .catch(error => console.error('Error restoring questions:', error));
    };

    const restoreToDefault = (uniqueId) => {
        const question = questions.find(q => q.uniqueId === restoreOneConfirm.questionId);
        axios.delete(`http://localhost:5000/api/restore_question_to_default/${question.id}`)
            .then(() => {
                fetchQuestions();
                setRestoreOneConfirm({ show: false, questionId: null });
            })
            .catch(error => console.error('Error restoring question to default:', error));
    };

    const ConfirmationModal = ({ message, onConfirm, onCancel }) => {
        return (
            <>
                {/* Background overlay */}
                <div style={{
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Dark background with transparency
                    zIndex: 999  // Ensure it's behind the modal but on top of everything else
                }} onClick={onCancel}></div>
    
                {/* Modal */}
                <div style={{
                    position: 'fixed', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    backgroundColor: 'white', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    zIndex: 1000,  // Ensure it's on top of the overlay
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}>
                    <p>{message}</p>
                    <button onClick={onConfirm} className="bg-red-500 hover:bg-red-700 text-white p-2 rounded mr-2">Yes</button>
                    <button onClick={onCancel} className="bg-gray-500 hover:bg-gray-700 text-white p-2 rounded">No</button>
                </div>
            </>
        );
    };
    


    return (
        <div>
            <h2>Manage Questions</h2>
            {addValidationErrors && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    {addValidationErrors}
                </div>
            )}
            <div className="my-4">
                <textarea
                    name='question_text'
                    value={newQuestion.question_text}
                    onChange={handleInputChange}
                    placeholder="Enter your question"
                    className="border p-2 mr-2 w-full"
                    onFocus={(e) => e.target.style.height = "200px"}  // Expand height on focus
                    onBlur={(e) => e.target.style.height = "40px"}  // Shrink back on blur
                    style={{ height: "40px", transition: "height 0.3s ease" }}  // Smooth transition
                />

                <select
                    name="question_type"
                    value={newQuestion.question_type}
                    onChange={handleInputChange}
                    className="border p-2 mr-2"
                >
                    <option value="">Select type</option>
                    <option value="text">Text (Single-line input)</option>
                    <option value="textarea">Textarea (Larger-area input)</option>
                    <option value="dropdown">Select (Dropdown with options)</option>
                    <option value="checkbox">Checkbox (Multiple choices)</option>
                </select>

                <input
                    type="text"
                    name="options"
                    value={newQuestion.options}
                    onChange={handleInputChange}
                    placeholder="Enter options separated by commas"
                    className="border p-2 mr-2"
                    onFocus={(e) => e.target.style.width = "600px"}  // Increase width on focus
                    onBlur={(e) => e.target.style.width = "300px"}  // Reduce width back to original on blur
                    style={{
                        height: "40px",  // Keep the height lower
                        width: "300px",  // Set initial width to make it long but not too boxy
                        transition: "width 0.6s ease, box-shadow 0.1s ease",
                        overflowY: "hidden",
                        borderRadius: "8px"
                    }}
                    disabled={newQuestion.question_type !== 'dropdown' && newQuestion.question_type !== 'checkbox'} // Disable for non-select and non-checkbox
                />

                <select name="category" value={newQuestion.category} onChange={handleInputChange} className="border p-2 mr-2">
                    {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
                {newQuestion.category === 'Other' && (
                    <input
                        type="text"
                        name="other_category"
                        value={newQuestion.other_category}
                        onChange={handleInputChange}
                        placeholder="Enter new category"
                        className="border p-2 mr-2"
                    />
                )}
                <button onClick={addQuestion} className="bg-blue-500 hover:bg-blue-700 text-white mt-4 p-2 rounded">Add Question</button>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={() => setRestoreConfirm(true)}
                        className="mr-2 flex items-center bg-green-600 hover:bg-green-700 text-white p-2 rounded"
                        title='Restore All Default Questions'>
                        <FaUndo className="inline mr-2" /> Restore All
                    </button>
                </div>
            </div>
            <div className="p-2 border rounded flex justify-between items-center">
                <div className="w-3/4"><strong>Questions</strong></div>
                <div className="w-1/4"><strong>Actions</strong></div>
            </div>
            {questions.map(question => (
                <div key={question.uniqueId} className="mb-4 p-2 border rounded flex justify-between items-center">
                    {editingQuestion === question.uniqueId ? (
                        <div className="flex-grow">
                            {editValidationErrors && (
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                    {editValidationErrors}
                                </div>
                            )}
                            <div className="mb-2">
                                <input
                                    type="text"
                                    name="question_text"
                                    value={question.question_text || ''}  // Fix here
                                    onChange={(e) => handleEditInputChange(e, question.uniqueId)}
                                    className="border p-2 mr-2 w-full"
                                />
                            </div>
                            <div className="mb-2">
                                <select
                                    name="question_type"
                                    value={question.question_type || ''}  // Fix here
                                    onChange={(e) => handleEditInputChange(e, question.uniqueId)}
                                    className="border p-2 mr-2 w-full"
                                >
                                    <option value="">Select type</option>
                                    <option value="text">Text (Single-line input)</option>
                                    <option value="textarea">Textarea (Larger-area input)</option>
                                    <option value="dropdown">Select (Dropdown with options)</option>
                                    <option value="checkbox">Checkbox (Multiple choices)</option>
                                </select>
                            </div>
                            <div className="mb-2">
                                <input
                                    type="text"
                                    name="options"
                                    value={question.options || ''}  // Use an empty string to prevent the null warning
                                    onChange={(e) => handleEditInputChange(e, question.uniqueId)}
                                    className="border p-2 mr-2 w-full"
                                    placeholder="Enter options separated by commas"
                                    disabled={question.question_type !== 'dropdown' && question.question_type !== 'checkbox'} // Disable for non-select and non-checkbox
                                />
                            </div>
                            <select
                                name="category"
                                value={question.category || ''}  // Fix here
                                onChange={(e) => handleEditInputChange(e, question.uniqueId)}
                                className="border p-2 mr-2 mb-4 w-full"
                            >
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                            {question.category === 'Other' && (
                                <input
                                    type="text"
                                    name="other_category"
                                    value={question.other_category || ''}  // Fix here
                                    onChange={(e) => handleEditInputChange(e, question.uniqueId)}
                                    placeholder="Enter new category"
                                    className="border p-2 mr-2 mb-4 w-full"
                                />
                            )}

                            <button onClick={() => editQuestion(question.uniqueId)} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded mr-2">Save</button>
                            <button
                                onClick={cancelEdit}
                                className="bg-red-500 hover:bg-red-700 text-white p-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-grow w-3/4">
                                {/* Highlight edited questions */}
                                <p className="font-bold" style={{ maxWidth: '80%', wordWrap: 'break-word' }}>
                                    {question.question_text} {question.isEdited && <span style={{ fontSize: '0.9em', color: '#6c757d' }}> (Edited)</span>}
                                </p>
                                <p>{question.category}</p>
                            </div>
                            <div className="w-1/4 space-x-2">
                                <button
                                    onClick={() => startEditing(question.uniqueId)}
                                    className="bg-yellow-400 hover:bg-yellow-600 text-white p-2 rounded"
                                    title="Edit">
                                    <FaEdit />
                                </button>
                                {question.isEdited && (
                                    // Restore button for edited questions
                                    <button
                                        onClick={() => setRestoreOneConfirm({ show: true, questionId: question.uniqueId })}
                                        className="bg-blue-500 hover:bg-blue-700 text-white p-2 rounded"
                                        title="Restore to Default"
                                    >
                                        <FaUndo />
                                    </button>
                                )}
                                <button
                                    onClick={() => setDeleteConfirm({ show: true, questionId: question.uniqueId })}
                                    className="bg-red-500 hover:bg-red-700 text-white p-2 rounded"
                                    title='Delete'>
                                    <FaTrash />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            ))}
            {notification.show && (
                <div className="fixed top-0 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
                    {notification.message}
                </div>
            )}
            {deleteConfirm.show && (
                <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white', padding: '20px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}>
                    <p>Are you sure you want to delete this question?</p>
                    <button onClick={handleDeleteConfirm} className="bg-red-500 hover:bg-red-700 text-white p-2 rounded mr-2">Yes</button>
                    <button onClick={handleDeleteCancel} className="bg-gray-500 hover:bg-gray-700 text-white p-2 rounded">No</button>
                </div>
            )}
            {restoreConfirm && (
                <ConfirmationModal
                    message="Are you sure you want to restore all questions to default?"
                    onConfirm={restoreAllQuestions}
                    onCancel={() => setRestoreConfirm(false)}
                />
            )}

            {restoreOneConfirm.show && (
                <ConfirmationModal
                    message="Are you sure you want to restore this question to default?"
                    onConfirm={() => restoreToDefault(restoreOneConfirm.questionId)}
                    onCancel={() => setRestoreOneConfirm({ show: false, questionId: null })}
                />
            )}
            {(deleteConfirm.show || restoreConfirm) && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 999
                }}></div>
            )}
        </div>
    );
};

export default ManageQuestions;
