import React, { useState, useEffect } from 'react';
import styles from './ProfileContent.module.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa'; // Import the trash icon from react-icons

const ProfileContent = () => {
  const [trainerData, setTrainerData] = useState(null);
  const [error, setError] = useState('');
  const [pinnedPlans, setPinnedPlans] = useState([]);
  const [totalClients, setTotalClients] = useState(0); // Add state for total clients

  useEffect(() => {
    fetchTrainerData();
    fetchPinnedPlans();
    fetchTotalClients();
  }, []);

  const fetchTrainerData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/trainer_data', { withCredentials: true });
      if (response.data) {
        setTrainerData(response.data);
      } else {
        setError('Data not found');
      }
    } catch (error) {
      setError(error.response ? error.response.data.error : 'Something went wrong');
    }
  };

  const fetchPinnedPlans = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/get_pinned_plans');
      if (response.data.success) {
        setPinnedPlans(response.data.pinned_plans);
      } else {
        setError('No pinned plans found');
      }
    } catch (error) {
      console.error('Error fetching pinned plans:', error);
      setError('Failed to fetch pinned plans');
    }
  };

  const fetchTotalClients = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/total_clients'); // Update the endpoint URL
      if (response.data.success) {
        setTotalClients(response.data.total_clients);
      } else {
        setError('Failed to fetch total clients');
      }
    } catch (error) {
      console.error('Error fetching total clients:', error);
      setError('Failed to fetch total clients');
    }
  };

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good Morning";
    } else if (hour < 18) {
      return "Good Afternoon";
    } else {
      return "Good Evening";
    }
  };

  const extractPlanTitle = (planDetails) => {
    const firstLine = planDetails.split('\n')[0];
    return firstLine.replace(/^#+\s*/, ''); // Remove markdown heading symbols
  };

  const removeFromPinned = async (planId) => {
    try {
      await axios.post(`http://localhost:5000/api/unpin_plan/${planId}`);
      setPinnedPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
    } catch (error) {
      console.error('Failed to unpin the plan:', error);
    }
  };

  if (error) {
    return <div style={{ color: 'red' }}>Error: {error}</div>;
  }

  if (!trainerData) {
    return <div style={{ color: 'blue' }}>Loading...</div>;
  }

  if (!trainerData.profile) {
    return <div style={{ color: 'red' }}>Profile data is not available.</div>;
  }

  return (
    <div className={`content ${styles.content}`}>
      <div className={`header-content ${styles.headerContent}`}>
        {trainerData.profile.photo1 && (
          <img src={`/uploads/${trainerData.profile.photo1}`} className={`profile-photo ${styles.profilePhoto}`} alt="Profile Photo" />
        )}
        <div>
          <h1 className="text-3xl font-bold mb-4">{getTimeBasedGreeting()}, {trainerData.trainer.first_name} {trainerData.trainer.last_name}!</h1>
          <p className="text-lg">Let's change the lives of people and help them achieve their fitness goals.</p>
        </div>
      </div>

      {trainerData.profile.quote1 && (
        <blockquote className={styles.quote}>
          <p>{trainerData.profile.quote1}</p>
        </blockquote>
      )}

      {trainerData.profile.quote2 && (
        <blockquote className={styles.quote}>
          <p>{trainerData.profile.quote2}</p>
        </blockquote>
      )}

      <div className={styles.statsAndNotifications}>
        <div className={styles.quickStats}>
          <h2 className="text-xl font-semibold mb-2">Quick Stats</h2>
          <div className={styles.statsContent}>
            <p>Total Clients: {totalClients}</p> {/* Display total clients */}
            <p>Upcoming Sessions: --</p> {/* Display upcoming sessions */}
            <p>Pending Approvals: --</p>
          </div>
        </div>

        <div className={styles.notifications}>
          <h2 className="text-xl font-semibold mb-2">Notifications</h2>
          <div className={styles.notificationsContent}>
            <p>No new notifications</p>
          </div>
        </div>
      </div>

      <div className={styles.pinnedPlans}>
        <h2 className="text-xl font-semibold mb-2">Pinned Plans for Today's Session</h2>
        <div className={styles.pinnedPlansContent}>
          {pinnedPlans.length > 0 ? (
            pinnedPlans.map((plan, index) => (
              <div key={index} className={styles.pinnedPlanItem}>
                <Link to={`view-custom-plan/${plan.id}`} className={styles.pinnedPlanButton}>
                  {extractPlanTitle(plan.generated_plan_details)}
                </Link>
                <p className={styles.pinnedPlanClient}>{plan.client_first_name} {plan.client_last_name}</p>
                <button
                  className={styles.removeButton}
                  onClick={() => removeFromPinned(plan.id)}
                >
                  <FaTrashAlt />
                </button>
              </div>
            ))
          ) : (
            <p>No plans pinned for today.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileContent;
