import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import Switch from 'react-switch';


const initialExercises = {
    Arms: {
        'Bicep Curl': ['Barbell', 'Cables', 'Dumbbells', 'Machine'],
        'Hammer Curl': ['Dumbbells', 'Cables'],
        'Preacher Curl': ['Barbell', 'Dumbbells', 'Machine'],
        'Tricep Pushdown': ['Rope', 'Straight-Bar', 'V-Bar', 'EZ Curl'],
        'Skull-Crushers': ['Barbell', 'Dumbbells', 'Cable'],
        'Overhead Extensions': ['Dumbbells', 'Barbell', 'Cable'],
        'Dips': ['Bodyweight', 'Assisted', 'Machine']
    },
    Legs: {
        'Squat': ['Barbell', 'Smith Machine', 'Hack-Squat', 'Machine', 'Goblet', 'Bodyweight'],
        'Leg Press': ['Machine', 'Single-leg Machine'],
        'RDLs': ['Dumbbells', 'Barbell', 'Single-leg Dumbbells'],
        'Lunges': ['Bodyweight', 'Dumbbells', 'Barbell', 'Smith Machine'],
        'Hip Thrust(Bridges)': ['Bodyweight', 'Resistance Banded', 'Machine', 'Barbell', 'Smith Machine'],
        'Leg Extensions': ['Machine', 'Single-leg Machine'],
        'Leg Curls': ['Machine-Lying', 'Machine-Seated'],
        'Calf Raises': ['Standing-Machine', 'Standing-Barbell', 'Seated Plate-loaded', 'Seated Calf Press']
        // Add more exercises with variations...
    },
    Chest: {
        'Standard Chest Press': ['Barbell', 'Dumbbells', 'Smith Machine', 'Machine', 'Cable'],
        'Incline Chest Press': ['Barbell', 'Dumbbells', 'Smith Machine', 'Machine', 'Cable'],
        'Decline Chest Press': ['Barbell', 'Dumbbells', 'Machine'],
        'Standard Chest Flys': ['Dumbbells', 'Standing Cables', 'Seated Cables', 'Machine'],
        'Incline Chest Flys': ['Dumbbells', 'Standing Cables', 'Seated Cables'],
        'Decline Chest Flys': ['Dumbbells', 'Cables'],
        'Push-ups': ['Normal', 'Incline', 'Decline', 'On-knees']
    },
    Shoulders: {
        'Seated Shoulder Press': ['Dumbbells', 'Barbell', 'Machine', 'Arnold-Variation', 'Cable'],
        'Standing Shoulder Press': ['Barbell', 'Dumbbells', 'Machine', 'Push-Press Variation'],
        'Front Raises': ['Dumbbells', 'Cables', 'Barbell'],
        'Side Raises': ['Dumbells', 'Cables', 'Machine'],
        'Reverse Flys': ['Dumbbells', 'Cables', 'Machine'],
        'Face-Pulls': ['Standing Rope-Cable', 'Half Kneeling Rope-Cable']
    },
    Back: {
        'Deadlift': ['Barbell', 'Dumbbells', 'Hex-Bar', 'Romanian'],
        'Bent Over Rows': ['Barbell', 'Dumbbells', 'Smith-Machine', 'Machine'],
        'Pull-ups': ['Bodyweight', 'Assisted', 'Bodyweight with Weight'],
        'Lat Pulldowns': ['Standard', 'V-Bar(wide)', 'V-Bar(neutral)', 'Var-Bar(close)', 'Single-arm'],
        'Cable Rows': ['V-Bar(close)', 'V-Bar(neutral)', 'V-Bar(wide)', 'Standard Straight-bar', 'Single-arm'],
        'TBar Rows': ['Barbell', 'Single-arm'],
        'Single Arm Rows': ['Dumbbells', 'Machine'],
        'Shrugs': ['Barbell', 'Smith-Machine', 'Dumbbells', 'Machine'],
        'Straight Arm Pulldowns': ['Cable Rope', 'Cable Straight-bar']
    },
    Core: {
        'Plank': ['Standard', 'Side'],
        'Crunches': ['Lying down', 'Machine'],
        'Russian Twist': ['Dumbbell', 'Medicine-ball'],
        'Leg Raises': ['Lying down', 'Vertical', 'Pull-up bar'],
        'Ab Roller': ['Standard'],
    }
    // Add other categories similarly...
};


