import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format, isValid } from 'date-fns';

const ClientWorkouts = ({ clientId, clientDemoPlans, clientPlans, workoutProgressData, onDeletePlan }) => {
  const [activeSubTab, setActiveSubTab] = useState('demoPlans');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [planStatuses, setPlanStatuses] = useState({});
  const [groupedProgress, setGroupedProgress] = useState({});
  const [expandedPlans, setExpandedPlans] = useState({});
  const plansPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    if (clientId) {
      fetchAllPlanStatuses();
      fetchGroupedProgress();
    }
  }, [clientId]);

  const fetchAllPlanStatuses = async () => {
    const demoPlansUrl = `http://localhost:5000/api/get_all_demo_plans_completion_status/${clientId}`;
    const generatedPlansUrl = `http://localhost:5000/api/get_all_generated_plans_completion_status/${clientId}`;

    try {
      const [demoPlansResponse, generatedPlansResponse] = await Promise.all([
        axios.get(demoPlansUrl),
        axios.get(generatedPlansUrl)
      ]);

      const statuses = {};
      demoPlansResponse.data.forEach(status => {
        statuses[`demo-${status.id}`] = status;
      });
      generatedPlansResponse.data.forEach(status => {
        statuses[`generated-${status.id}`] = status;
      });
      setPlanStatuses(statuses);
    } catch (error) {
      console.error('Error fetching plan completion statuses:', error);
    }
  };

  const fetchGroupedProgress = async () => {
    try {
      const singleDayResponse = await axios.get(`http://localhost:5000/api/get_single_day_generated_plan_progress/${clientId}`);
      const multiDayResponse = await axios.get(`http://localhost:5000/api/get_multi_day_plans_progress/${clientId}`);
  
      const singleDayProgress = singleDayResponse.data.reduce((acc, session) => {
        const key = `generated_${session.generated_plan_id}`;
        if (!acc[key]) {
          acc[key] = {
            plan_id: session.generated_plan_id,
            plan_type: 'generated',
            plan_name: session.name, // Use workout progress name as the plan name
            sessions: []
          };
        }
        acc[key].sessions.push(session);
        return acc;
      }, {});
  
      const multiDayProgress = multiDayResponse.data;
  
  
      setGroupedProgress({ ...singleDayProgress, ...multiDayProgress });
    } catch (error) {
      console.error('Error fetching grouped workout progress:', error);
    }
};

  
  
  


  const viewDetails = (id, type, isClustered = false) => {
    console.log("View Details - ID:", id, "Type:", type, "Is Clustered:", isClustered);
    if (type === 'custom-plan') {
      navigate(`custom-plan/${id}`);
    } else if (type === 'quick-plan') {
      navigate(`quick-plan/${id}`);
    } else if (isClustered) {
      navigate(`progress-sessions/${id}/${type}`);
    } else {
      navigate(`progress-session/${id}`);
    }
  };
  
  



  const formatDate = (dateString) => {
    if (!dateString) {
      console.error('Invalid dateString:', dateString);
      return 'Invalid date';
    }

    const date = new Date(dateString);
    if (isValid(date)) {
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
      return format(adjustedDate, 'M/dd/yyyy');
    } else {
      console.error('Invalid date:', dateString);
      return 'Invalid date';
    }
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
        case 'progress-session':
          url = `http://localhost:5000/api/delete_progress_session/${planId}`;
          updatePlans = workoutProgressData.filter(plan => plan.id !== planId);
          break;
        default:
          return; 
      }
  
      axios.delete(url)
        .then(response => {
          onDeletePlan(updatePlans, type); 
        })
        .catch(error => {
          console.error(`Failed to delete the ${type} plan:`, error);
        });
    }
  };

  const filteredPlans = (plans) => {
    return plans
      .filter(plan =>
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (filterStatus === 'all' || (filterStatus === 'completed' && planStatuses[`${plan.type}-${plan.id}`]?.completed_marked) || (filterStatus === 'pending' && !planStatuses[`${plan.type}-${plan.id}`]?.completed_marked))
      )
      .sort((a, b) => {
        const statusA = planStatuses[`${a.type}-${a.id}`]?.completed_marked ? 1 : 0;
        const statusB = planStatuses[`${b.type}-${b.id}`]?.completed_marked ? 1 : 0;
        return statusA - statusB;
      });
  };

  const paginatedPlans = (plans) => {
    const indexOfLastPlan = currentPage * plansPerPage;
    const indexOfFirstPlan = indexOfLastPlan - plansPerPage;
    return filteredPlans(plans).slice(indexOfFirstPlan, indexOfLastPlan);
  };

  const handlePageChange = (direction) => {
    setCurrentPage((prevPage) => prevPage + direction);
  };

  const toggleExpand = (planId) => {
    setExpandedPlans((prevExpandedPlans) => ({
      ...prevExpandedPlans,
      [planId]: !prevExpandedPlans[planId]
    }));
  };

  const getProgressBar = (planId, type) => {
    const completionStatus = planStatuses[`${type}-${planId}`];
    if (!completionStatus) return <div className="text-xs text-gray-500">Not started</div>;

    if (completionStatus.completed_marked) {
      return <div className="w-full bg-green-500 text-xs leading-none py-1 text-center text-white rounded-full">Completed</div>;
    }

    const dayCompletionStatus = completionStatus.day_completion_status || {};
    const completedDays = Object.values(dayCompletionStatus).filter(status => status).length;

    let totalDays;
    if (type === 'demo') {
      totalDays = 3; // default for demo plans
    } else {
      // For custom plans, dynamically determine total days from the plan details
      const planDetails = clientPlans.find(plan => plan.id === planId)?.generated_plan_details || '';
      const dayRegex = /## Day \d+/g;
      const dayMatches = planDetails.match(dayRegex);
      totalDays = dayMatches ? dayMatches.length : 1; // default to 1 if no matches found
    }

    const progressPercentage = (completedDays / totalDays) * 100;
    return (
      <div className="w-full bg-gray-300 rounded-full mt-2">
        <div className="bg-blue-500 text-xs leading-none py-1 text-center text-white rounded-full" style={{ width: `${progressPercentage}%` }}>
          {Math.round(progressPercentage)}%
        </div>
      </div>
    );
  };

  const renderGroupedProgress = () => {
    return Object.entries(groupedProgress).map(([planId, plan]) => {
        const dayCompletionStatus = plan.sessions[0].day_completion_status ? JSON.parse(plan.sessions[0].day_completion_status) : {};
        const isMultiDayPlan = Object.keys(dayCompletionStatus).length > 1 || plan.sessions[0].completed_marked === 0;

        if (!isMultiDayPlan) {
            // Render single-day plans similarly to manual plans
            return plan.sessions.map(session => (
                <div key={session.id} className="p-4 rounded shadow bg-gray-100 hover:bg-gray-200 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{session.name}</h3>
                    <p className="text-gray-700">{formatDate(session.date)}</p>
                    <p className="text-sm text-gray-500">{session.workout_type}</p>
                    <div className="flex items-center mt-2">
                        <button onClick={() => viewDetails(session.id, 'progress-session')} className="text-blue-500 hover:text-blue-700">View Details</button>
                        <button onClick={() => deletePlan(session.id, 'progress-session')} className="text-red-500 hover:text-red-700 ml-4">Delete</button>
                    </div>
                </div>
            ));
        } else {
            // Render multi-day plans with toggle expand
            return (
                <div key={planId} className="p-4 rounded shadow bg-gray-100 hover:bg-gray-200 mb-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 cursor-pointer" onClick={() => toggleExpand(planId)}>
                        {plan.plan_name || plan.sessions[0].name}
                    </h3>
                    {expandedPlans[planId] && (
                        <div>
                            {plan.sessions.map((session) => (
                                <div key={session.id} className="mb-2">
                                    <p className="text-gray-700">
                                        {session.name} - {formatDate(session.date)}
                                    </p>
                                    <p className="text-sm text-gray-500">{session.workout_type}</p>
                                </div>
                            ))}
                            <div className="flex items-center mt-2">
                                <button onClick={() => viewDetails(plan.plan_id, plan.plan_type, true)} className="text-blue-500 hover:text-blue-700">View Details</button>
                            </div>
                        </div>
                    )}
                </div>
            );
        }
    });
};

