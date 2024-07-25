import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const IntakeForm = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [intakeForm, setIntakeForm] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedCurrentQuestions = JSON.parse(localStorage.getItem('currentQuestions'));
    if (savedCurrentQuestions) {
      setQuestions(savedCurrentQuestions);
      initializeForm(savedCurrentQuestions);
      setLoading(false);
    } else {
      fetchDefaultQuestions();
    }
  }, []);

  const fetchDefaultQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/get_user_default_questions');
      setQuestions(response.data);
      initializeForm(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching default questions:', error);
    }
  };

  const initializeForm = (questions) => {
    const formState = {};
    questions.forEach(question => {
      formState[question.id] = question.question_type === 'checkbox' ? [] : '';
    });
    setIntakeForm(formState);
  };

  const handleInputChange = (event, questionId) => {
    setIntakeForm({
      ...intakeForm,
      [questionId]: event.target.value
    });
  };

  const handleCheckboxChange = (event, questionId) => {
    const { value } = event.target;
    setIntakeForm((prevState) => {
      const updatedArray = prevState[questionId].includes(value)
        ? prevState[questionId].filter(item => item !== value)
        : [...prevState[questionId], value];
      return {
        ...prevState,
        [questionId]: updatedArray
      };
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/add_intake_form', { clientId, intakeForm });
      console.log("Response Data:", response.data);
      navigate('/trainer_dashboard/ai-recommend-insights');
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
    }
  };

  const goBack = () => {
    navigate(-1);
  };

  const groupedQuestions = questions.reduce((acc, question) => {
    if (!acc[question.category]) {
      acc[question.category] = [];
    }
    acc[question.category].push(question);
    return acc;
  }, {});

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-end space-x-2 mt-2">
        <button onClick={goBack} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
          Return Back
        </button>
      </div>
      <div className="flex justify-center px-4">
        <form onSubmit={handleSubmit} className="w-full max-w-4xl">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-semibold text-gray-900">Consultation Intake Form</h1>
            <button 
              onClick={() => navigate('customize')}
              className="text-white bg-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm p-2.5 mt-4 mb-6"
            >
              Customize Form
            </button>
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
          <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full p-2.5 text-center mt-6">
            Submit and Get AI Insights
          </button>
        </form>
      </div>
    </div>
  );
};

export default IntakeForm;
