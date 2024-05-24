import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';


const initialExercises = {
    Arms: ['Bicep Curl', 'Hammer Curl', 'Preacher Curl', 'Tricep Pushdown', 'Skull-Crushers', 'Overhead Extensions', 'Dips'],
    Legs: ['Squat', 'Leg Press', 'RDLs', 'Lunges', 'Bulgarians', 'Hip Thrust', 'Leg Extensions', 'Leg Curls', 'Calf Raises'],
    Chest: ['Flat Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Chest Fly', 'Incline Chest Fly', 'Push-ups'],
    Shoulders: ['Seated Shoulder Press', 'Standing Shoulder Press', 'Front Raises', 'Side Laterals', 'Reverse Flys', 'Face-Pulls'],
    Back: ['Deadlift', 'Bent Over Rows', 'Pull-ups', 'Lat Pulldown', 'Cable Rows', 'TBar Rows', 'Single Arm Rows', 'Shrugs', 'Straight Arm Pulldowns'],
    Core: ['Plank', 'Crunches', 'Russian Twist', 'Leg Raises', 'Ab Roller']
};



const RecordWorkoutSession = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [selectedExercises, setSelectedExercises] = useState([]);



    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: '',
        date: '',
        workoutType: '',
        durationMinutes: '',
        exercisesLog: '',
        intensityLevel: '',
        location: '',
        workoutRating: '',
        trainerNotes: ''
    });

   
    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;
     
        // Defined required fields, excluding 'name' and 'trainerNotes' as they are optional
        const fieldsToCheck = [
            'date', 'workoutType', 'durationMinutes', 'exercisesLog',
            'intensityLevel', 'location', 'workoutRating'
        ];
     
        // Checking if required fields for being non-empty
        fieldsToCheck.forEach(key => {
            if (!formData[key].trim()) { // Ensure the field is not empty?
                tempErrors[key] = 'This field is required';
                isValid = false;
            }
        });
     
        // Optionally checking for non-empty but do not affect form validity for optional fields
        if (!formData.name.trim()) {
            tempErrors.name = ''; // Providing some feedback but don't set as invalid
        }
     
        if (!formData.trainerNotes.trim()) {
            tempErrors.trainerNotes = ''; 
        }
     
        setErrors(tempErrors);
        return isValid;
     };
     

     const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!validateForm()) {
            console.error("Validation Failed.");
            return;
        }
    
        try {
            
            const payload = {
                name: formData.name,
                date: formData.date,
                workout_type: formData.workoutType,  
                duration_minutes: formData.durationMinutes,  
                exercises_log: formData.exercisesLog,  
                intensity_level: formData.intensityLevel,  
                location: formData.location,
                workout_rating: formData.workoutRating,  
                trainer_notes: formData.trainerNotes, 
                client_id: clientId  
            };
    
            const res = await axios.post(`http://localhost:5000/api/add_workout_session`, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log("Response Data:", res.data);
            navigate(`/trainer_dashboard/all_clients/${clientId}/current-client`);
        } catch (err) {
            if (err.response) {
                console.error("Submission error: ", err.response.status, err.response.data);
            } else if (err.request) {
                console.error("No response received");
            } else {
                console.error("Error", err.message);
            }
        }
    };
    
    
    
    const handleAddExercise = exercise => {
        const newExerciseEntry = `${exercise} - 3 sets x 10 reps`;
        setFormData(prevFormData => {
            
            const updatedLog = prevFormData.exercisesLog.length > 0 ? `${prevFormData.exercisesLog}\n${newExerciseEntry}` : newExerciseEntry;
            return {
                ...prevFormData,
                exercisesLog: updatedLog
            };
        });
       
        setSelectedExercises(prev => [...prev, { name: exercise, sets: 3, reps: 10 }]);
    };
    
    
    
    const updateExercise = (index, field, value) => {
        let newValue = parseInt(value, 10) || 0;
        let updatedExercises = [...selectedExercises];
        updatedExercises[index][field] = newValue;
    
        
        let newLog = formData.exercisesLog.split('\n');
        newLog[index] = `${updatedExercises[index].name} - ${updatedExercises[index].sets} sets x ${updatedExercises[index].reps} reps`;
        setFormData(prevFormData => ({
            ...prevFormData,
            exercisesLog: newLog.join('\n')
        }));
    
        setSelectedExercises(updatedExercises);
    };
    
  
    



    const handleDeleteExercise = index => {
        let updatedExercises = [...selectedExercises];
        updatedExercises.splice(index, 1);
    
  
        let newLog = formData.exercisesLog.split('\n');
        newLog.splice(index, 1);
        setFormData(prevFormData => ({
            ...prevFormData,
            exercisesLog: newLog.join('\n')
        }));
    
        setSelectedExercises(updatedExercises);
    };
    

    const handleTextAreaChange = e => {
        const { value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            exercisesLog: value
        }));
    };
    
    



    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prevFormData => ({
            ...prevFormData,
            [name]: value
        }));
    };

    return (
        <div className="max-w-4xl mx-auto p-4 bg-white shadow-md rounded-lg">
            <div className="flex justify-end space-x-2 mt-4">
                <button onClick={() => navigate(-1)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
                    Return Back
                </button>
            </div>
            <h1 className="text-xl font-semibold mb-4" style={{ textAlign: 'center', fontSize: '30px', color: 'black' }}>Record Workout Session</h1>
            <form onSubmit={handleSubmit} className="space-y-6" style={{ color: 'black' }}>
                {/* Name input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Name the workout:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                {/* Date input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Date:</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}

                </div>
                {/* Workout Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Workout Type:</label>
                    <input
                        type="text"
                        name="workoutType"
                        value={formData.workoutType}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.workoutType && <p className="text-red-500 text-sm">{errors.workoutRating}</p>}
                </div>

                {/* Duration input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Duration (minutes):</label>
                    <input
                        type="number"
                        name="durationMinutes"
                        value={formData.durationMinutes}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.durationMinutes && <p className="text-red-500 text-sm">{errors.durationMinutes}</p>}
                </div>

                {/* Exercise selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Popular Exercises:</label>
                    {Object.keys(initialExercises).map(category => (
                        <details key={category} className="border p-3 rounded-md mb-2 shadow-sm">
                            <summary className="font-bold text-lg cursor-pointer">{category}</summary>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {initialExercises[category].map(exercise => (
                                    <button
                                        key={exercise}
                                        type="button"
                                        onClick={() => handleAddExercise(exercise)}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded text-sm"
                                    >
                                        {exercise}
                                    </button>
                                ))}
                            </div>
                        </details>
                    ))}
                </div>

                {/* Exercises log textarea */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Exercises Log:</label>
                    <textarea
                        name="exercisesLog"
                        value={formData.exercisesLog}
                        onChange={handleTextAreaChange}  
                        rows="10"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    ></textarea>
                    {errors.exercisesLog && <p className="text-red-500 text-sm">{errors.exercisesLog}</p>}
                </div>

                {/* List and edit selected exercises directly in the log */}
                {selectedExercises.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2">
                        <input type="text" value={item.name} className="flex-1" readOnly />
                        <input
                            type="number"
                            value={item.sets}
                            onChange={e => updateExercise(index, 'sets', e.target.value)}
                            className="w-16 px-2"
                        /> sets
                        <input
                            type="number"
                            value={item.reps}
                            onChange={e => updateExercise(index, 'reps', e.target.value)}
                            className="w-16 px-2"
                        /> reps
                        <button
                            onClick={() => handleDeleteExercise(index)}
                            className="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded"
                        >
                            Delete
                        </button>
                    </div>
                ))}

                {/* Intensity Level dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Intensity Level:</label>
                    <select
                        name="intensityLevel"
                        value={formData.intensityLevel}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">Select Intensity</option>
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                    </select>
                    {errors.intensityLevel && <p className="text-red-500 text-sm">{errors.intensityLevel}</p>}
                </div>

                {/* Location input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Location:</label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
                </div>

                {/* Workout Rating - Radio Buttons */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Workout Rating (1-10):</label>
                    <div className="flex space-x-2">
                        {[...Array(10).keys()].map((i) => (
                            <label key={i} className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="workoutRating"
                                    value={i + 1}
                                    checked={formData.workoutRating === String(i + 1)}
                                    onChange={handleChange}
                                    className="form-radio text-indigo-600"
                                />
                                <span className="ml-2">{i + 1}</span>
                            </label>
                        ))}
                    </div>
                    {errors.workoutRating && <p className="text-red-500 text-sm">{errors.workoutRating}</p>}
                </div>

                {/* Trainer Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Trainer Notes:</label>
                    <textarea
                        name="trainerNotes"
                        value={formData.trainerNotes}
                        onChange={handleChange}
                        rows="4"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    ></textarea>
                </div>

                {/* Submit button */}
                <div>
                    <button type="submit" className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-md shadow-sm">
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default RecordWorkoutSession;
