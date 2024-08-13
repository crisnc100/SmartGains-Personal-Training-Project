// ManageQuestions.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';




const getLocalStorageKey = (clientId, key) => `client_${clientId}_${key}`;



const IntakeTemplates = () => {
  const { clientId } = useParams();
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedTemplate) {
      if (selectedTemplate === 'default') {
        fetchDefaultQuestions();
      } else {
        fetchQuestionsByTemplate(selectedTemplate);
      }
    }
  }, [selectedTemplate]);

  const fetchDefaultQuestions = () => {
    axios.get('http://localhost:5000/api/get_user_default_questions')
      .then(response => {
        setQuestions(response.data);
      })
      .catch(error => console.error('Error fetching default questions:', error));
  };

  const fetchQuestionsByTemplate = (template) => {
    axios.get(`http://localhost:5000/api/get_questions_by_template/${template}`)
      .then(response => {
        setQuestions(response.data);
      })
      .catch(error => console.error('Error fetching questions:', error));
  };

  const handleTemplateClick = (template) => {
      if (selectedTemplate === template) {
          setSelectedTemplate('');
          setQuestions([]);
      } else {
          setSelectedTemplate(template);
      }
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      localStorage.setItem(getLocalStorageKey(clientId, 'currentQuestions'), JSON.stringify(questions));
      navigate(-1); // Redirect to intake page
    }
  };

  const templateOptions = [
      { value: 'default', label: 'Default', description: 'General fitness questions for all users.' },
      { value: 'athletes', label: 'Athletes', description: 'Questions tailored for athletes and their training routines.' },
      { value: 'bodybuilding', label: 'Bodybuilding', description: 'Questions focused on bodybuilding, muscle gain, and related topics.' }
      // Add more templates as needed
  ];

  return (
    <div className="flex flex-col items-center justify-center">
        <h2 className="mb-4" style={{fontSize: '25px'}}>Select Template</h2>
        <div className="flex space-x-4">
            <div
                onClick={() => handleTemplateClick('default')}
                className={`p-8 border rounded cursor-pointer ${selectedTemplate === 'default' ? 'bg-blue-300' : ''}`}
                style={{ position: 'relative', width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                data-tooltip-id="default-tooltip"
            >
                Default
            </div>
            <div
                onClick={() => handleTemplateClick('athletes')}
                className={`p-8 border rounded cursor-pointer ${selectedTemplate === 'athletes' ? 'bg-blue-300' : ''}`}
                style={{ position: 'relative', width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                data-tooltip-id="athletes-tooltip"
            >
                Athletes
            </div>
            <div
                onClick={() => handleTemplateClick('bodybuilding')}
                className={`p-8 border rounded cursor-pointer ${selectedTemplate === 'bodybuilding' ? 'bg-blue-300' : ''}`}
                style={{ position: 'relative', width: '200px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                data-tooltip-id="bodybuilding-tooltip"
            >
                Bodybuilding
            </div>
        </div>
        {selectedTemplate && (
            <button
                onClick={handleConfirm}
                className="mt-4 p-2 bg-green-500 hover:bg-green-600 text-white rounded"
            >
                Confirm
            </button>
        )}
        <Tooltip id="default-tooltip" place="top" style={{ zIndex: 1000 }}>
            Questions tailored for general fitness assessment.
        </Tooltip>
        <Tooltip id="athletes-tooltip" place="top" style={{ zIndex: 1000 }}>
            Questions tailored for athletes and their training routines.
        </Tooltip>
        <Tooltip id="bodybuilding-tooltip" place="top" style={{ zIndex: 1000 }}>
            Questions focused on bodybuilding, muscle gain, and related topics.
        </Tooltip>
    </div>
);
};

export default IntakeTemplates;
