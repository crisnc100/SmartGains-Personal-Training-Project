import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { useNavigate, useParams } from 'react-router-dom';

const AIOverview = () => {
  const { clientId } = useParams(); // Using useParams to get clientId from the URL if it's a route parameter
  const [clientSummary, setClientSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formId, setFormId] = useState(null); // Add state to store form ID

  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientSummary = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/get_recent_client_summary/${clientId}`, {
          withCredentials: true
        });
        if (response.data.client_summary) {
          // Adjusting to access the nested structure
          const nestedSummary = response.data.client_summary.id; // Adjust according to the actual nesting
          setClientSummary(nestedSummary);
          setFormId(response.data.client_summary.form_id); // Set the form ID from the response

        } else {
          setError('No client AI summary found');
        }
      } catch (err) {
        setError('Error fetching client AI summary');
        console.error('Error fetching client AI summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientSummary();
  }, [clientId]);

  const handleContinue = () => {
    navigate(`/trainer_dashboard/add_client/${clientId}/additional-services/intake-form/success-intake_options`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#3498db" size={150} />
        <p className="text-lg text-gray-700 mt-4">Loading client summary...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg text-red-600 mt-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-4xl font-semibold text-gray-900 mb-6">Client Summary</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Summary</h2>
          <p className="text-lg text-gray-800 whitespace-pre-line">
            {clientSummary.summary_text ? clientSummary.summary_text : 'No summary available.'}
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Prompt for Workout Plan</h2>
          <p className="text-lg text-gray-800 whitespace-pre-line">
            {clientSummary.summary_prompt ? clientSummary.summary_prompt : 'No prompt available.'}
          </p>
        </div>
      </div>
      <div className="text-center mt-8">
        <button onClick={handleContinue} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Continue
        </button>
      </div>
    </div>
  );
};

export default AIOverview;
