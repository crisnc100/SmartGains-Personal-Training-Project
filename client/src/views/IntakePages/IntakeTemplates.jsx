// ManageQuestions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IntakeTemplates = () => {
  const [userQuestions, setUserQuestions] = useState([]);

  useEffect(() => {
    const fetchUserQuestions = async () => {
      try {
        const res = await axios.get('/api/get_intake_templates');
        setUserQuestions(res.data);
      } catch (error) {
        console.error('Error fetching user questions:', error);
      }
    };
    fetchUserQuestions();
  }, []);

  const handleEdit = (questionId) => {
    // Implement edit logic here
  };

  const handleDelete = (questionId) => {
    // Implement delete logic here
  };

  return (
    <div>
      <h2>Intake Templates</h2>
      {/* Add your UI for displaying, editing, and deleting user-specific questions */}
    </div>
  );
};

export default IntakeTemplates;
