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
        category: '',
        other_category: ''
    });
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [notification, setNotification] = useState({ show: false, message: '' });
    const [categories, setCategories] = useState(['Exercise History and Preferences', 'Fitness Goals and Motivation', 'Exercise Routine and Recovery', 'Lifestyle and Challenges', 'Medical History', 'Basic Nutrition', 'Other']);
    const [deleteConfirm, setDeleteConfirm] = useState({ show: false, questionId: null });
    const [restoreConfirm, setRestoreConfirm] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = () => {
        axios.get('http://localhost:5000/api/get_user_questions')
            .then(response => {
                const fetchedQuestions = response.data.map(question => ({
                    ...question,
                    uniqueId: `${question.question_source}_${question.id}` // Assign uniqueId
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
        const updatedQuestions = questions.map(question =>
            question.uniqueId === uniqueId ? { ...question, [name]: value } : question
        );
        setQuestions(updatedQuestions);
    };

    const addQuestion = () => {
        const category = newQuestion.category === 'Other' ? newQuestion.other_category : newQuestion.category;
        axios.post('http://localhost:5000/api/add_user_question', { ...newQuestion, category, action: 'add' })
            .then(response => {
                const addedQuestion = response.data;
                const uniqueId = `trainer_${addedQuestion.id}`;  // Create uniqueId for the new question
                setQuestions([...questions, { ...addedQuestion, uniqueId }]);  // Add with uniqueId
                setNewQuestion({ question_text: '', question_type: '', options: '', category: '', other_category: '' });
                showNotification('Question added successfully');
            })
            .catch(error => console.error('Error adding question:', error));
    };

    const editQuestion = (uniqueId) => {
        const question = questions.find(q => q.uniqueId === uniqueId);  // Use uniqueId to find the question
        const category = question.category === 'Other' ? question.other_category : question.category;

        axios.put(`http://localhost:5000/api/update_user_question/${question.global_question_id || question.id}`,
            { ...question, category, action: 'edit' })
            .then(() => {
                setEditingQuestion(null);
                showNotification('Question updated successfully');

                // Update the savedCurrentQuestions in localStorage
                const key = getLocalStorageKey(clientId, 'currentQuestions');
                let savedCurrentQuestions = JSON.parse(localStorage.getItem(key));

                if (savedCurrentQuestions) {
                    const updatedCurrentQuestions = savedCurrentQuestions.map(cq => {
                        if (cq.uniqueId === question.uniqueId) {
                            return { ...cq, ...question }; // Merge the updated question details
                        }
                        return cq;
                    });

                    localStorage.setItem(key, JSON.stringify(updatedCurrentQuestions));
                }
            })
            .catch(error => console.error('Error updating question:', error));
    };

    const deleteQuestion = (uniqueId) => {
        const question = questions.find(q => q.uniqueId === uniqueId);
        axios.delete(`http://localhost:5000/api/delete_user_question/${question.id}`)
            .then(() => {
                setQuestions(questions.filter(q => q.uniqueId !== uniqueId));
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
        restoreQuestions();
        setRestoreConfirm(false);
    };

    const handleRestoreCancel = () => {
        setRestoreConfirm(false);
    };

    const restoreQuestions = () => {
        // Logic to restore all questions from the global question bank
        axios.get('http://localhost:5000/api/restore_user_questions')
            .then(response => {
                setQuestions(response.data);
                showNotification('All questions restored successfully');
            })
            .catch(error => console.error('Error restoring questions:', error));
    };

    return (
        <div>
            <h2>Manage Questions</h2>
            <div className="my-4">
                <input
                    type="text"
                    name="question_text"
                    value={newQuestion.question_text}
                    onChange={handleInputChange}
                    placeholder="Enter question text"
                    className="border p-2 mr-2"
                />
                <select name="question_type" value={newQuestion.question_type} onChange={handleInputChange} className="border p-2 mr-2">
                    <option value="">Select type</option>
                    <option value="text">Text</option>
                    <option value="select">Select</option>
                    <option value="checkbox">Checkbox</option>
                    <option value="textarea">Textarea</option>
                </select>
                <input
                    type="text"
                    name="options"
                    value={newQuestion.options}
                    onChange={handleInputChange}
                    placeholder="Enter options separated by commas"
                    className="border p-2 mr-2"
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
                        onClick={confirmRestoreQuestions}
                        className="mr-2 flex items-center bg-green-600 hover:bg-green-700 text-white p-2 rounded"
                        title='Restore All Default Questions'>
                        <FaUndo className="inline mr-2" /> Restore by Default
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
                                    <option value="text">Text</option>
                                    <option value="select">Select</option>
                                    <option value="checkbox">Checkbox</option>
                                    <option value="textarea">Textarea</option>
                                </select>
                            </div>
                            <div className="mb-2">
                                <input
                                    type="text"
                                    name="options"
                                    value={question.options || ''}  // Fix here
                                    onChange={(e) => handleEditInputChange(e, question.uniqueId)}
                                    className="border p-2 mr-2 w-full"
                                    placeholder="Enter options separated by commas"
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
                            <button onClick={() => setEditingQuestion(null)} className="bg-red-500 hover:bg-red-700 text-white p-2 rounded">Cancel</button>
                        </div>
                    ) : (
                        <>
                            <div className="flex-grow w-3/4">
                                <p className="font-bold" style={{ maxWidth: '80%', wordWrap: 'break-word' }}>{question.question_text}</p>
                                <p>{question.category}</p>
                            </div>
                            <div className="w-1/4 space-x-2">
                                <button
                                    onClick={() => setEditingQuestion(question.uniqueId)}
                                    className="bg-yellow-400 hover:bg-yellow-600 text-white p-2 rounded"
                                    title="Edit">
                                    <FaEdit />
                                </button>
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
                <div style={{
                    position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white', padding: '20px', borderRadius: '8px', zIndex: 1000, boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                }}>
                    <p>Are you sure you want to restore all questions to default?</p>
                    <button onClick={handleRestoreConfirm} className="bg-red-500 hover:bg-red-700 text-white p-2 rounded mr-2">Yes</button>
                    <button onClick={handleRestoreCancel} className="bg-gray-500 hover:bg-gray-700 text-white p-2 rounded">No</button>
                </div>
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
