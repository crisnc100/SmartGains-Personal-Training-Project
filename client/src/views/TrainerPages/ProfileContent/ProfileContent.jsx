import React, { useState, useEffect } from 'react';
import styles from './ProfileContent.module.css'; 
import axios from 'axios';

const ProfileContent = () => {
  const [trainerData, setTrainerData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTrainerData();
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

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!trainerData) {
    return <div>Loading...</div>;
  }

  if (!trainerData.profile) {
    return <div>Profile data is not available.</div>;
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
            <p>Total Clients: --</p>
            <p>Upcoming Sessions: --</p>
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
    </div>
  );
};

export default ProfileContent;
