import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { format, differenceInYears } from 'date-fns';



const CustomPrompt = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [allClientData, setAllClientData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        level: '',
        intensity: '',
        trainingType: '',
        bodyParts: {},
        specific: {},
        duration: '',
        equipment: '',
        sessionType: '',
        comments: ''
    });
    const descriptions = {
        levels: {
            beginner: "This client is new to fitness, focusing on building basic strength and endurance.",
            intermediate: "This client has some experience and is looking to enhance their skill and fitness level.",
            advanced: "This client is experienced and aims to optimize performance and target specific fitness goals."
        },
        intensity: {
            low: "the workout will emphasize steady, sustainable exercises to gradually improve fitness without overexertion.",
            moderate: "the workout will balance between challenging and achievable exercises to effectively boost fitness and skill.",
            high: "the workout will include high-intensity exercises for maximum improvement in strength, endurance, and performance."
        },
        trainingType: {
            strength: "strength training approach which focuses on increasing muscle force and the ability to lift heavier weights, enhancing overall muscular strength.",
            hypertrophy: "hypertrophy style approach which aims to increase muscle size through targeted exercises that incrementally increase the volume of weight lifted (sets x reps), optimizing muscle growth.",
            functional: "functional fitness approach which trains the body for daily activities and improves range of motion using multi-joint movements that involve bending, twisting, lifting, and more, making everyday tasks easier.",
            strengthEndurance: "strength endurance training which combines strength exercises with stabilization endurance exercises for the same body part, performed back-to-back without rest, enhancing muscle endurance and strength.",
            balanced: "balanced health-focused method to provide a comprehensive workout that promotes overall health and well-being, blending various exercise forms to improve physical fitness in a well-rounded manner.",
            athletic: "sports performance training to help athletes achieve performance goals through exercises designed to improve specific athletic capabilities, enhancing fitness for sports activities.",
            cardio: "cardio training, or aerobic exercise that involves rhythmic activities to raise the heart rate to a target zone to burn the most fat and calories, improving cardiovascular health.",
            power: "power training training which involves exercises that require applying the maximum amount of force as quickly as possible; it is based on the formula where strength + speed = power, enhancing explosive power."
        }
    };
    const calculateAge = (dob) => {
        if (!dob) return null;
        return differenceInYears(new Date(), new Date(dob));
    };


    useEffect(() => {
        axios.get(`http://localhost:5000/api/current_client/${clientId}`)
            .then(response => {
                console.log("Initial data fetched:", response.data);
                setAllClientData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data');
                setLoading(false);
            });
    }, [clientId]);

    const validateForm = () => {
        const specificCount = Object.values(formData.specific).filter(val => val).length;
        const bodyPartCount = Object.values(formData.bodyParts).filter(val => val).length;
        let maxAllowed = 0;
        let errorMessage = '';
    
        switch (formData.sessionType) {
            case "single-day":
                maxAllowed = 1;
                break;
            case "3-day":
                maxAllowed = 3;
                break;
            case "5-day":
                maxAllowed = 5;
                break;
            default:
                errorMessage = 'Please select a valid session type.';
                console.log(errorMessage);
                setErrors({ ...errors, sessionType: errorMessage });
                return false;
        }
    
        // Check if any body parts are selected
        if (bodyPartCount > 0) {
            console.log("Validation passed with body parts selection.");
            setErrors({});
            return true;
        }
    
        // Check for the number of selected specifics
        if (specificCount > maxAllowed) {
            errorMessage = `You can only select up to ${maxAllowed} specifics for a ${formData.sessionType} session.`;
            console.log(errorMessage);
            setErrors({ ...errors, specifics: errorMessage });
            return false;
        } else if (specificCount === 0) {
            errorMessage = `You must select at least one specific or select a body part for a ${formData.sessionType} session.`;
            console.log(errorMessage);
            setErrors({ ...errors, specifics: errorMessage });
            return false;
        }
    
        console.log("Validation passed.");
        setErrors({});
        return true;
    };
    


    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        if (type === 'checkbox') {

            if (name === 'bodyParts') {
                const newBodyParts = {
                    ...formData.bodyParts,
                    [value]: checked
                };
                // Determined if any body parts are checked
                const anyBodyPartsChecked = Object.values(newBodyParts).some(val => val);

                setFormData(prevFormData => ({
                    ...prevFormData,
                    bodyParts: newBodyParts,
                    specific: anyBodyPartsChecked ? {} : prevFormData.specific 
                }));
            } else if (name === 'specific') {
                const newSpecific = {
                    ...formData.specific,
                    [value]: checked
                };
                // Determine if any specifics are checked
                const anySpecificsChecked = Object.values(newSpecific).some(val => val);

                setFormData(prevFormData => ({
                    ...prevFormData,
                    specific: newSpecific,
                    bodyParts: anySpecificsChecked ? {} : prevFormData.bodyParts 
                }));
            }
        } else {
            setFormData(prevFormData => ({
                ...prevFormData,
                [name]: value
            }));
        }
    };

    const formatBodyPartDescription = (part) => {
        const normalizedPart = part.toLowerCase().replace(/\s+/g, '');
        const descriptions = {
            'chest': 'chest',
            'back': 'back',
            'shoulders': 'shoulders',
            'triceps': 'triceps',
            'biceps': 'biceps',
            'quadriceps': 'quadriceps',
            'hamstrings': 'hamstrings',
            'glutes': 'glutes',
            'calves': 'calves',
            'core': 'core',
            'pushday(chest,shoulders,triceps)': 'a push day (chest, shoulders, triceps)',
            'pullday(backandbiceps)': 'a pull day (back and biceps)',
            'legday(quads,hamstrings,glutes,calves)': 'a leg day (quads, hamstrings, glutes, calves)',
            'armday(triceps,biceps,forearms)': 'an arm day (triceps, biceps, and forearms)',
            'full-body': 'a full body workout'
        };
        return descriptions[normalizedPart] || 'Part not specified'; // Fallback if no match found
    };

    const createWorkoutPlanMessage = () => {
        if (allClientData && allClientData.client_data) {
            const { client_data, consultation_data, history_data } = allClientData;

            // Combinded both body parts and specifics into one description
            const bodyPartDescriptions = Object.keys(formData.bodyParts)
                .filter(key => formData.bodyParts[key])  
                .map(part => formatBodyPartDescription(part))
                .concat(
                    Object.keys(formData.specific)
                        .filter(key => formData.specific[key])  
                        .map(part => formatBodyPartDescription(part))
                )
                .join(', ');

            const levelDescription = descriptions.levels[formData.level] || "Fitness level description not found.";
            const intensityDescription = descriptions.intensity[formData.intensity] || "Intensity level description not found.";
            const trainingTypeDescription = descriptions.trainingType[formData.trainingType] || "No training type specified.";
            

            return `
            Develop a ${formData.sessionType} workout plan for ${client_data.first_name} ${client_data.last_name},
            a ${calculateAge(client_data.dob)}-year-old ${client_data.gender}.
            Fitness Level: ${formData.level} - ${levelDescription}
            Intensity: ${formData.intensity} - this indicates a focus on ${intensityDescription}
            Client goals include "${consultation_data.fitness_goals}", approached through ${trainingTypeDescription}
            This plan will specifically target ${bodyPartDescriptions}, ensuring a balanced engagement without straying into less relevant exercises.
            Each session is designed to last approximately ${formData.duration} minutes, making optimal use of ${formData.equipment} gym resources.
            Medical considerations are noted as: "${history_data.existing_conditions}".
            Additional trainer insights: ${formData.comments}.
            
            `;
        } else {
            return "Loading client data...";
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            console.error("Validation failed.");
            return;
        }

        const workoutPlanDescription = createWorkoutPlanMessage();
        console.log("Workout Plan Description:", workoutPlanDescription);
        const data = {
            trainers_prompt: workoutPlanDescription,
            parameters: formData
        };

        console.log("Submitting data:", data);

        try {
            const res = await axios.post(`http://localhost:5000/api/generate_custom_plan/${clientId}`, data, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log("Response data:", res.data);
            navigate(`success`);  
        } catch (err) {
            console.error("Error during submission:", err);
            setError('Failed to submit the workout plan.');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6" style={{ fontSize: '30px' }}>Build Your Plan</h1>
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={() => navigate(-1)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
                        Return Back
                    </button>
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Client Level</label>
                    <select
                        name="level"
                        value={formData.level}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Select Level</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Intensity</label>
                    <select
                        name="intensity"
                        value={formData.intensity}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Select Intensity</option>
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Type of Training</label>
                    <select
                        name="trainingType"
                        value={formData.trainingType}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                    >
                        <option value="">Select Training Type</option>
                        <option value="strength">Strength Training</option>
                        <option value="hypertrophy">Hypertrophy Training</option>
                        <option value="functional">Functional Training</option>
                        <option value="strengthEndurance">Strength Endurance</option>
                        <option value="balanced">Balanced Health-Focused Training</option>
                        <option value="athletic">Athletic Training</option>
                        <option value="cardio">Cardio Training</option>
                        <option value="power">Power Training</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Main Body Parts</label>
                    {errors.bodyParts && <p className="text-red-500 text-xs italic">{errors.bodyParts}</p>}
                    <div className="flex" style={{ color: 'black' }}>
                        {['Chest', 'Back', 'Shoulders', 'Triceps', 'Biceps', 'Quadriceps', 'Hamstrings', 'Glutes', 'Calves', 'Core'].map(part => (
                            <div key={part} className="mr-4">
                                <input
                                    type="checkbox"
                                    name="bodyParts"
                                    value={part.toLowerCase()}
                                    checked={formData.bodyParts[part.toLowerCase()] || false}
                                    onChange={handleChange}
                                    disabled={Object.values(formData.specific).some(val => val)} // This disables the body parts if any specific is checked
                                    className="mr-2 leading-tight"
                                />
                                <span className="text-sm">{part}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Specifics:</label>
                    {errors.specifics && <p className="text-red-500 text-xs italic">{errors.specifics}</p>}

                    <div style={{ color: 'black' }}>
                        {['Push Day (Chest, Shoulders, Triceps)', 'Pull Day (Back and Biceps)', 'Leg Day (Quads, Hamstrings, Glutes, Calves)',
                            'Arm Day (Triceps, Biceps, Forearms)', 'Full-Body'].map(spec => (
                                <div key={spec} className="mb-2">
                                    <input
                                        type="checkbox"
                                        name="specific"
                                        value={spec.toLowerCase().replace(/\s+/g, '')}
                                        checked={formData.specific[spec.toLowerCase().replace(/\s+/g, '')] || false}
                                        onChange={handleChange}
                                        disabled={Object.values(formData.bodyParts).some(val => val)}
                                        className="mr-2 leading-tight"
                                    />
                                    <span className="text-sm">{spec}</span>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Duration</label>
                    <select
                        name="duration"
                        required
                        value={formData.duration}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Select Duration</option>
                        <option value="30">30 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Equipment Availability</label>
                    <select
                        name="equipment"
                        required
                        value={formData.equipment}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                        <option value="">Select Equipment</option>
                        <option value="full">Full Gym</option>
                        <option value="limited">Limited Gym</option>
                        <option value="home">Home Weights</option>
                        <option value="none">None</option>
                    </select>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Session Type</label>
                    <div className="flex" style={{ color: 'black' }}>
                        {['Single-day', '3-day', '5-day'].map(type => (
                            <div key={type} className="mr-4">
                                <input
                                    type="radio"
                                    name="sessionType"
                                    value={type.toLowerCase()}
                                    checked={formData.sessionType === type.toLowerCase()}
                                    onChange={handleChange}
                                    className="mr-2 leading-tight"
                                />
                                <span className="text-sm">{type}</span>
                                {errors.sessionType && <p className="text-red-500 text-xs italic">{errors.sessionType}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Additional Comments</label>
                    <textarea
                        name="comments"
                        value={formData.comments}
                        onChange={handleChange}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows="4"
                    ></textarea>
                </div>

                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"  // Added mb-4 here
                >
                    Generate
                </button>
                <p className="bg-gray-100 p-4 border-2 border-gray-700 rounded-lg shadow" style={{ color: 'black' }}>
                    {createWorkoutPlanMessage()}
                </p>

            </form>
        </div>
    );
};

export default CustomPrompt