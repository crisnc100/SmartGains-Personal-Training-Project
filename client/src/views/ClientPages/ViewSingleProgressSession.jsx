import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaEnvelope } from 'react-icons/fa';

const ViewSingleProgressSession = () => {
 const {planId} = useParams();
  const {clientId} = useParams();
  const [progressSession, setProgressSession] = useState({});
  const [error, setError] = useState('');
  const [editableData, setEditableData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const [emailSending, setEmailSending] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/get_progress_session/${planId}`)
        .then(response => {
            setProgressSession(response.data);
            setEditableData(response.data);
            setLoading(false);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            setError('Failed to fetch data');
            setLoading(false);
        });
}, [planId]);

const toggleEditMode = () => {
  if (!isEditMode) {
      setEditableData({ ...progressSession });
  }
  setIsEditMode(!isEditMode);
};

const cancelEditMode = () => {
  setIsEditMode(false);
  setEditableData(progressSession);
};

const handleInputChange = (event) => {
  const { name, value } = event.target;
  setEditableData(prevState => ({
    ...prevState,
    [name]: value
  }));
};

const saveChanges = () => {
  // Converted date to YYYY-MM-DD format
  const formattedData = {
    ...editableData,
    workout_progress_date: new Date(editableData.workout_progress_date).toISOString().split('T')[0]
  };

  console.log("Sending data to backend:", formattedData);  // Debug statement

  axios.post(`http://localhost:5000/api/update_progress_session/${planId}`, formattedData)
    .then(response => {
      console.log("Response from backend:", response.data);  // Debug statement
      setProgressSession({ ...editableData });
      setIsEditMode(false);
    })
    .catch(error => {
      console.error("Failed to update the workout session", error.response ? error.response.data : "No response");
      setError("Failed to update the workout session: " + (error.response ? error.response.data.message : "No response data"));
    });
};



const sendEmail = () => {
  setEmailSending(true);
  axios.post('http://localhost:5000/api/email_session_to_client', {
    client_id: clientId,
    ...progressSession
  })
    .then(response => {
      alert('Email sent successfully!');
      setEmailSending(false);
    })
    .catch(error => {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      console.error('Failed to send email:', errorMessage);
      alert('Failed to send email: ' + errorMessage);
      setEmailSending(false);
    });
};

return (
  <div>
    <div className="flex justify-end space-x-2 mt-4">
                <button onClick={() => navigate(-1)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
                    Return Back
                </button>
            </div>
  <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg" style={{ color: 'black' }}>
    <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center" style={{ fontSize: '30px' }}>Progress Session</h1>
    <h3 className="text-lg text-gray-700 mb-4 text-center" style={{ fontSize: '22px' }}><span className="font-bold">Client:</span> {progressSession.client_first_name} {progressSession.client_last_name}</h3>
    <div className="flex justify-end space-x-2 mb-4">
      <button onClick={isEditMode ? saveChanges : toggleEditMode} className="flex items-center px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors duration-200">
        {isEditMode ? 'Save Changes' : <><FaEdit className="inline mr-2" />Edit Session</>}
      </button>
      {isEditMode && (
        <button onClick={cancelEditMode} className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300 ease-in-out rounded">
          Cancel
        </button>
      )}
      <button
                onClick={sendEmail}
                className="flex items-center px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors duration-300 ease-in-out rounded"
                disabled={emailSending}
              >
                <FaEnvelope className="mr-2" /> {emailSending ? 'Sending...' : 'Email to Client'}
              </button>
    </div>
    
    <div className="space-y-4" style={{fontSize: '1.2rem'}}>
      {isEditMode ? (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Plan Name</label>
            <input
              type="text"
              name="workout_progress_name"
              value={editableData.workout_progress_name || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ fontSize: '1.2rem', backgroundColor: '#ffffe0'}}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              name="workout_progress_date"
              value={editableData.workout_progress_date || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ fontSize: '1.2rem', backgroundColor: '#ffffe0' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Workout Type</label>
            <input
              type="text"
              name="workout_progress_workout_type"
              value={editableData.workout_progress_workout_type || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ fontSize: '1.2rem' , backgroundColor: '#ffffe0' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
            <input
              type="number"
              name="workout_progress_duration_minutes"
              value={editableData.workout_progress_duration_minutes || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ fontSize: '1.2rem', backgroundColor: '#ffffe0' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Exercises Log</label>
            <textarea
              name="workout_progress_exercises_log"
              value={editableData.workout_progress_exercises_log || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ fontSize: '1.2rem', backgroundColor: '#ffffe0', height: '10rem' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Intensity Level</label>
            <input
              type="text"
              name="workout_progress_intensity_level"
              value={editableData.workout_progress_intensity_level || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ fontSize: '1.2rem', backgroundColor: '#ffffe0' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text"
              name="workout_progress_location"
              value={editableData.workout_progress_location || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ fontSize: '1.2rem', backgroundColor: '#ffffe0' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <input
              type="number"
              name="workout_progress_workout_rating"
              value={editableData.workout_progress_workout_rating || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ fontSize: '1.2rem', backgroundColor: '#ffffe0' }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Trainer Notes</label>
            <textarea
              name="workout_progress_trainer_notes"
              value={editableData.workout_progress_trainer_notes || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              style={{ fontSize: '1.2rem', backgroundColor: '#ffffe0' }}
            />
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <button onClick={cancelEditMode} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md">Cancel</button>
            <button onClick={saveChanges} className="px-4 py-2 bg-blue-600 text-white rounded-md">Save</button>
          </div>
        </>
      ) : (
        <>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Plan Name:</h2>
            <p className="text-gray-700">{progressSession.workout_progress_name}</p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Date:</h2>
            <p className="text-gray-700">{progressSession.workout_progress_date}</p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Workout Type:</h2>
            <p className="text-gray-700">{progressSession.workout_progress_workout_type}</p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Duration (minutes):</h2>
            <p className="text-gray-700">{progressSession.workout_progress_duration_minutes}</p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Exercises Log:</h2>
            <p className="text-gray-700 whitespace-pre-line">{progressSession.workout_progress_exercises_log}</p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Intensity Level:</h2>
            <p className="text-gray-700">{progressSession.workout_progress_intensity_level}</p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Location:</h2>
            <p className="text-gray-700">{progressSession.workout_progress_location}</p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Rating:</h2>
            <p className="text-gray-700">{progressSession.workout_progress_workout_rating}</p>
          </div>
          <div>
            <h2 className="text-lg font-medium text-gray-900">Trainer Notes:</h2>
            <p className="text-gray-700 whitespace-pre-line">{progressSession.workout_progress_trainer_notes}</p>
          </div>
        </>
      )}
    </div>
  </div>
</div>
);
}

export default ViewSingleProgressSession;
