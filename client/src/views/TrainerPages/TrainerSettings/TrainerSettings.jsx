import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './TrainerSettings.module.css';
import { useUser } from '../../../contexts/UserContext';

const TrainerSettings = () => {
  const navigate = useNavigate();
  const [editableData, setEditableData] = useState({ trainer: { first_name: "", last_name: "", email: "" } });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });  // Initialized the passwords state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useUser();  // Get user context, so basically the "id"




  useEffect(() => {
    fetchTrainerData();
  }, []);

  const fetchTrainerData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/get_trainer_id', { withCredentials: true });
      console.log('Response:', response);
      if (response.data && response.data.trainer) {
        console.log('Trainer Data:', response.data.trainer);
        setEditableData({ trainer: response.data.trainer });
      } else {
        setError('Data not found');
      }
    } catch (error) {
      console.error('Fetch error:', error); // Debug: Log any weird fetch errors
      setError(error.response ? error.response.data.error : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditableData(prevState => ({
      trainer: {
        ...prevState.trainer,
        [name]: value
      }
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const saveChanges = async (e) => {
    e.preventDefault();  // Prevent the default form submit behavior
  
    console.log("Submitting data:", { editableData, trainerId: user.id });
  
    try {
      const { trainer } = editableData; // Destructure to get data
      const response = await axios.post(`http://localhost:5000/api/update_trainer`, {
        first_name: trainer.first_name,
        last_name: trainer.last_name,
        email: trainer.email,
        trainer_id: user.id
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      console.log("Trainer update submission response:", response.data);
      alert('You have updated your information!');
      navigate('/trainer_dashboard'); 
    } catch (error) {
      console.error("Error during the update:", error);
      const message = error.response ? error.response.data.error : 'Failed to update trainer. Please try again.';
      alert(message);
    }
  };


  const updatePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      setError("New passwords do not match.");
      return;
    }
  
    console.log("Updating password...");
  
    try {
      const response = await axios.post('http://localhost:5000/api/update_password', {
        current: passwords.current,
        new: passwords.new,
        confirm: passwords.confirm
      }, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.data.success) {
        alert('Password updated successfully!');
        setPasswords({ current: "", new: "", confirm: "" }); // Reset password fields
        setShowModal(false); // Close modal on success
        navigate('/trainer_dashboard'); 
      }
    } catch (error) {
      console.error("Error updating password:", error);
      const message = error.response ? error.response.data.error : 'Failed to update password. Please try again.';
      setError(message);
    }
  };
  

  const toggleModal = () => {
    setShowModal(!showModal);
    setError('');
  };

  if (loading) return <p>Loading...</p>;


  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Trainer Settings</h1>
      <input
        className={styles.input}
        type="text"
        name="first_name"
        value={editableData.trainer.first_name}
        onChange={handleChange}
        placeholder="First Name"
      />
      <input
        className={styles.input}
        type="text"
        name="last_name"
        value={editableData.trainer.last_name}
        onChange={handleChange}
        placeholder="Last Name"
      />
      <input
        className={styles.input}
        type="email"
        name="email"
        value={editableData.trainer.email}
        onChange={handleChange}
        placeholder="Email"
      />
      <button className={styles.button} onClick={toggleModal}>Change Password</button>
      <button className={styles.button} onClick={saveChanges}>Save Changes</button>
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Change Password</h2>
            <input
              type="password"
              name="current"
              value={passwords.current}
              onChange={handlePasswordChange}
              placeholder="Current Password"
              className={styles.input}
            />
            <input
              type="password"
              name="new"
              value={passwords.new}
              onChange={handlePasswordChange}
              placeholder="New Password"
              className={styles.input}
            />
            <input
              type="password"
              name="confirm"
              value={passwords.confirm}
              onChange={handlePasswordChange}
              placeholder="Confirm New Password"
              className={styles.input}
            />
            <button onClick={updatePassword} className={styles.button}>Update Password</button>
            <button onClick={toggleModal} className={styles.button}>Close</button>
            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerSettings;
