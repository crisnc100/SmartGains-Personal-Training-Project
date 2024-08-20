import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';

const DemoPrompt = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [basePrompt, setBasePrompt] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [intensityLevel, setIntensityLevel] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [finalPrompt, setFinalPrompt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [additionalComments, setAdditionalComments] = useState('');
  const [allSummaries, setAllSummaries] = useState([]);
  const [selectedSummaryId, setSelectedSummaryId] = useState(null);

  useEffect(() => {
    console.log("Fetching summaries for clientId:", clientId);
    axios.get(`http://localhost:5000/api/get_base_prompts/${clientId}`)
      .then(response => {
        const summaries = response.data;
        console.log("Summaries retrieved:", summaries);

        if (summaries.length > 0) {
          setAllSummaries(summaries);
          const latestSummary = summaries[0].id;
          setSelectedSummaryId(latestSummary.id);  // Automatically select the latest summary
          setBasePrompt(latestSummary.summary_prompt);  // Load the prompt from the latest summary
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
    setSelectedSummaryId(summaryId);

    const selectedSummary = allSummaries.find(summary => summary.id === parseInt(summaryId));
    if (selectedSummary) {
      setBasePrompt(selectedSummary.summary_prompt);
      console.log("Base prompt updated to:", selectedSummary.summary_prompt);
    }
  };

  useEffect(() => {
    if (basePrompt) {
      let modifiedPrompt = basePrompt;
      console.log("Modifying prompt:", modifiedPrompt);

      if (intensityLevel) {
        modifiedPrompt = modifiedPrompt.replace(/(beginner|intermediate|advanced)/i, intensityLevel.toLowerCase());
        modifiedPrompt += ` This plan is adjusted to the ${intensityLevel} level as selected.`;
        console.log("Intensity level adjusted:", intensityLevel);
      }

      if (workoutType) {
        modifiedPrompt += ` The focus will be on ${workoutType} training.`;
        console.log("Workout type adjusted:", workoutType);
      }

      setFinalPrompt(modifiedPrompt);
      console.log("Final modified prompt:", modifiedPrompt);
    }
  }, [intensityLevel, workoutType, basePrompt]);

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
      <h1 className="text-2xl font-bold text-center mt-4">Select Workout Prompt</h1>
      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={() => navigate(-1)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
          Return Back
        </button>
      </div>

      <div className="my-4">
        <label htmlFor="summarySelect" className="block text-lg font-medium text-gray-700">Select a Summary:</label>
        <select
          id="summarySelect"
          value={selectedSummaryId}
          onChange={handleSummaryChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {allSummaries.map((summary) => (
            <option key={summary.id.id} value={summary.id.id}>  {/* Adjusted to nested id */}
              {summary.id.summary_type} - {new Date(summary.id.created_at).toLocaleString()}  {/* Adjusted to nested data */}
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
          <option value="Hypertrophy">Hypertrophy</option>
          <option value="Strength">Strength</option>
          <option value="Endurance">Endurance</option>
        </select>
      </div>

      <div className="my-4">
        <h2 className="text-lg font-medium text-gray-700">Base Prompt:</h2>
        <p className="p-4 bg-gray-100 rounded-md">{basePrompt}</p>
      </div>

      <div className="my-4">
        <h2 className="text-lg font-medium text-gray-700">Final Modified Prompt:</h2>
        <p className="p-4 bg-gray-100 rounded-md">{finalPrompt}</p>
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

      {errors.prompt && <div className="text-red-500 text-sm mt-2">{errors.prompt}</div>}
      {errors.submitError && <div className="text-red-500 text-sm mt-2">{errors.submitError}</div>}
    </div>
  );
};

export default DemoPrompt;
