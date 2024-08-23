import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';
import { FaInfoCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';
import { format, differenceInYears } from 'date-fns';





const DemoPrompt = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [intensityLevel, setIntensityLevel] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [additionalComments, setAdditionalComments] = useState('');
  const [allSummaries, setAllSummaries] = useState([]);
  const [selectedSummary, setSelectedSummary] = useState(null);
  const [basePrompt, setBasePrompt] = useState('');
  const [showFullPrompt, setShowFullPrompt] = useState(false);
  const [showBasePrompt, setShowBasePrompt] = useState(false);
  const [clientName, setClientName] = useState('');
  const [intensityDescription, setIntensityDescription] = useState('');
  const [workoutDescription, setWorkoutDescription] = useState('');
  const [clientAge, setClientAge] = useState('');
  const [clientGender, setClientGender] = useState('');

  

  const calculateAge = (dob) => {
    if (!dob) return null;
    return differenceInYears(new Date(), new Date(dob));
};

  useEffect(() => {
    console.log("Fetching summaries for clientId:", clientId);
    axios.get(`http://localhost:5000/api/get_base_prompts/${clientId}`)
      .then(response => {
        const summaries = response.data;
        console.log("Summaries retrieved:", summaries);

        if (summaries.length > 0) {
          setAllSummaries(summaries);
          const latestSummary = summaries[0].id; // Automatically select the latest summary
          setSelectedSummary(latestSummary); // Set selected summary to the latest one
          setBasePrompt(latestSummary.summary_prompt); // Directly use the summary_prompt as the basePrompt
          setClientName(`${summaries[0].id.first_name} ${summaries[0].id.last_name}`);
          setClientAge(calculateAge(summaries[0].id.dob)); // Use calculateAge to set the client's age
          setClientGender(`${summaries[0].id.gender}`.toLowerCase()); // Convert gender to lowercase
          console.log("Latest summary selected:", latestSummary);
        } else {
          console.log("No summaries available for the client.");
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching summaries:', error);
        setError('Failed to fetch summaries');
        setLoading(false);
      });
  }, [clientId]);


  const handleSummaryChange = (e) => {
    const summaryId = e.target.value;
    console.log("Summary selected:", summaryId);
    const selectedSummary = allSummaries.find(summary => summary.id === parseInt(summaryId));
    if (selectedSummary) {
      setSelectedSummary(selectedSummary);
      setBasePrompt(selectedSummary.summary_prompt); // Use the summary_prompt as basePrompt
      console.log("Base prompt updated to:", selectedSummary.summary_prompt);
    }
  };

  const updateDescriptions = () => {
    let intensityDesc = '';
    let workoutDesc = '';

    switch (intensityLevel) {
      case 'Beginner':
        intensityDesc = 'Beginner - Suitable for those new to exercise. Focuses on building foundational strength and endurance.';
        break;
      case 'Intermediate':
        intensityDesc = 'Intermediate - For those with some experience. Emphasizes progression and more complex movements.';
        break;
      case 'Advanced':
        intensityDesc = 'Advanced - Targets seasoned individuals. Involves high intensity, complex exercises for peak performance.';
        break;
      default:
        break;
    }

    switch (workoutType) {
      case 'Functional':
        workoutDesc = 'Functional - Focuses on improving overall functional strength and mobility, emphasizing exercises that mimic real-life movements.'
        break;
      case 'Hypertrophy':
        workoutDesc = 'Hypertrophy - Aims to increase muscle size with moderate to heavy weights and higher repetitions.';
        break;
      case 'Strength':
        workoutDesc = 'Strength - Focuses on building maximal strength using low repetitions and heavier weights.';
        break;
      case 'Endurance':
        workoutDesc = 'Endurance - Enhances stamina with higher repetitions and moderate weights, including cardio exercises.';
        break;
      default:
        break;
    }

    setIntensityDescription(intensityDesc);
    setWorkoutDescription(workoutDesc);
  };

  useEffect(() => {
    updateDescriptions();
  }, [intensityLevel, workoutType]);

  useEffect(() => {
    if (selectedSummary) {
        let detailedPrompt = `Create a 3-day personalized workout plan for ${clientName}, a ${clientAge}-year-old ${clientGender} with the following profile:`;

        if (selectedSummary.goals) {
            detailedPrompt += `\n- Goals: ${selectedSummary.goals}`;
        }
        if (selectedSummary.medical_history) {
            detailedPrompt += `\n- Medical History: ${selectedSummary.medical_history}`;
        }
        if (selectedSummary.physical_limitations) {
            detailedPrompt += `\n- Physical Limitations: ${selectedSummary.physical_limitations}`;
        }
        if (selectedSummary.exercise_preferences) {
            detailedPrompt += `\n- Exercise Preferences: ${selectedSummary.exercise_preferences}`;
        }
        if (selectedSummary.lifestyle_factors) {
            detailedPrompt += `\n- Lifestyle Factors: ${selectedSummary.lifestyle_factors}`;
        }
        if (selectedSummary.motivation) {
            detailedPrompt += `\n- Motivation: ${selectedSummary.motivation}`;
        }
        if (selectedSummary.current_exercise_routine) {
            detailedPrompt += `\n- Current Exercise Routine: ${selectedSummary.current_exercise_routine}`;
        }
        if (selectedSummary.challenges) {
            detailedPrompt += `\n- Challenges: ${selectedSummary.challenges}`;
        }

        detailedPrompt += `\n\nPlease generate a workout plan considering the above details.`;

        // Add additional instructions based on the selected intensity level and workout type
        if (intensityLevel) {
            detailedPrompt += generateIntensityDetails(intensityLevel);
        }

        if (workoutType) {
            detailedPrompt += generateWorkoutDetails(workoutType);
        }

        setFinalPrompt(detailedPrompt);
        console.log("Final modified prompt:", detailedPrompt);
    }
}, [intensityLevel, workoutType, selectedSummary]);

const generateIntensityDetails = (intensityLevel) => {
    switch (intensityLevel) {
        case 'Beginner':
            return '\nThe workout intensity should be designed for a beginner, focusing on foundational strength and endurance. Emphasize gradual progression, low impact exercises, and mastering basic movements to build confidence and reduce injury risk.';
        case 'Intermediate':
            return '\nThe workout intensity should cater to an intermediate fitness level, focusing on progressive overload and enhancing complexity. Include a mix of compound and isolation exercises, with a moderate increase in volume and intensity to challenge the client while preventing plateaus.';
        case 'Advanced':
            return '\nThe workout intensity should be tailored for an advanced client, incorporating high-intensity, complex exercises with a focus on peak performance. Utilize advanced techniques like supersets, dropsets, and periodization to push the client’s limits and achieve maximum results.';
        default:
            return '';
    }
};

const generateWorkoutDetails = (workoutType) => {
    switch (workoutType) {
        case 'Functional':
            return '\nThe focus will be on functional training, aiming to improve overall functional strength and mobility. Include exercises that mimic real-life movements, emphasize balance, coordination, and core stability.';
        case 'Hypertrophy':
            return '\nThe focus will be on hypertrophy training, which involves exercises designed to increase muscle size through moderate to heavy weights and higher repetitions (8-12 reps per set). Ensure the plan includes advanced hypertrophy techniques such as drop sets and progressive overload, emphasizing proper form and recovery.';
        case 'Strength':
            return '\nThe focus will be on strength training, emphasizing low repetitions (4-6 reps per set) with heavier weights to build maximal strength. Incorporate compound movements like deadlifts, squats, and bench presses, with progressive overload techniques to ensure continual strength gains.';
        case 'Endurance':
            return '\nThe focus will be on endurance training, incorporating higher repetitions (15-20 reps per set) with moderate weights. Include cardio exercises such as interval training and circuit routines to improve stamina, cardiovascular health, and muscular endurance.';
        default:
            return '';
    }
};

  const validateForm = () => {
    setErrors({});
    let valid = true;

    if (!intensityLevel || !workoutType) {
      setErrors(prevErrors => ({
        ...prevErrors,
        prompt: 'Please select both intensity level and workout type before submitting.'
      }));
      valid = false;
    }

    return valid;
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const data = {
      promptContent: finalPrompt,
      comments: additionalComments,
    };

    try {
      setSubmitting(true);
      console.log("Submitting data:", data);
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
      setSubmitting(false);
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
      <h1 className="text-2xl font-bold text-center mt-4">Quick Plan Generator</h1>
      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={() => navigate(-1)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
          Return Back
        </button>
      </div>
      <div className="my-4">
        <div className="flex items-center">
          <h2 className="text-xl font-medium text-gray-700">Client: {clientName}</h2>
          <FaInfoCircle
            className="ml-2 text-blue-600 cursor-pointer"
            onClick={() => setShowBasePrompt(!showBasePrompt)}
            data-tooltip-id={`tooltip-summary`}
            data-tooltip-content="View Client Summary"
          />
          <Tooltip id={`tooltip-summary`} place="right" type="dark" effect="solid" style={{ padding: '3px 8px', fontSize: '12px' }} />
        </div>
        {showBasePrompt && (
          <div className="mt-2 p-4 bg-gray-100 rounded-md">
            <h3 className="text-lg font-medium text-gray-700">Base Prompt (Summary):</h3>
            <p>{basePrompt}</p>
          </div>
        )}
      </div>

      <div className="my-4">
        <label htmlFor="summarySelect" className="block text-lg font-medium text-gray-700">Select a Summary:</label>
        <select
          id="summarySelect"
          value={selectedSummary?.id}
          onChange={handleSummaryChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {allSummaries.map((summary) => (
            <option key={summary.id.id} value={summary.id.id}>
              {summary.id.summary_type} - {new Date(summary.id.created_at).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      <div className="my-4">
        <label htmlFor="intensityLevel" className="block text-lg font-medium text-gray-700">Select Intensity Level:</label>
        <select id="intensityLevel" name="intensityLevel" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" onChange={(e) => setIntensityLevel(e.target.value)}>
          <option value="">Select Level</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </div>

      <div className="my-4">
        <label htmlFor="workoutType" className="block text-lg font-medium text-gray-700">Select Workout Type:</label>
        <select id="workoutType" name="workoutType" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" onChange={(e) => setWorkoutType(e.target.value)}>
          <option value="">Select Type</option>
          <option value="Functional">Functional</option>
          <option value="Hypertrophy">Hypertrophy</option>
          <option value="Strength">Strength</option>
          <option value="Endurance">Endurance</option>
        </select>
      </div>

      {/* Always show key details */}
      <div className="my-4">
        <h2 className="text-lg font-medium text-gray-700">Selected Plan Overview:</h2>
        <p className="p-4 bg-gray-100 rounded-md">
          {intensityLevel ? `Intensity Level: ${intensityDescription}` : 'No Intensity Level Selected'}
          <br />
          {workoutType ? `Workout Type: ${workoutDescription}` : 'No Workout Type Selected'}
        </p>
      </div>

      {/* Toggle for full prompt details */}
      <div className="my-4">
        <button 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" 
          onClick={() => setShowFullPrompt(!showFullPrompt)}>
          {showFullPrompt ? 'Hide Full Details' : 'View Full Details'}
        </button>
        {showFullPrompt && (
          <div className="mt-4 p-4 bg-gray-200 rounded-md">
            <h2 className="text-lg font-medium text-gray-700">Final Modified Prompt:</h2>
            <p className="p-4 bg-gray-100 rounded-md">{finalPrompt}</p>
          </div>
        )}
      </div>

      {/* Submit Button */}
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

      <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded" onClick={submitHandler} disabled={submitting}>
        Generate Example Plan
      </button>

      {errors.submitError && <div className="text-red-500 text-sm mt-2">{errors.submitError}</div>}
    </div>
  );
};

export default DemoPrompt;
