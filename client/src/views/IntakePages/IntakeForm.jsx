import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

const IntakeForm = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();

  const goBack = () => {
    navigate(-1);
  };

  const initialFormState = {
    client_id: clientId,
    prior_exercise_programs: "",
    exercise_habits: "",
    exercise_time_day: "",
    self_fitness_level: "",
    fitness_goals: [],
    motivation: [],
    progress_measurement: "Weight",
    barriers_challenges: "",
    area_specifics: "",
    exercise_likes: [],
    exercise_dislikes: [],
    warm_up_info: "",
    cool_down_info: "",
    stretching_mobility: "",
    daily_routine: "",
    stress_level: "5",
    smoking_alcohol_habits: "",
    hobbies: ""
  };

  const [intakeForm, setIntakeForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const questionLabels = {
    prior_exercise_programs: "Have you participated in any fitness programs or worked with a personal trainer before? Please describe.",
    exercise_habits: "What are your current exercise habits? (Include frequency, duration, and types of exercise)",
    exercise_time_day: "What time of day do you prefer to work out?",
    self_fitness_level: "How would you rate your current fitness level?",
    fitness_goals: "What are your fitness goals?",
    motivation: "What motivates you to exercise?",
    progress_measurement: "How do you prefer to measure progress in your fitness journey?",
    barriers_challenges: "What barriers or challenges do you face when it comes to exercising regularly?",
    area_specifics: "Are there specific areas of your body you want to focus on?",
    exercise_likes: "What types of exercise do you enjoy most?",
    exercise_dislikes: "Are there any types of exercise you dislike or want to avoid?",
    warm_up_info: "How do you warm up before exercising?",
    cool_down_info: "How do you cool down after exercising?",
    stretching_mobility: "Do you incorporate stretching or mobility work into your routine?",
    daily_routine: "Describe your typical daily routine, including your work schedule, sleep patterns, and stress levels.",
    stress_level: "On a scale of 1 to 10, how would you rate your stress levels?",
    smoking_alcohol_habits: "Do you smoke or consume alcohol? If yes, how frequently?",
    hobbies: "What are your hobbies or activities you enjoy outside of work?"
  };

  const predefinedOptions = {
    fitness_goals: ["Weight Loss", "Muscle Gain", "Improved Endurance", "Flexibility", "Overall Fitness", "Other"],
    motivation: ["Health benefits", "Physical appearance", "Stress relief", "Social interaction", "Competition", "Other"],
    progress_measurement: ["Weight", "Body Measurements", "Strength Gains", "Endurance Improvements"],
    self_fitness_level: ["Beginner", "Intermediate", "Advanced"],
    exercise_time_day: ["Morning", "Afternoon", "Evening", "No Preference"],
    stress_level: Array.from({ length: 10 }, (_, i) => (i + 1).toString()),
    stretching_mobility: ["Yes", "No"]
  };

  const handleCheckboxChange = (event) => {
    const { name, value } = event.target;
    setIntakeForm((prevState) => {
      const updatedArray = prevState[name].includes(value)
        ? prevState[name].filter(item => item !== value)
        : [...prevState[name], value];
      return {
        ...prevState,
        [name]: updatedArray
      };
    });
  };

  const handleInputChange = (event) => {
    setIntakeForm({
      ...intakeForm,
      [event.target.name]: event.target.value
    });
  };

  const renderInputField = (key) => {
    if (key === 'client_id') {
      return null;
    }

    if (predefinedOptions[key]) {
      if (Array.isArray(predefinedOptions[key])) {
        if (predefinedOptions[key].every(option => typeof option === 'string')) {
          if (key === 'fitness_goals' || key === 'motivation' || key === 'exercise_likes' || key === 'exercise_dislikes') {
            return (
              <div className="flex flex-col" style={{ color: 'black' }}>
                {predefinedOptions[key].map(option => (
                  <label key={option} className="inline-flex items-center">
                    <input
                      type="checkbox"
                      name={key}
                      value={option}
                      checked={intakeForm[key].includes(option)}
                      onChange={handleCheckboxChange}
                      className="form-checkbox"
                      aria-label={option}
                    />
                    <span className="ml-2">{option}</span>
                  </label>
                ))}
                {key === "fitness_goals" && intakeForm[key].includes("Other") && (
                  <input
                    type="text"
                    name="fitness_goals_other"
                    value={intakeForm.fitness_goals_other}
                    onChange={handleInputChange}
                    placeholder="Please specify other fitness goals"
                    className="mt-2 bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
                {key === "motivation" && intakeForm[key].includes("Other") && (
                  <input
                    type="text"
                    name="motivation_other"
                    value={intakeForm.motivation_other}
                    onChange={handleInputChange}
                    placeholder="Please specify other motivation"
                    className="mt-2 bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
                  />
                )}
              </div>
            );
          } else {
            return (
              <select
                name={key}
                id={key}
                value={intakeForm[key]}
                onChange={handleInputChange}
                className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
                aria-label={questionLabels[key]}
              >
                <option value="">Select an option</option>
                {predefinedOptions[key].map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            );
          }
        }
      }
    } else {
      return (
        <input
          type="text"
          id={key}
          name={key}
          value={intakeForm[key]}
          onChange={handleInputChange}
          className="bg-white border border-black text-gray-900 text-sm rounded-lg block w-full p-2.5 focus:border-blue-500 focus:ring-blue-500"
          aria-label={questionLabels[key]}
        />
      );
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    let isValid = true;

    Object.keys(intakeForm).forEach(key => {
      if (key === 'client_id') return;
      if (Array.isArray(intakeForm[key])) {
        if (intakeForm[key].length === 0) {
          tempErrors[key] = 'This field is required';
          isValid = false;
        }
      } else if (typeof intakeForm[key] !== 'string' || !intakeForm[key].trim()) {
        tempErrors[key] = 'This field is required';
        isValid = false;
      }
    });

    setErrors(tempErrors);
    return isValid;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log('Validation failed', errors);
      return;
    }

    try {
      console.log("Sending data:", intakeForm);
      const res = await axios.post('http://localhost:5000/api/add_consultation', intakeForm, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      console.log("Response Data:", res.data);
      navigate('medical-history');
    } catch (err) {
      console.error("Submission error:", err);
      if (err.response) {
        console.error("Error response data:", err.response.data);
        console.error("Error status:", err.response.status);
        setErrors(prevErrors => ({
          ...prevErrors,
          ...err.response.data.errors,
        }));
      } else {
        setErrors(prevErrors => ({
          ...prevErrors,
          general: 'An unexpected error occurred. Please try again.'
        }));
      }
    }
  };

  return (
    <div>
      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={goBack} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
          Return Back
        </button>
      </div>
      <div className="flex justify-center my-2 px-4">
        <form onSubmit={submitHandler} className="w-full max-w-2xl">
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">Consultation Intake Form</h1>
          <div className="space-y-6">
            {Object.entries(intakeForm).map(([key, value]) => (
              <div key={key} className="form-group">
                <label className="block text-sm font-medium text-gray-900 capitalize no-transform" style={{ fontWeight: 'bold', fontSize: '15px', textTransform: 'none' }} htmlFor={key}>
                  {questionLabels[key]}
                </label>
                {renderInputField(key)}
                {errors[key] && (
                  <p className="mt-2 text-sm text-red-600">{errors[key]}</p>
                )}
              </div>
            ))}
          </div>
          <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm w-full p-2.5 text-center mt-6">
            Continue to Medical History
          </button>
        </form>
      </div>
    </div>
  );
};

export default IntakeForm;
