import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const EditProfile = () => {
  const navigate = useNavigate();
  const [trainerProfile, setTrainerProfile] = useState({ photo1: '', quote1: '', quote2: '' });
  const [editableData, setEditableData] = useState({ photo1: '', quote1: '', quote2: '' });
  const [photoPreview, setPhotoPreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainerProfile();
  }, []);

  const fetchTrainerProfile = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/get_trainer_profile', { withCredentials: true });
      console.log('API response:', response);  
      if (response.data && response.data.profile) {
        console.log('Fetched data:', response.data.profile); // Logging the fetched data
        setTrainerProfile(response.data.profile);
        setEditableData(response.data.profile);
        setPhotoPreview(response.data.profile.photo1);
        console.log('Photo URL:', response.data.profile.photo1);  // Checking what URL is being set
      } else if (response.data.error) {
        setError(response.data.error);
        console.error('API Error:', response.data.error);
      } else {
        setError('Data not found');
        console.error('Data fetch error: Data not found');
      }
    } catch (error) {
      console.error('Fetch error:', error); // Logs any other weird error
      setError(error.response ? error.response.data.error : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };



  const handleChange = (e) => {
    setEditableData({ ...editableData, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setEditableData({ ...editableData, photo1: e.target.files[0] });
      setPhotoPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const saveChanges = async () => {
    const formData = new FormData();
    if (editableData.photo1 instanceof File) {
      formData.append('photo1', editableData.photo1);
    }
    formData.append('quote1', editableData.quote1);
    formData.append('quote2', editableData.quote2);

    try {
      await axios.post('http://localhost:5000/api/update_profile', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate(-1); // Navigates back or refresh profile data
    } catch (error) {
      setError('Error updating profile');
    }
  };

  return (
    <div className="p-5" style={{ color: 'black' }}>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">Edit Profile</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="mb-4">
        <label htmlFor="photo1" className="block text-sm font-medium text-gray-700">Profile Photo:</label>
        {photoPreview && <img src={photoPreview} alt="Profile" className="w-20 h-30 mb-2 rounded-full object-cover" />}
        <input type="file" id="photo1" name="photo1" onChange={handlePhotoChange}
          className="text-sm text-gray-500
                py-2 px-3
                rounded-full border-0
                font-semibold
                bg-blue-50 text-blue-700
                hover:bg-blue-100
                cursor-pointer
                w-auto" />
      </div>
      <div className="mb-4">
        <label htmlFor="quote1" className="block text-sm font-medium text-gray-700">Quote 1:</label>
        <input type="text" name="quote1" value={editableData.quote1} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>
      <div className="mb-4">
        <label htmlFor="quote2" className="block text-sm font-medium text-gray-700">Quote 2:</label>
        <input type="text" name="quote2" value={editableData.quote2} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
      </div>
      <button onClick={saveChanges} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Save Changes</button>
    </div>
  );
}

export default EditProfile;
