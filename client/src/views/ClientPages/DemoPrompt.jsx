import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import ReactDOMServer from 'react-dom/server';
import { format, differenceInYears } from 'date-fns';
import ClipLoader from 'react-spinners/ClipLoader';  // Imported the spinner component

const DemoPrompt = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [allClientData, setAllClientData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPrompt, setSelectedPrompt] = useState(null);  
  const [availablePrompts, setAvailablePrompts] = useState([]);
  const [additionalComments, setAdditionalComments] = useState('');
  const [expandedPromptIndex, setExpandedPromptIndex] = useState(null);
  const [submitting, setSubmitting] = useState(false);  // State for loading spinner

  const calculateAge = (dob) => {
    if (!dob) return null;
    return differenceInYears(new Date(), new Date(dob));
  };

  useEffect(() => {
    axios.get(`http://localhost:5000/api/current_client/${clientId}`)
      .then(response => {
        console.log("Initial data fetched:", response.data);
        setAllClientData(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data');
        setLoading(false);
      });
  }, [clientId]);

  const prompts = allClientData && allClientData.client_data ? {
    'Beginner': [
      {
        id: 'beginner1',
        content: (
          <>Develop a beginner-friendly 3-day workout plan for <strong>{allClientData.client_data.first_name} {allClientData.client_data.last_name}</strong>, a
            <strong> {calculateAge(allClientData.client_data.dob)}</strong>-year-old <strong>{allClientData.client_data.gender}</strong>, aiming to achieve goals if any:
            "<strong>{allClientData.consultation_data ? allClientData.consultation_data.fitness_goals : 'no data provided'}</strong>". This client leads a sedentary lifestyle, has minimal exercise
            experience, and may have medical considerations such as "<strong>{allClientData.history_data ? allClientData.history_data.existing_conditions : 'no data provided'}</strong>". The plan should
            incorporate low-impact, functional exercises to enhance daily living activities, improve cardiovascular
            health, and build foundational strength. Emphasize safety, technique, and gradual progression.
            Take into account the client's equipment availability. Specifically include exercises the client likes if documented,
            such as: "<strong>{allClientData.consultation_data ? allClientData.consultation_data.exercise_likes : 'no data provided'}</strong>", and avoid exercises the client dislikes if documented,
            such as: "<strong>{allClientData.consultation_data ? allClientData.consultation_data.exercise_dislikes : 'no data provided'}</strong>". Tailor the workouts to respect these
            preferences, promoting a positive and sustainable fitness journey.</>),
      },
      {
        id: 'beginner2',
        content: (<>Create a 3-day workout plan for beginner-level hypertrophy and strength training for
          <strong>{allClientData.client_data.first_name} {allClientData.client_data.last_name}</strong>, a
          <strong> {calculateAge(allClientData.client_data.dob)}</strong>-year-old <strong>{allClientData.client_data.gender}</strong>, focusing on slow progression
          and basic strength-building exercises. Goals if any: "<strong>{allClientData.consultation_data ? allClientData.consultation_data.fitness_goals : 'no data provided'}</strong>".
          Background conditions if any: "<strong>{allClientData.history_data ? allClientData.history_data.existing_conditions : 'no data provided'}</strong>". Include exercises that
          target major muscle groups with an emphasis on technique, safety, and gradual progression in strength and
          muscle building. Specifically include exercises the client likes if documented, such as:
          "<strong>{allClientData.consultation_data ? allClientData.consultation_data.exercise_likes : 'no data provided'}</strong>", and try to avoid exercises the client dislikes if
          there's any: "<strong>{allClientData.consultation_data ? allClientData.consultation_data.exercise_dislikes : 'no data provided'}</strong>". Tailor the workouts to respect these
          preferences, promoting a positive and sustainable fitness journey.
        </>),
      },
      {
        id: 'beginner3',
        content: (<>
          Develop a beginner-friendly 3-day workout plan for <strong>{allClientData.client_data.first_name}
            {allClientData.client_data.last_name}</strong>, a <strong>{calculateAge(allClientData.client_data.dob)}</strong>-year-old
          <strong> {allClientData.client_data.gender}</strong> aiming to enhance cardiovascular health and build endurance.
          Goals if any: "<strong>{allClientData.consultation_data ? allClientData.consultation_data.fitness_goals : 'no data provided'}</strong>". Exercise habits if documented:
          "<strong>{allClientData.consultation_data ? allClientData.consultation_data.exercise_habits : 'no data provided'}</strong>". The routine should introduce low to moderate-intensity
          cardiovascular exercises, gradually improving stamina and heart health. Specifically include exercises the
          client likes if documented, such as "<strong>{allClientData.consultation_data ? allClientData.consultation_data.exercise_likes : 'no data provided'}</strong>",
          and avoid exercises the client dislikes if documented, ensuring "<strong>{allClientData.consultation_data ? allClientData.consultation_data.exercise_dislikes : 'no data provided'}</strong>".
          Tailor the workouts to respect these preferences, promoting a positive and sustainable fitness journey.
        </>)
      }
    ],
    'Intermediate': [
      {
        id: 'intermediate1',
        content: (<>Design an intermediate-level 3-day functional training workout plan for
          <strong>{allClientData.client_data.first_name} {allClientData.client_data.last_name}</strong>, aged <strong>{calculateAge(allClientData.client_data.dob)}</strong> years
          <strong> {allClientData.client_data.gender}</strong>, with some exercise experience. Objectives if any:
          "<strong>{allClientData.consultation_data ? allClientData.consultation_data.fitness_goals : 'no data provided'}</strong>". Considering the medical history if any:
          "<strong>{allClientData.history_data ? allClientData.history_data.existing_conditions : 'no data provided'}</strong>". This plan should integrate compound movements and
          functional exercises to enhance overall body strength, mobility, and coordination. Specifically include
          exercises the client likes if any:, such as "<strong>{allClientData.consultation_data ? allClientData.consultation_data.exercise_likes : 'no data provided'}</strong>", and avoid exercises the
          client dislikes if any: ensuring "<strong>{allClientData.consultation_data ? allClientData.consultation_data.exercise_dislikes : 'no data provided'}</strong>". Tailor the workouts to
          respect these preferences, promoting a positive and sustainable fitness journey.</>),
      },
      {
        id: 'intermediate2',
        content: (<>
          Formulate an intermediate 3-day workout plan focusing on hypertrophy and strength development for
          <strong>{allClientData.client_data.first_name} {allClientData.client_data.last_name}</strong>, aged
          <strong> {calculateAge(allClientData.client_data.dob)}</strong> years <strong>{allClientData.client_data.gender}</strong>. Prioritize exercises that
          enhance muscle growth and strength, such as progressive overload in weightlifting. Incorporate variety in
          exercise selection to target all major muscle groups effectively, aligning with the client goals if any:
          "<strong>{allClientData.consultation_data ? allClientData.consultation_data.fitness_goals : 'no data provided'}</strong>" and taking into account of any conditions:
          "<strong>{allClientData.history_data ? allClientData.history_data.existing_conditions : 'no data provided'}</strong>". Specifically include exercises the client likes if documented,
          such as "<strong>{allClientData.consultation_data ? allClientData.consultation_data.exercise_likes : 'no data provided'}</strong>", and avoid exercises the client dislikes if documented,
          ensuring "<strong>{allClientData.consultation_data ? allClientData.consultation_data.exercise_dislikes : 'no data provided'}</strong>". Tailor the workouts to respect these preferences,
          promoting a positive and sustainable fitness journey.
        </>),
      },
      {
        id: 'intermediate3',
        content: (<>
          Create an intermediate 3-day cardiovascular and endurance workout plan for <strong>{allClientData.client_data.first_name} {allClientData.client_data.last_name}</strong>,
          aged <strong>{calculateAge(allClientData.client_data.dob)}</strong> years <strong> {allClientData.client_data.gender}</strong>, to boost heart health and stamina. Plan should include a mix of
          moderate to high-intensity cardio exercises and longer duration sessions to progressively enhance
          cardiovascular endurance. Factor in goals if any: "<strong>{allClientData.consultation_data ? allClientData.consultation_data.fitness_goals : 'no data provided'}</strong>" and
          medical conditions if any: "<strong>{allClientData.history_data ? allClientData.history_data.existing_conditions : 'no data provided'}</strong>" for a comprehensive approach
          to improving endurance and stamina. Specifically include exercises the client likes if documented,
          such as "<strong>{allClientData.consultation_data ? allClientData.consultation_data.exercise_likes : 'no data provided'}</strong>", and avoid exercises the client dislikes if documented,
          ensuring "<strong>{allClientData.consultation_data ? allClientData.consultation_data.exercise_dislikes : 'no data provided'}</strong>". Tailor the workouts to respect these
          preferences, promoting a positive and sustainable fitness journey.
        </>)
      }
    ],
    'Advanced': [
      {
        id: 'advanced1',
        content: (<>Devise an advanced 3-day functional and performance training workout plan for <strong>{allClientData.client_data.first_name} {allClientData.client_data.last_name}</strong>,
          a seasoned athlete aged <strong>"{calculateAge(allClientData.client_data.dob)}</strong>. Target goals if any: <strong>
            {allClientData.consultation_data.fitness_goals ? allClientData.consultation_data.fitness_goals : 'no data provided'}"</strong>.
          Incorporate high-intensity functional movements and performance drills that challenge strength, power,
          agility, and endurance, tailored to the client's robust fitness background and
          any existing conditions: "<strong>{allClientData.history_data ? allClientData.history_data.existing_conditions : 'no data provided'}</strong>".</>),
      },
      {
        id: 'advanced2',
        content: (<>
          Construct an advanced 3-day hypertrophy and strength training program for <strong>{allClientData.client_data.first_name} {allClientData.client_data.last_name}</strong>,
          aged <strong>{calculateAge(allClientData.client_data.dob)}</strong> years <strong> {allClientData.client_data.gender}</strong>. This plan should push the boundaries of muscle growth and strength,
          incorporating advanced lifting techniques, high-volume sets, and periodized strength progression. Goals if any:
          "<strong>{allClientData.consultation_data ? allClientData.consultation_data.fitness_goals : 'no data provided'}</strong>", accommodating the client's extensive exercise history and
          any conditions: "<strong>{allClientData.history_data ? allClientData.history_data.existing_conditions : 'no data provided'}</strong>".
        </>),
      },
      {
        id: 'advanced3',
        content: (<>
          Design an advanced 3-day cardiovascular and endurance training regimen for <strong>{allClientData.client_data.first_name} {allClientData.client_data.last_name}</strong>,
          a <strong>{calculateAge(allClientData.client_data.dob)}</strong>-year-old <strong> {allClientData.client_data.gender}</strong>, aiming to optimize cardiorespiratory fitness and endurance. Include
          high-intensity interval training (HIIT), tempo runs, and endurance cycling sessions, progressively
          intensifying the workload to meet the ambitious fitness objectives of the client if any:
          "<strong>{allClientData.consultation_data ? allClientData.consultation_data.fitness_goals : 'no data provided'}</strong>" while considering any conditions
          "<strong>{allClientData.history_data ? allClientData.history_data.existing_conditions : 'no data provided'}</strong>".
        </>)
      }
    ]
  } : {};

  const handlePromptSelection = (promptId) => {
    const selected = availablePrompts.find(p => p.id === promptId);
    if (selected) {
        const htmlContent = ReactDOMServer.renderToStaticMarkup(selected.content);
        setSelectedPrompt({ id: selected.id, content: htmlContent }); // Storing HTML string
    } else {
        setSelectedPrompt(null); 
    }
  };

  const handleLevelChange = (e) => {
    const level = e.target.value;
    setAvailablePrompts(prompts[level] || []);
    setSelectedPrompt('');
  };

  const validateForm = () => {
    setErrors({});

    let valid = true;
    if (!selectedPrompt) {
      setErrors(prevErrors => ({
        ...prevErrors,
        prompt: 'Please select a prompt before submitting.'
      }));
      valid = false;
    }

    return valid;
  };

  const handleCommentsChange = (e) => {
    setAdditionalComments(e.target.value);
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
        console.error("Validation failed.");
        return;
    }

    const data = {
        promptContent: selectedPrompt.content,  
        comments: additionalComments,
    };

    console.log("Submitting data:", data);

    try {
        setSubmitting(true);  // Show loading spinner
        const res = await axios.post(`http://localhost:5000/api/generate_quick_plan/${clientId}`, data, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        console.log("Response data:", res.data);
        navigate(`success`);  
    } catch (err) {
        console.error("Error during submission:", err);
        handleErrorResponse(err);
    } finally {
        setSubmitting(false);  // Hide loading spinner
    }
  };

  const handleErrorResponse = (err) => {
    if (err.response && err.response.data && err.response.data.errors) {
      setErrors(prevErrors => ({
        ...prevErrors,
        ...err.response.data.errors
      }));
    } else {
      setErrors(prevErrors => ({
        ...prevErrors,
        submitError: 'An unexpected error occurred.'
      }));
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4" style={{ color: 'black' }}>
      <h1 className="text-2xl font-bold text-center mt-4">Select Workout Prompt</h1>
      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={() => navigate(-1)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
          Return Back
        </button>
      </div>
      <div className="my-4">
        <label htmlFor="level" className="block text-lg font-medium text-gray-700">Client's Fitness Level:</label>
        <select id="level" name="level" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" onChange={handleLevelChange}>
          <option value="">Select Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>
      <div className="prompts space-y-4">
        {availablePrompts.map((prompt, index) => (
          <div key={index} className="bg-white p-4 shadow rounded-md">
            <label className="flex items-center text-lg text-gray-800 cursor-pointer">
              <input
                type="radio"
                name="workoutPrompt"
                value={prompt.id}
                checked={selectedPrompt?.id === prompt.id}
                onChange={() => handlePromptSelection(prompt.id)}
                className="form-radio h-5 w-5 text-indigo-600"
              />
              <span onClick={() => setExpandedPromptIndex(expandedPromptIndex === index ? null : index)} className="ml-2">
                {index === 0 ? "Functional" : index === 1 ? "Strength Hypertrophy" : "Strength Endurance"} (Click to Expand/Collapse)
              </span>
            </label>
            {expandedPromptIndex === index && (
              <div className="text-sm mt-2 p-3 border rounded bg-gray-100 overflow-y-auto" style={{ maxHeight: '200px' }}>
                {prompt.content}
              </div>
            )}
          </div>
        ))}
        {errors.prompt && <div className="text-red-500 text-sm mt-2">{errors.prompt}</div>}
      </div>
      <div className="my-4">
        <textarea
          id="additional_comments"
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
          rows="5"
          placeholder="Enter any additional comments or philosophies here..."
          onChange={(e) => setAdditionalComments(e.target.value)}
        />
      </div>
      {submitting && (
        <div className="flex justify-center my-4">
          <ClipLoader color={"#123abc"} loading={submitting} size={150} />
        </div>
      )}
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={submitHandler} disabled={submitting}>
        Generate Example Plan
      </button>
      {errors.submitError && <div className="text-red-500 text-sm mt-2">{errors.submitError}</div>}
    </div>
  );
};

export default DemoPrompt;