const renderSingleProgress = () => {
    return workoutProgressData
        .filter(session => !session.generated_plan_id && !session.demo_plan_id)
        .map(session => (
            <div key={session.id} className="p-4 rounded shadow bg-gray-100 hover:bg-gray-200 mb-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{session.name}</h3>
                <p className="text-gray-700">{formatDate(session.date)}</p>
                <p className="text-sm text-gray-500">{session.workout_type}</p>
                <div className="flex items-center mt-2">
                    <button onClick={() => viewDetails(session.id, 'progress-session')} className="text-blue-500 hover:text-blue-700">View Details</button>
                    <button onClick={() => deletePlan(session.id, 'progress-session')} className="text-red-500 hover:text-red-700 ml-4">Delete</button>
                </div>
            </div>
        ));
};

  
  
  
  
  

  return (
    <div>
      <h1 className="text-black font-bold text-xl mb-4">Client Workouts</h1>
      <div className="mb-4 flex justify-between items-center">
        {/* Tab Headers */}
        <div>
          <button onClick={() => setActiveSubTab('demoPlans')}
            className={`px-4 py-2 mr-2 text-sm font-semibold ${activeSubTab === 'demoPlans' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-black'}`}>
            Quick Plans
          </button>
          <button onClick={() => setActiveSubTab('generatedPlans')}
            className={`px-4 py-2 mr-2 text-sm font-semibold ${activeSubTab === 'generatedPlans' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-black'}`}>
            Custom Plans
          </button>
          <button onClick={() => setActiveSubTab('progress')}
            className={`px-4 py-2 text-sm font-semibold ${activeSubTab === 'progress' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-black'}`}>
            Completed Progress Plans
          </button>
        </div>
        {/* Filter and Search */}
        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded p-2 mr-2"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded p-2"
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      <div>
        {activeSubTab === 'demoPlans' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Quick Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedPlans(clientDemoPlans.map(plan => ({ ...plan, type: 'demo' }))).map(plan => (
                <div key={plan.id} className={`p-4 rounded shadow ${planStatuses[`demo-${plan.id}`]?.completed_marked ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <p className="text-gray-700 font-semibold">{plan.name} - {new Date(plan.created_at).toLocaleDateString()}</p>
                  <div className="flex items-center mt-2">
                    <button onClick={() => viewDetails(plan.id, 'quick-plan')} className="text-blue-500 hover:text-blue-700">View</button>
                    <button onClick={() => deletePlan(plan.id, 'quick-plan')} className="text-red-500 hover:text-red-700 ml-4">Delete</button>
                  </div>
                  {getProgressBar(plan.id, 'demo')}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              {currentPage > 1 && (
                <button onClick={() => handlePageChange(-1)} className="px-4 py-2 bg-gray-300 rounded">Previous</button>
              )}
              {filteredPlans(clientDemoPlans).length > currentPage * plansPerPage && (
                <button onClick={() => handlePageChange(1)} className="px-4 py-2 bg-gray-300 rounded">Next</button>
              )}
            </div>
          </div>
        )}
        {activeSubTab === 'generatedPlans' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Custom Plans</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedPlans(clientPlans.map(plan => ({ ...plan, type: 'generated' }))).map(plan => (
                <div key={plan.id} className={`p-4 rounded shadow ${planStatuses[`generated-${plan.id}`]?.completed_marked ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <p className="text-gray-700 font-semibold">{plan.name} - {new Date(plan.created_at).toLocaleDateString()}</p>
                  <div className="flex items-center mt-2">
                    <button onClick={() => viewDetails(plan.id, 'custom-plan')} className="text-blue-500 hover:text-blue-700">View</button>
                    <button onClick={() => deletePlan(plan.id, 'custom-plan')} className="text-red-500 hover:text-red-700 ml-4">Delete</button>
                  </div>
                  {getProgressBar(plan.id, 'generated')}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4">
              {currentPage > 1 && (
                <button onClick={() => handlePageChange(-1)} className="px-4 py-2 bg-gray-300 rounded">Previous</button>
              )}
              {filteredPlans(clientPlans).length > currentPage * plansPerPage && (
                <button onClick={() => handlePageChange(1)} className="px-4 py-2 bg-gray-300 rounded">Next</button>
              )}
            </div>
          </div>
        )}
        {activeSubTab === 'progress' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-700">Workout Progress</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {renderGroupedProgress()}
              {renderSingleProgress()}
            </div>
            <div className="flex justify-between mt-4">
              {currentPage > 1 && (
                <button onClick={() => setCurrentPage(currentPage - 1)} className="px-4 py-2 bg-gray-300 rounded">Previous</button>
              )}
              {Object.keys(groupedProgress).length > currentPage * plansPerPage && (
                <button onClick={() => setCurrentPage(currentPage + 1)} className="px-4 py-2 bg-gray-300 rounded">Next</button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientWorkouts;
