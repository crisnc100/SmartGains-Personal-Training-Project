import React, { useState } from 'react';
import styles from './CreateProfile.module.css'; 
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';



const CreateProfile = () => {
  const { trainerId } = useParams();
  const [profileData, setProfileData] = useState({
    photo1: null,
    quote1: "",
    quote2: ""
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };

  const handleFileChange = (event) => {
    setProfileData({
      ...profileData,
      photo1: event.target.files[0]
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('photo1', profileData.photo1);
    formData.append('quote1', profileData.quote1);
    formData.append('quote2', profileData.quote2);
    console.log("Trainer ID before sending:", trainerId);
    formData.append('trainer_id', trainerId);



    try {
      const response = await axios.post('http://localhost:5000/api/create_trainer_profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert('Profile created successfully');  // Provides user feedback
      navigate('/trainer_dashboard');
    } catch (error) {
      console.error("Error while creating profile:", error);
      if (error.response && error.response.data) {
        setErrors(error.response.data);
        alert('Failed to create profile: ' + Object.values(error.response.data).join('; '));
      } else {
        alert('Failed to create profile. Please check console for more details.');
      }
    }
  };

  return (
    <div className={`${styles.profilePage} p-6 bg-gray-100 min-h-screen flex justify-center items-center`}>
      <div className={`${styles.formContainer} max-w-lg w-full bg-white p-8 border border-gray-200 rounded-lg shadow-lg`}>
        <form onSubmit={handleSubmit}>
          <div className={styles.brandContainer}>
            <h1 className={styles.brand}>SmartGains</h1>
          </div>
          <h1 className="text-xl font-bold mb-4 text-center" style={{ fontSize: '25px' }}>Create Your Profile</h1>
          <div className="mb-4">
            <label htmlFor="photo1" className="block text-sm font-medium text-gray-700" style={{ color: 'white' }}>Profile Photo</label>
            <input type="file" id="photo1" name="photo1" onChange={handleFileChange} className="mt-1 block w-full" />
            {errors.photo1 && <p className="text-red-500 text-xs mt-1">{errors.photo1}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="quote1" className="block text-sm font-medium text-gray-700" style={{ color: 'white' }}>Favorite Quote</label>
            <input type="text" id="quote1" name="quote1" value={profileData.quote1} onChange={handleInputChange} style={{ color: 'black' }} className="mt-1 block w-full border border-gray-300 p-2 rounded" />
            {errors.quote1 && <p className="text-red-500 text-xs mt-1">{errors.quote1}</p>}
          </div>
          <div className="mb-4">
            <label htmlFor="quote2" className="block text-sm font-medium text-gray-700" style={{ color: 'white' }}>Inspirational Quote</label>
            <input type="text" id="quote2" name="quote2" value={profileData.quote2} onChange={handleInputChange} style={{ color: 'black' }} className="mt-1 block w-full border border-gray-300 p-2 rounded" />
            {errors.quote2 && <p className="text-red-500 text-xs mt-1">{errors.quote2}</p>}
          </div>
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">Save Profile</button>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;
