import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ManageQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState({
    question_text: '',
    question_type: '',
    options: '',
    category: '',
  });

  useEffect(() => {
    // Fetch user-specific questions
    axios.get('http://localhost:5000/api/get_user_questions')
      .then(response => setQuestions(response.data))
      .catch(error => console.error('Error fetching questions:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewQuestion({ ...newQuestion, [name]: value });
  };

  const addQuestion = () => {
    // API call to add new question
    axios.post('http://localhost:5000/api/add_user_question', newQuestion)
      .then(response => setQuestions([...questions, response.data]))
      .catch(error => console.error('Error adding question:', error));
  };

  const editQuestion = (id) => {
    // Logic for editing a question
  };

  const deleteQuestion = (id) => {
    // API call to delete a question
    axios.delete(`http://localhost:5000/api/delete_user_question/${id}`)
      .then(() => setQuestions(questions.filter(q => q.id !== id)))
      .catch(error => console.error('Error deleting question:', error));
  };

  return (
    <div>
      <h2>Manage Questions</h2>
      <div>
        <input
          type="text"
          name="question_text"
          value={newQuestion.question_text}
          onChange={handleInputChange}
          placeholder="Enter question text"
        />
        <select name="question_type" value={newQuestion.question_type} onChange={handleInputChange}>
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
        />
        <input
          type="text"
          name="category"
          value={newQuestion.category}
          onChange={handleInputChange}
          placeholder="Enter category"
        />
        <button onClick={addQuestion}>Add Question</button>
      </div>
      <div>
        {questions.map(question => (
          <div key={question.id}>
            <p>{question.question_text}</p>
            <button onClick={() => editQuestion(question.id)}>Edit</button>
            <button onClick={() => deleteQuestion(question.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageQuestions;
