import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ClipLoader } from 'react-spinners';
import { useNavigate, useParams } from 'react-router-dom';


const AIOverview = () => {
  const { clientId } = useParams(); // Using useParams to get clientId from the URL if it's a route parameter
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/get_ai_insights', {
          withCredentials: true
        });
        if (response.data.insights) {
          setInsights(response.data.insights);
        } else {
          setError('No AI insights found');
        }
      } catch (err) {
        setError('Error fetching AI insights');
        console.error('Error fetching AI insights:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAIInsights();
  }, [clientId]);

  const handleContinue = () => {
    navigate(`/trainer_dashboard/add_client/${clientId}/additional-services/intake-form/success-intake_options`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#3498db" size={150} />
        <p className="text-lg text-gray-700 mt-4">Loading AI insights...</p>
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
    <div className="p-4">
      <h1 className="text-4xl font-semibold text-gray-900 mb-6">AI Insights for Client</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <p className="text-lg text-gray-800 whitespace-pre-line">{insights}</p>
      </div>
      <div className="text-center">
        <button onClick={handleContinue} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
          Continue
        </button>
      </div>
    </div>
  );
};

export default AIOverview