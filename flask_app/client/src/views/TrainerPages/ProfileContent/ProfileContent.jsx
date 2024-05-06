import React, { useState, useEffect } from 'react';
import styles from './ProfileContent.module.css'; // Import styles
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

  // Ensure that profile and other necessary properties exist before trying to access them
  if (!trainerData.profile) {
    return <div>Profile data is not available.</div>;
  }
  return (
    <div className="content">
      <div className={`header-content ${styles.headerContent}`}>
        {trainerData.profile.photo1 && (
          <img src={`/uploads/${trainerData.profile.photo1}`} className={`profile-photo ${styles.profilePhoto}`} alt="Profile Photo" />
        )}
        <div>
        <h1 className="text-3xl font-bold mb-4">{getTimeBasedGreeting()}, {trainerData.trainer.first_name} {trainerData.trainer.last_name}!</h1>
          <p className="text-lg">Let's change the lives of people and help them achieve their fitness goals.</p>
        </div>
      </div>

      {/* Quotes and additional contents can be dynamically added here */}
      {trainerData.profile.quote1 && (
        <blockquote style={{ borderLeft: '4px solid gray', paddingLeft: '0px', marginBottom: '16px', fontStyle: 'italic', fontSize: 'small', color: 'black', marginLeft: '50px' }}>
          {/* You can adjust marginLeft to move it further to the right */}
          <p>{trainerData.profile.quote1}</p>
        </blockquote>
      )}

      {trainerData.profile.quote2 && (
        <blockquote style={{ borderLeft: '4px solid gray', paddingLeft: '0px', marginBottom: '16px', fontStyle: 'italic', fontSize: 'small', color: 'black', marginLeft: '50px' }}>
          {/* You can adjust marginLeft to move it further to the right */}
          <p>{trainerData.profile.quote2}</p>
        </blockquote>
      )}
    </div>
  );
};

export default ProfileContent;
