// DefaultSettings.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DefaultSetup = () => {
  const [defaultQuestions, setDefaultQuestions] = useState([]);

  useEffect(() => {
    const fetchDefaultQuestions = async () => {
      try {
        const res = await axios.get('/api/get_user_default_questions');
        setDefaultQuestions(res.data);
      } catch (error) {
        console.error('Error fetching default questions:', error);
      }
    };
    fetchDefaultQuestions();
  }, []);

  const handleEditDefault = (questionId) => {
    // Implement edit logic here
  };

  const handleDeleteDefault = (questionId) => {
    // Implement delete logic here
  };

  return (
    <div>
      <h2>Default Settings</h2>
      {/* Add your UI for displaying, editing, and deleting default questions */}
    </div>
  );
};

export default DefaultSetup;