const RecordWorkoutSession = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [currentExercise, setCurrentExercise] = useState('');
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
    const [submitClicked, setSubmitClicked] = useState(false); // New state to track form submission
    const [unit, setUnit] = useState('kg'); // State to track unit

    const toggleUnit = () => {
        setUnit((prevUnit) => (prevUnit === 'kg' ? 'lbs' : 'kg'));
    };
    const workoutTypes = [
        'Strength Training',
        'Cardio',
        'HIIT',
        'Yoga',
        'Pilates',
        'CrossFit',
        'Hypertrophy Training',
        'Powerlifting',
        'Functional Training',
        'Mobility',
    ];
    const handleWorkoutTypeChange = (e) => {
        const { value, checked } = e.target;
        setFormData((prevFormData) => {
            let workoutType = prevFormData.workoutType.split(',').filter(type => type);
            if (checked) {
                workoutType.push(value);
            } else {
                workoutType = workoutType.filter(type => type !== value);
            }
            return {
                ...prevFormData,
                workoutType: workoutType.join(','),
            };
        });
    };
    const handleDeleteExercise = (index) => {
        let updatedExercises = [...selectedExercises];
        updatedExercises.splice(index, 1);

        let newLog = formData.exercisesLog.split('\n');
        newLog.splice(index, 1);
        setFormData((prevFormData) => ({
            ...prevFormData,
            exercisesLog: newLog.join('\n'),
        }));

        setSelectedExercises(updatedExercises);
    };

    const handleAddExercise = (exercise, variation) => {
        const newExerciseEntry = `${exercise} (${variation}) - 3 sets x 10 reps @ 0 ${unit}`;
        setFormData((prevFormData) => {
            const updatedLog = prevFormData.exercisesLog.length > 0 ? `${prevFormData.exercisesLog}\n${newExerciseEntry}` : newExerciseEntry;
            return {
                ...prevFormData,
                exercisesLog: updatedLog,
            };
        });

        setSelectedExercises((prev) => [...prev, { name: exercise, variation, sets: 3, reps: 10, weight: 0 }]);
        setCurrentExercise('');
    };

    const updateExercise = (index, field, value) => {
        let newValue = parseInt(value, 10) || 0;
        let updatedExercises = [...selectedExercises];
        updatedExercises[index][field] = newValue;

        let newLog = formData.exercisesLog.split('\n');
        newLog[index] = `${updatedExercises[index].name} (${updatedExercises[index].variation}) - ${updatedExercises[index].sets} sets x ${updatedExercises[index].reps} reps @ ${updatedExercises[index].weight} ${unit}`;
        setFormData((prevFormData) => ({
            ...prevFormData,
            exercisesLog: newLog.join('\n'),
        }));

        setSelectedExercises(updatedExercises);
    };


    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        const fieldsToCheck = [
            'date', 'workoutType', 'durationMinutes', 'exercisesLog',
            'intensityLevel', 'location', 'workoutRating'
        ];

        fieldsToCheck.forEach(key => {
            if (!formData[key]?.trim()) {
                tempErrors[key] = 'This field is required';
                isValid = false;
            }
        });
        console.log("Validation errors:", tempErrors);
        setErrors(tempErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitClicked(true); // Set submitting state to true
        console.log("Submitting form with data:", formData);

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
        } finally {
            setIsSubmitting(false); // Reset submitting state
        }
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
                    {submitClicked && errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
                </div>

                 {/* Workout Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Workout Type:</label>
                <div className="grid grid-cols-2 gap-2">
                    {workoutTypes.map((type) => (
                        <div key={type} className="flex items-center">
                            <input
                                type="checkbox"
                                id={type}
                                value={type}
                                onChange={handleWorkoutTypeChange}
                                checked={formData.workoutType.split(',').includes(type)}
                                className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor={type} className="ml-2 block text-sm text-gray-700">
                                {type}
                            </label>
                        </div>
                    ))}
                </div>
                {submitClicked && errors.workoutType && <p className="text-red-500 text-sm">{errors.workoutType}</p>}
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
                    {submitClicked && errors.durationMinutes && <p className="text-red-500 text-sm">{errors.durationMinutes}</p>}
                </div>

                {/* Exercise selector */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Popular Exercises:
                    </label>
                    {Object.keys(initialExercises).map(category => (
                        <details key={category} className="border p-3 rounded-md mb-2 shadow-sm">
                            <summary className="font-bold text-lg cursor-pointer">{category}</summary>
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {Object.keys(initialExercises[category]).map(exercise => (
                                    <button
                                        key={exercise}
                                        type="button"
                                        onClick={() => setCurrentExercise(exercise)}
                                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-2 rounded text-sm"
                                    >
                                        {exercise}
                                    </button>
                                ))}
                            </div>
                        </details>
                    ))}
                </div>

                {/* Exercise variation selector */}
                {currentExercise && initialExercises[Object.keys(initialExercises).find(category => initialExercises[category][currentExercise])][currentExercise] && (
                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700">{currentExercise} Variations:</label>
                        <div className="grid grid-cols-3 gap-2">
                            {initialExercises[Object.keys(initialExercises).find(category => initialExercises[category][currentExercise])][currentExercise].map(variation => (
                                <button
                                    key={variation}
                                    type="button"
                                    onClick={() => handleAddExercise(currentExercise, variation)}
                                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-2 rounded text-sm"
                                >
                                    {variation}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
                <div className="flex items-center mt-4">
                    <span className="mr-2 text-gray-700">Units:</span>
                    <Switch
                        onChange={toggleUnit}
                        checked={unit === 'kg'}
                        uncheckedIcon={false}
                        checkedIcon={false}
                        onColor="#4A90E2" // Blue for KG
                        offColor="#34D399" // Green for lbs
                    />
                    <span className="ml-2 text-gray-700">{unit}</span>
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
                    {submitClicked && errors.exercisesLog && <p className="text-red-500 text-sm">{errors.exercisesLog}</p>}
                </div>

                {/* List and edit selected exercises directly in the log */}
                {selectedExercises.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 p-2">
                        <input type="text" value={`${item.name} (${item.variation})`} className="flex-1" readOnly />
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
                        <input
                            type="number"
                            value={item.weight}
                            onChange={e => updateExercise(index, 'weight', e.target.value)}
                            className="w-16 px-2"
                        /> {unit}
                        <button
                            type="button" // Ensure this button does not submit the form
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
                    {submitClicked && errors.intensityLevel && <p className="text-red-500 text-sm">{errors.intensityLevel}</p>}
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
                    {submitClicked && errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
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
                    {submitClicked && errors.workoutRating && <p className="text-red-500 text-sm">{errors.workoutRating}</p>}
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
