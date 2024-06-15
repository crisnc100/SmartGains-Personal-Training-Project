import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../../contexts/UserContext';

const AddExerciseModal = ({ onClose }) => {
    const user = useUser();
    const [exerciseData, setExerciseData] = useState({
        name: '',
        body_part: '',
        equipment: '',
        target_muscle: '',
        secondary_muscles: '',
        instructions: '',
        gif_url: '',
        video_url: '',
        fitness_level: '',
        trainer_id: user.id
    })

    const [gifFile, setGifFile] = useState(null);
    const [videoFile, setVideoFile] = useState(null);
    const [gifOption, setGifOption] = useState('link');
    const [videoOption, setVideoOption] = useState('link');


    const handleChange = (e) => {
        const { name, value } = e.target;
        setExerciseData({
            ...exerciseData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        Object.keys(exerciseData).forEach(key => {
            formData.append(key, exerciseData[key]);
        });

        if (gifOption === 'upload' && gifFile) {
            formData.append('gif_file', gifFile);
        }
        if (videoOption === 'upload' && videoFile) {
            formData.append('video_file', videoFile);
        }

        try {
            const response = await axios.post('http://localhost:5000/api/add_custom_exercise', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });

            console.log("Add Exercise response:", response.data);
            alert('New Exercise Added!');
            onClose();
        } catch (error) {
            if (error.response) {
                console.error("Error data:", error.response.data);
                console.error("Error status:", error.response.status);
                console.error("Error headers:", error.response.headers);
            } else if (error.request) {
                console.error("No response received:", error.request);
            } else {
                console.error("Error message:", error.message);
            }
            console.error("Config error:", error.config);
            alert('Failed to add new exercise. Please try again.');
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm mx-auto">
                <h2 className="text-xl font-bold mb-4">Add New Exercise</h2>
                <form onSubmit={handleSubmit} className="space-y-1">
                    <div className="form-group">
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Exercise Name*</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={exerciseData.name}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="body_part" className="block text-sm font-medium text-gray-700">Body Part*</label>
                        <select
                            id="body_part"
                            name="body_part"
                            value={exerciseData.body_part}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">Select Body Part</option>
                            <option value="chest">Chest</option>
                            <option value="waist">Waist</option>
                            <option value="legs">Legs</option>
                            <option value="back">Back</option>
                            <option value="arms">Arms</option>
                            <option value="cardio">Cardio</option>
                            <option value="shoulders">Shoulders</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="equipment" className="block text-sm font-medium text-gray-700">Equipment</label>
                        <select
                            id="equipment"
                            name="equipment"
                            value={exerciseData.equipment}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">Select Equipment</option>
                            {/* Add all equipment options here */}
                            <option value="custom">*Custom Input</option>
                            <option value="body weight">Body Weight</option>
                            <option value="assisted">Assisted</option>
                            <option value="dumbbell">Dumbbell</option>
                            <option value="barbell">Barbell</option>
                            <option value="ez barbell">EZ Barbell</option>
                            <option value="kettlebell">Kettlebell</option>
                            <option value="olympic barbell">Olympic Barbell</option>
                            <option value="weighted">Weighted</option>
                            <option value="trap bar">Trap Bar</option>
                            <option value="leverage machine">Leverage Machine</option>
                            <option value="cable">Cable</option>
                            <option value="sled machine">Sled Machine</option>
                            <option value="smith machine">Smith Machine</option>
                            <option value="upper body ergometer">Upper Body Ergometer</option>
                            <option value="stationary bike">Stationary Bike</option>
                            <option value="elliptical machine">Elliptical Machine</option>
                            <option value="step mill machine">Step Mill Machine</option>
                            <option value="skierg machine">Skierg Machine</option>
                            <option value="medicine balls">Medicine Balls</option>
                            <option value="stability ball">Stability Ball</option>
                            <option value="bosu ball">Bosu Ball</option>
                            <option value="band">Band</option>
                            <option value="resistance bands">Resistance Bands</option>
                            <option value="rope">Rope</option>
                            <option value="roller">Roller</option>
                            <option value="wheel roller">Wheel Roller</option>
                            <option value="hammer">Hammer</option>
                            <option value="tire">Tire</option>
                        </select>
                        {exerciseData.equipment === 'custom' && (
                            <input
                                type="text"
                                name="equipment_custom"
                                value={exerciseData.equipment_custom}
                                onChange={handleChange}
                                placeholder="Enter custom equipment"
                                className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="target_muscle" className="block text-sm font-medium text-gray-700">Target Muscle</label>
                        <select
                            id="target_muscle"
                            name="target_muscle"
                            value={exerciseData.target_muscle}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">Select Target Muscle</option>
                            {/* Add all target muscle options here */}
                            <option value="custom">*Custom Input</option>
                            <option value="abductors">Abductors</option>
                            <option value="abs">Abs</option>
                            <option value="adductors">Adductors</option>
                            <option value="biceps">Biceps</option>
                            <option value="calves">Calves</option>
                            <option value="cardiovascular system">Cardiovascular System</option>
                            <option value="delts">Delts</option>
                            <option value="forearms">Forearms</option>
                            <option value="glutes">Glutes</option>
                            <option value="hamstrings">Hamstrings</option>
                            <option value="lats">Lats</option>
                            <option value="pectorals">Pectorals</option>
                            <option value="quads">Quads</option>
                            <option value="serratus anterior">Serratus Anterior</option>
                            <option value="spine">Spine</option>
                            <option value="traps">Traps</option>
                            <option value="triceps">Triceps</option>
                            <option value="upper back">Upper Back</option>
                        </select>
                        {exerciseData.target_muscle === 'custom' && (
                            <input
                                type="text"
                                name="target_muscle_custom"
                                value={exerciseData.target_muscle_custom}
                                onChange={handleChange}
                                placeholder="Enter custom target muscle"
                                className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="secondary_muscles" className="block text-sm font-medium text-gray-700">Secondary Muscles</label>
                        <input
                            type="text"
                            id="secondary_muscles"
                            name="secondary_muscles"
                            value={exerciseData.secondary_muscles}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions (optional)</label>
                        <textarea
                            id="instructions"
                            name="instructions"
                            value={exerciseData.instructions}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 caret-black"
                        ></textarea>
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">GIF URL</label>
                        <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="gifOption"
                                    value="link"
                                    checked={gifOption === 'link'}
                                    onChange={() => setGifOption('link')}
                                    className="form-radio"
                                />
                                <span className="ml-2">Link</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="gifOption"
                                    value="upload"
                                    checked={gifOption === 'upload'}
                                    onChange={() => setGifOption('upload')}
                                    className="form-radio"
                                />
                                <span className="ml-2">Upload</span>
                            </label>
                        </div>
                        {gifOption === 'link' ? (
                            <input
                                type="text"
                                name="gif_url"
                                value={exerciseData.gif_url}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 caret-black"
                                placeholder="Enter GIF URL"
                            />
                        ) : (
                            <input
                                type="file"
                                name="gif_file"
                                onChange={(e) => setExerciseData({ ...exerciseData, gif_file: e.target.files[0] })}
                                className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        )}
                    </div>
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700">Video URL</label>
                        <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="videoOption"
                                    value="link"
                                    checked={videoOption === 'link'}
                                    onChange={() => setVideoOption('link')}
                                    className="form-radio"
                                />
                                <span className="ml-2">Link</span>
                            </label>
                            <label className="inline-flex items-center">
                                <input
                                    type="radio"
                                    name="videoOption"
                                    value="upload"
                                    checked={videoOption === 'upload'}
                                    onChange={() => setVideoOption('upload')}
                                    className="form-radio"
                                />
                                <span className="ml-2">Upload</span>
                            </label>
                        </div>
                        {videoOption === 'link' ? (
                            <input
                                type="text"
                                name="video_url"
                                value={exerciseData.video_url}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 caret-black"
                                placeholder="Enter Video URL"
                            />
                        ) : (
                            <input
                                type="file"
                                name="video_file"
                                onChange={(e) => setExerciseData({ ...exerciseData, video_file: e.target.files[0] })}
                                className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            />
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="fitness_level" className="block text-sm font-medium text-gray-700">Fitness Level</label>
                        <select
                            id="fitness_level"
                            name="fitness_level"
                            value={exerciseData.fitness_level}
                            onChange={handleChange}
                            required
                            className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                        >
                            <option value="">Select Fitness Level</option>
                            <option value="None">None</option>
                            <option value="Beginner">Beginner</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                        </select>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <button type="submit" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                            Submit
                        </button>
                        <button onClick={onClose} type="button" className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddExerciseModal;