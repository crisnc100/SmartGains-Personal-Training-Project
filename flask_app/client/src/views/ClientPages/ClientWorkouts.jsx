import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import axios from 'axios';


const ClientWorkouts = ({ clientDemoPlans, clientPlans, workoutProgressData, onDeletePlan }) => {
  const [activeSubTab, setActiveSubTab] = useState('demoPlans');
  const navigate = useNavigate();
  


  const viewDetails = (id, type) => {
    navigate(`${type}/${id}`);
  };


  const deletePlan = (planId, type) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      let url = '';
      let updatePlans;
      switch(type) {
        case 'quick-plan':
          url = `http://localhost:5000/api/delete_demo_plan/${planId}`;
          updatePlans = clientDemoPlans.filter(plan => plan.id !== planId);
          break;
        case 'custom-plan':
          url = `http://localhost:5000/api/delete_custom_plan/${planId}`;
          updatePlans = clientPlans.filter(plan => plan.id !== planId);
          break;
        case 'workout-progress':
          url = `http://localhost:5000/api/delete_progress_plan/${planId}`;
          updatePlans = workoutProgressData.filter(plan => plan.id !== planId);
          break;
        default:
          return; // Type not recognized, exit the function
      }
  
      axios.delete(url)
        .then(response => {
          onDeletePlan(updatePlans, type); // This updates the state in the parent
        })
        .catch(error => {
          console.error(`Failed to delete the ${type} plan:`, error);
        });
    }
  };
  

  return (
    <div>
        <h1 className="text-black font-bold text-xl mb-4">Client Workouts</h1>
        <div className="mb-4">
          {/* Tab Headers */}
          <button onClick={() => setActiveSubTab('demoPlans')} 
                  className={`px-4 py-2 mr-2 text-sm font-semibold ${activeSubTab === 'demoPlans' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-black'}`}>
            Demo Plans
          </button>
          <button onClick={() => setActiveSubTab('generatedPlans')} 
                  className={`px-4 py-2 mr-2 text-sm font-semibold ${activeSubTab === 'generatedPlans' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-black'}`}>
            Generated Plans
          </button>
          <button onClick={() => setActiveSubTab('progress')}
                  className={`px-4 py-2 text-sm font-semibold ${activeSubTab === 'progress' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-black'}`}>
            Workout Progress
          </button>
        </div>
        {/* Content based on active tab */}
        <div>
          {activeSubTab === 'demoPlans' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Demo Plans</h2>
              {clientDemoPlans.map(plan => (
                <div key={plan.id} className="flex justify-between items-center bg-gray-100 p-2 my-2 rounded hover:bg-gray-200">
                <p className="text-gray-700 flex-grow">{plan.name} - {new Date(plan.date).toLocaleDateString()}</p>
                <button onClick={() => viewDetails(plan.id, 'quick-plan')} className="text-blue-500 hover:text-blue-700">View</button>
                <button onClick={() => deletePlan(plan.id, 'quick-plan')} className="text-red-500 hover:text-red-700 ml-4">Delete</button>
              </div>
              ))}
            </div>
          )}
          {activeSubTab === 'generatedPlans' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Generated Plans</h2>
              {clientPlans.map(plan => (
                <div key={plan.id} className="flex justify-between items-center bg-gray-100 p-2 my-2 rounded hover:bg-gray-200">
                <p className="text-gray-700 flex-grow">{plan.name} - {new Date(plan.date).toLocaleDateString()}</p>
                <button onClick={() => viewDetails(plan.id, 'custom-plan')} className="text-blue-500 hover:text-blue-700">View</button>
                <button onClick={() => deletePlan(plan.id, 'custom-plan')} className="text-red-500 hover:text-red-700 ml-4">Delete</button>
              </div>
              ))}
            </div>
          )}
          {activeSubTab === 'progress' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-700">Workout Progress</h2>
              {workoutProgressData.map(entry => (
                <div key={entry.id} className="flex justify-between items-center bg-gray-100 p-2 my-2 rounded hover:bg-gray-200">
                <p className="text-gray-700 flex-grow">{new Date(entry.date).toLocaleDateString()}</p>
                <button onClick={() => viewDetails(entry.id, 'workout-progress')} className="text-blue-500 hover:text-blue-700">View</button>
                <button onClick={() => deletePlan(entry.id, 'workout-progress')} className="text-red-500 hover:text-red-700 ml-4">Delete</button>
              </div>
              ))}
            </div>
          )}
        </div>
    </div>
  )
}

export default ClientWorkouts;
