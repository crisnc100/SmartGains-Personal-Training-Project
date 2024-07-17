import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEdit, FaEnvelope } from 'react-icons/fa';
import { format, isValid } from 'date-fns';
import Button from '@mui/material/Button';


const ViewMultiProgressSession = () => {
  const { planId, type, clientId } = useParams();
  const [sessions, setSessions] = useState([]);
  const [error, setError] = useState('');
  const [editableData, setEditableData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const navigate = useNavigate();
  const [emailSending, setEmailSending] = useState(false);
  const [clientInfo, setClientInfo] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [planType, setPlanType] = useState(type);


  useEffect(() => {
    fetchMultiDayProgressSessions(planId, type);
    return () => {
      // Reset state when component unmounts or dependencies change
      setSessions([]);
      setClientInfo(null);
      setActiveTab(0);
      setLoading(true);
      setIsEditMode(false);
      setEmailSending(false);
      setError('');
    };
  }, [planId, type]);

  const fetchMultiDayProgressSessions = async (planId, type) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/get_progress_sessions_by_plan/${planId}`);
      console.log('Fetched multi-day progress sessions by plan:', response.data);

      let data = [];
      if (type === 'quick') {
        data = response.data.quick_sessions;
      } else if (type === 'generated') {
        data = response.data.generated_sessions;
      }

      setClientInfo(response.data.client_info);
      setSessions(data);
      setLoading(false);
      setPlanType(type); // Store plan type

      if (data.length > 0) {
        setEditableData(data[0]); // Set editable data to the first session initially
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setError('Failed to fetch data');
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    if (!isEditMode) {
      const session = sessions[activeTab];
      console.log("Entering edit mode with data:", session);
      setEditableData({ ...session });  // Ensure editableData is correctly set
    }
    setIsEditMode(!isEditMode);
  };


  const cancelEditMode = () => {
    setIsEditMode(false);
    setEditableData(sessions[activeTab]); // Reset editable data to the current session
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setEditableData(prevState => {
      const newState = { ...prevState, [name]: value };
      console.log("Updated editable data:", newState); // Debug statement
      return newState;
    });
  };

  const saveChanges = () => {
    const session = sessions[activeTab]; // Get the original session data

    const formattedData = {
      workout_progress_name: editableData.name !== undefined ? editableData.name : session.name,
      workout_progress_date: new Date(editableData.date).toISOString().split('T')[0],
      workout_progress_workout_type: editableData.workout_type !== undefined ? editableData.workout_type : session.workout_type,
      workout_progress_duration_minutes: editableData.duration_minutes !== undefined ? editableData.duration_minutes : session.duration_minutes,
      workout_progress_exercises_log: editableData.exercises_log !== undefined ? editableData.exercises_log : session.exercises_log,
      workout_progress_intensity_level: editableData.intensity_level !== undefined ? editableData.intensity_level : session.intensity_level,
      workout_progress_location: editableData.location !== undefined ? editableData.location : session.location,
      workout_progress_workout_rating: editableData.workout_rating !== undefined ? editableData.workout_rating : session.workout_rating,
      workout_progress_trainer_notes: editableData.trainer_notes !== undefined ? editableData.trainer_notes : session.trainer_notes
    };

    console.log("Data prepared for update:", formattedData);  // Debug statement

    axios.post(`http://localhost:5000/api/update_progress_session/${session.id}`, formattedData)
      .then(response => {
        console.log("Response from backend:", response.data);  // Debug statement

        // Update the sessions state with the new data
        const updatedSessions = sessions.map(s =>
          s.id === session.id ? { ...s, ...editableData } : s
        );
        setSessions(updatedSessions);

        // Reset the editable data and exit edit mode
        setEditableData({});
        setIsEditMode(false);
      })
      .catch(error => {
        console.error("Failed to update the workout session", error.response ? error.response.data : "No response");
        setError("Failed to update the workout session: " + (error.response ? error.response.data.message : "No response data"));
      });
  };



  const sendEmail = () => {
    setEmailSending(true);
    const session = sessions[activeTab];  // Ensure we are sending the correct session data
    console.log("Sending email with session data:", session);  // Add this line for debugging
    axios.post('http://localhost:5000/api/email_session_to_client', {
      client_id: clientId,
      workout_progress_name: session.name,
      workout_progress_date: session.date,
      workout_progress_workout_type: session.workout_type,
      workout_progress_duration_minutes: session.duration_minutes,
      workout_progress_exercises_log: session.exercises_log,
      workout_progress_intensity_level: session.intensity_level,
      workout_progress_location: session.location,
      workout_progress_workout_rating: session.workout_rating,
      workout_progress_trainer_notes: session.trainer_notes
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={() => navigate(-1)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
          Return Back
        </button>
      </div>
      <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Multi-Day Progress Sessions</h1>
        <div className="text-center mb-4">
          <h2 className="text-lg font-medium text-gray-900" style={{ fontSize: '1.3rem' }}>Client: {clientInfo?.client_first_name} {clientInfo?.client_last_name}</h2>
        </div>
        <div className="tabs flex justify-center mb-4 space-x-4">
          {sessions.map((session, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 rounded-md ${activeTab === index ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}
            >
              {session.day_index} - {formatDate(session.date)}
            </button>
          ))}
        </div>
        <div className="flex justify-end space-x-4 mb-4">
          {!isEditMode && (
            <>
              <button
                onClick={toggleEditMode}
                className="flex items-center px-4 py-2 border border-yellow-500 text-yellow-500 rounded-md hover:bg-yellow-500 hover:text-white transition-colors duration-200"
              >
                <FaEdit className="mr-2" /> Edit
              </button>
              <button
                onClick={sendEmail}
                className="flex items-center px-4 py-2 border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition-colors duration-300 ease-in-out rounded"
                disabled={emailSending}
              >
                <FaEnvelope className="mr-2" /> {emailSending ? 'Sending...' : 'Email to Client'}
              </button>
              <Button
                onClick={() => {
                  if (planType === 'generated') {
                    window.location.href = `custom/view-plan`;
                  } else if (planType === 'quick') {
                    window.location.href = `quick/view-plan`;
                  }
                }}
                variant="contained"
                color="primary"
                style={{ textTransform: 'none' }}
              >
                View Entire Plan
              </Button>
            </>
          )}
          {isEditMode && (
            <>
              <button
                onClick={saveChanges}
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-colors duration-200"
              >
                Save Changes
              </button>
              <button
                onClick={cancelEditMode}
                className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors duration-300 ease-in-out rounded"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {isEditMode ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Plan Name</label>
              <input
                type="text"
                name="name"
                value={editableData.name || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                style={{ fontSize: '1.1rem', backgroundColor: '#ffffe0' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                name="date"
                value={editableData.date ? new Date(editableData.date).toISOString().split('T')[0] : ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                style={{ fontSize: '1.1rem', backgroundColor: '#ffffe0' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Workout Type</label>
              <input
                type="text"
                name="workout_type"
                value={editableData.workout_type || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                style={{ fontSize: '1.1rem', backgroundColor: '#ffffe0' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
              <input
                type="number"
                name="duration_minutes"
                value={editableData.duration_minutes || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                style={{ fontSize: '1.1rem', backgroundColor: '#ffffe0' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Exercises Log</label>
              <textarea
                name="exercises_log"
                value={editableData.exercises_log || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                style={{ fontSize: '1.1rem', backgroundColor: '#ffffe0', height: '10rem' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Intensity Level</label>
              <input
                type="text"
                name="intensity_level"
                value={editableData.intensity_level || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                style={{ fontSize: '1.1rem', backgroundColor: '#ffffe0' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                name="location"
                value={editableData.location || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                style={{ fontSize: '1.1rem', backgroundColor: '#ffffe0' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rating</label>
              <input
                type="number"
                name="workout_rating"
                value={editableData.workout_rating || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                style={{ fontSize: '1.1rem', backgroundColor: '#ffffe0' }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Trainer Notes</label>
              <textarea
                name="trainer_notes"
                value={editableData.trainer_notes || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                style={{ fontSize: '1.1rem', backgroundColor: '#ffffe0', height: '5rem' }}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Plan Name:</h3>
              <p className="text-gray-600">{sessions[activeTab].name}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Date:</h3>
              <p className="text-gray-600">{formatDate(sessions[activeTab].date)}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Workout Type:</h3>
              <p className="text-gray-600">{sessions[activeTab].workout_type}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Duration (minutes):</h3>
              <p className="text-gray-600">{sessions[activeTab].duration_minutes}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Exercises Log:</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{sessions[activeTab].exercises_log}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Intensity Level:</h3>
              <p className="text-gray-600">{sessions[activeTab].intensity_level}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Location:</h3>
              <p className="text-gray-600">{sessions[activeTab].location}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Rating:</h3>
              <p className="text-gray-600">{sessions[activeTab].workout_rating}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700">Trainer Notes:</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{sessions[activeTab].trainer_notes}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewMultiProgressSession;
