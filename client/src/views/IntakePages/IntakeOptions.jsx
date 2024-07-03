import React from 'react';
import { NavLink, useParams, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

const IntakeOptions = () => {
    const { clientId } = useParams(); 
    const navigate = useNavigate();

    const handleProceed = () => {
        navigate(`/trainer_dashboard/add_client/${clientId}/additional-services/intake-form/assessment-choice`); // Goes to performance assessments (flexibility assessment)
    };

    const handleSkip = () => {
        navigate(`/trainer_dashboard/add_client/${clientId}/additional-services/intake-form/choose-prompt`); // Goes to workout plan generator (Prompt page)
    };

    return (
        <div>
            <div className="flex justify-end space-x-2 mt-4">
        <button onClick={() => navigate(`/trainer_dashboard/all_clients/${clientId}/current-client`)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
          Return to Client
        </button>
      </div>
        <div className="max-w-2xl mx-auto p-6 bg-gray-100 border border-gray-300 rounded-lg text-center">
            
            <h1 className="text-xl font-semibold text-gray-800">Ready to Proceed?</h1>
            <p className="mt-4 text-gray-600">
                Completing the performance assessments allows us to gain a deeper understanding of your client's fitness level, enabling the AI to create a more accurate and personalized workout plan.
            </p>
            <div className="flex justify-around mt-6">
                <button 
                    onClick={handleProceed} 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    style={{ transition: 'background-color 0.3s' }}>
                    Proceed to Assessments
                </button>
                <button 
                    onClick={handleSkip} 
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                    style={{ transition: 'background-color 0.3s' }}>
                    Skip to Plan Generator
                </button>
            </div>
            <p className="mt-4 text-gray-600 italic">
                Tip: Clients who complete the performance assessments generally see more tailored workout results.
            </p>
        </div>
    </div>
    );
};

export default IntakeOptions