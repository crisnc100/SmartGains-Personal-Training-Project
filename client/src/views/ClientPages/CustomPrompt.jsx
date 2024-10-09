import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { format, differenceInYears } from 'date-fns';
import ClipLoader from 'react-spinners/ClipLoader';  // Import the spinner component
import { FaInfoCircle } from 'react-icons/fa';
import { Tooltip } from 'react-tooltip';


const CustomPrompt = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        level: '',
        intensityMin: '',
        intensityMax: '',
        intensityRange: '',
        intensityMethod: 'percentage', // 'percentage', 'heartRate', or 'RPE'
        RPE: '', // For cardio with RPE
        trainingType: '',
        sport: '', // For athletic training
        bodyParts: {},
        specific: {},
        duration: '',
        equipment: '',
        sessionType: '',
        comments: ''
    });

    const [intensityRange, setIntensityRange] = useState({ min: 0, max: 100 });
    const [adjustedIntensityRange, setAdjustedIntensityRange] = useState({ min: 0, max: 100 });
    const [intensityWarning, setIntensityWarning] = useState('');
    const [submitting, setSubmitting] = useState(false);  // State for loading spinner
    const [allSummaries, setAllSummaries] = useState([]);
    const [selectedSummary, setSelectedSummary] = useState(null);
    const [basePrompt, setBasePrompt] = useState('');
    const [showFullPrompt, setShowFullPrompt] = useState(false);
    const [showBasePrompt, setShowBasePrompt] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientAge, setClientAge] = useState('');
    const [clientGender, setClientGender] = useState('');
    const rpeExplanation = "RPE (Rate of Perceived Exertion) is a subjective scale from 1-10 that measures the intensity of exercise based on how hard you feel you're working.";
    const mhrExplanation = "%MHR (Percentage of Maximum Heart Rate) is an objective measure of exercise intensity calculated as a percentage of your estimated maximum heart rate.";
    const [goal, setGoal] = useState("fitness and strength");
    const [customGoal, setCustomGoal] = useState('');
    const [medicalHistory, setMedicalHistory] = useState([]);
    const [limitations, setLimitations] = useState([]);
    const [exercisePreference, setExercisePreference] = useState("a balanced mix of cardio and strength training");
    const [customExercisePreference, setCustomExercisePreference] = useState('');
    const [motivation, setMotivation] = useState("personal progress");
    const [customMotivation, setCustomMotivation] = useState('');
    const [template, setTemplate] = useState({
        goals: "Focus on improving overall fitness and strength.",
        medical_history: "No significant medical history.",
        physical_limitations: "No physical limitations.",
        exercise_preferences: "Client prefers a balanced mix of cardio and strength training.",
        motivation: "Client is motivated by personal progress.",
    });;


    const descriptions = {
        levels: {
            beginner: "New to fitness; focusing on building basic strength and endurance.",
            intermediate: "Some experience; aiming to enhance skills and fitness levels.",
            advanced: "Experienced; targeting optimization of performance and specific fitness goals."
        },
        trainingType: {
            strength: "Focuses on increasing muscle strength and the ability to lift heavier weights.",
            hypertrophy: "Aims to increase muscle size through targeted exercises with progressive overload.",
            functional: "Trains the body for daily activities using multi-joint movements to improve range of motion.",
            strengthEndurance: "Combines strength and endurance exercises for the same body part without rest to enhance muscle endurance.",
            balanced: "Provides a comprehensive workout promoting overall health and well-being by blending various exercise forms.",
            athletic: "Improves specific athletic capabilities through exercises designed for sports performance.",
            cardio: "Involves rhythmic activities to raise heart rate for fat and calorie burning, enhancing cardiovascular health.",
            power: "Involves exercises applying maximum force quickly to enhance explosive power (strength + speed)."
        }
    };

    const trainingTypeIntensityRanges = {
        hypertrophy: { min: 55, max: 85 },
        strength: { min: 70, max: 100 },
        power: { min: 75, max: 90 },
        endurance: { min: 30, max: 60 },
        functional: { min: 50, max: 70 },
        cardio: { minHR: 50, maxHR: 85 }, // Percentage of max heart rate
        athletic: { min: 50, max: 90 },
        balanced: { min: 55, max: 75 }
    };

    const calculateAge = (dob) => {
        if (!dob) return null;
        return differenceInYears(new Date(), new Date(dob));
    };

    useEffect(() => {
        console.log("Fetching summaries for clientId:", clientId);
        axios.get(`http://localhost:5000/api/get_base_prompts/${clientId}`)
            .then(response => {
                const summaries = response.data;
                console.log("Summaries retrieved:", summaries);

                if (summaries.length > 0) {
                    setAllSummaries(summaries);
                    const latestSummary = summaries[0].id; // Automatically select the latest summary
                    setSelectedSummary(latestSummary); // Set selected summary to the latest one
                    setBasePrompt(latestSummary.summary_prompt); // Directly use the summary_prompt as the basePrompt
                    setClientName(`${summaries[0].id.first_name} ${summaries[0].id.last_name}`);
                    setClientAge(calculateAge(summaries[0].id.dob)); // Use calculateAge to set the client's age
                    setClientGender(`${summaries[0].id.gender}`.toLowerCase()); // Convert gender to lowercase
                    console.log("Latest summary selected:", latestSummary);
                } else {
                    console.log("No summaries available for the client.");
                    fetchBasicClientData(); // Fallback to basic client data if no summaries are found
                }
            })
            .catch(error => {
                if (error.response && error.response.status === 404) {
                    console.log("No summaries available, fetching basic client data instead.");
                    fetchBasicClientData(); // Fallback to basic client data on 404 error
                } else {
                    console.error('Error fetching summaries:', error);
                    setError('Failed to fetch summaries');
                }
            })
            .finally(() => {
                setLoading(false); // Ensure loading state is stopped
            });
    }, [clientId]);

    const fetchBasicClientData = () => {
        axios.get(`http://localhost:5000/api/get_simple_client_data/${clientId}`)
            .then(clientResponse => {
                const clientData = clientResponse.data;
                console.log("Simple client data retrieved:", clientData);
                setClientName(`${clientData.first_name} ${clientData.last_name}`);
                setClientAge(calculateAge(clientData.dob)); // Use calculateAge to set the client's age
                setClientGender(`${clientData.gender}`.toLowerCase()); // Convert gender to lowercase
            })
            .catch(clientError => {
                console.error('Error fetching simple client data:', clientError);
                setError('Failed to fetch simple client data');
            })
            .finally(() => {
                setLoading(false); // Ensure loading state is stopped after fetching basic data
            });
    };


    const handleSummaryChange = (e) => {
        const summaryId = e.target.value;
        console.log("Summary selected:", summaryId);
        const selectedSummary = allSummaries.find(summary => summary.id === parseInt(summaryId));
        if (selectedSummary) {
            setSelectedSummary(selectedSummary);
            setBasePrompt(selectedSummary.summary_prompt); // Use the summary_prompt as basePrompt
            console.log("Base prompt updated to:", selectedSummary.summary_prompt);
        }
    };


    // Medical History Change Handler
    const handleMedicalHistoryChange = (e) => {
        const { value, checked } = e.target;
        if (value === "No significant medical history") {
            if (checked) {
                setMedicalHistory(["No significant medical history"]);
            } else {
                setMedicalHistory([]);
            }
        } else {
            setMedicalHistory((prev) => {
                const withoutNone = prev.filter(item => item !== "No significant medical history");
                if (checked) {
                    return [...withoutNone, value];
                } else {
                    return withoutNone.filter(item => item !== value);
                }
            });
        }
    };

    // Physical Limitations Change Handler
    const handleLimitationsChange = (e) => {
        const { value, checked } = e.target;
        if (value === "No physical limitations") {
            if (checked) {
                setLimitations(["No physical limitations"]);
            } else {
                setLimitations([]);
            }
        } else {
            setLimitations((prev) => {
                const withoutNone = prev.filter(item => item !== "No physical limitations");
                if (checked) {
                    return [...withoutNone, value];
                } else {
                    return withoutNone.filter(item => item !== value);
                }
            });
        }
    };



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
        if (formData.trainingType === 'cardio') {
            if (formData.intensityMethod === 'heartRate') {
                if (!formData.intensityMin || !formData.intensityMax) {
                    setErrors({ ...errors, intensity: 'Please select an intensity range for cardio training.' });
                    return false;
                }
            } else if (formData.intensityMethod === 'RPE') {
                if (!formData.RPE) {
                    setErrors({ ...errors, intensity: 'Please select an RPE level for cardio training.' });
                    return false;
                }
            }
        } else if (formData.trainingType === 'athletic') {
            if (!formData.intensityRange) {
                setErrors({ ...errors, intensity: 'Please select an intensity range for athletic training.' });
                return false;
            }
            if (!formData.sport) {
                setErrors({ ...errors, sport: 'Please specify the sport for athletic training.' });
                return false;
            }
        } else {
            if (!formData.intensityMin || !formData.intensityMax) {
                setErrors({ ...errors, intensity: 'Please select an intensity range.' });
                return false;
            }
        }

        console.log("Validation passed.");
        setErrors({});
        return true;
    };

    const adjustIntensityForFitnessLevel = (intensityRange, fitnessLevel) => {
        let adjustedRange = { ...intensityRange };
        if (fitnessLevel === 'beginner') {
            adjustedRange.max = adjustedRange.min + (adjustedRange.max - adjustedRange.min) * 0.5;
        } else if (fitnessLevel === 'intermediate') {
            adjustedRange.min += (adjustedRange.max - adjustedRange.min) * 0.25;
            adjustedRange.max -= (adjustedRange.max - adjustedRange.min) * 0.25;
        }
        // Advanced level uses the full range
        return adjustedRange;
    };


    const generateIntensityOptions = (min, max) => {
        const options = [];
        for (let i = Math.ceil(min / 5) * 5; i <= max; i += 5) {
            options.push(<option key={i} value={i}>{i}%</option>);
        }
        return options;
    };

    useEffect(() => {
        if (formData.trainingType && formData.level) {
            const range = trainingTypeIntensityRanges[formData.trainingType] || { min: 50, max: 75 };
            setIntensityRange(range);

            let adjustedRange;
            if (formData.trainingType === 'cardio') {
                adjustedRange = range; // For cardio, use the same range
            } else {
                adjustedRange = adjustIntensityForFitnessLevel(range, formData.level);
            }
            setAdjustedIntensityRange(adjustedRange);

            // Set default intensity values within adjusted range
            setFormData(prevFormData => ({
                ...prevFormData,
                intensityMin: adjustedRange.min,
                intensityMax: adjustedRange.max
            }));
        }
    }, [formData.trainingType, formData.level]);

    useEffect(() => {
        // Check if intensity is outside the adjusted range
        if (formData.trainingType === 'cardio' && formData.intensityMethod === 'heartRate') {
            if (formData.intensityMin < intensityRange.minHR || formData.intensityMax > intensityRange.maxHR) {
                setIntensityWarning(`The selected heart rate intensity range is outside the recommended range for cardio training (${intensityRange.minHR}% - ${intensityRange.maxHR}%).`);
            } else {
                setIntensityWarning('');
            }
        } else {
            if (formData.intensityMin < adjustedIntensityRange.min || formData.intensityMax > adjustedIntensityRange.max) {
                setIntensityWarning(`The selected intensity range is outside the recommended range for ${formData.trainingType} training (${adjustedIntensityRange.min}% - ${adjustedIntensityRange.max}%).`);
            } else {
                setIntensityWarning('');
            }
        }
    }, [formData.intensityMin, formData.intensityMax, formData.intensityMethod, formData.trainingType, adjustedIntensityRange, intensityRange]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        if (type === 'checkbox') {
            if (name === 'bodyParts') {
                const newBodyParts = {
                    ...formData.bodyParts,
                    [value]: checked
                };
                // Determine if any body parts are checked
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
            setFormData(prevFormData => {
                let updatedData = { ...prevFormData, [name]: value };

                // Adjust intensityMax if intensityMin is changed
                if (name === 'intensityMin' && parseInt(value) > parseInt(prevFormData.intensityMax)) {
                    updatedData.intensityMax = value;
                }

                // Reset intensity values when training type or intensity method changes
                if (name === 'trainingType' || name === 'intensityMethod') {
                    updatedData.intensityMin = '';
                    updatedData.intensityMax = '';
                    updatedData.RPE = '';
                    updatedData.intensityRange = '';
                }

                return updatedData;
            });
        }
    };

    const handleGoalChange = (e) => {
        setGoal(e.target.value);
        if (e.target.value !== 'other') {
            setCustomGoal('');
        }
    };

    const handleExercisePreferenceChange = (e) => {
        setExercisePreference(e.target.value);
        if (e.target.value !== 'other') {
            setCustomExercisePreference('');
        }
    };

    const handleMotivationChange = (e) => {
        setMotivation(e.target.value);
        if (e.target.value !== 'other') {
            setCustomMotivation('');
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

        // Handle "Other" options for Goals, Exercise Preferences, and Motivation
        const selectedGoal = goal === 'other' ? customGoal : goal;
        const selectedExercisePreference = exercisePreference === 'other' ? customExercisePreference : exercisePreference;
        const selectedMotivation = motivation === 'other' ? customMotivation : motivation;

        // For Medical History and Physical Limitations, join the arrays into strings
        const medicalHistoryString = medicalHistory.length > 0 ? medicalHistory.join(', ') : 'No significant medical history';
        const limitationsString = limitations.length > 0 ? limitations.join(', ') : 'No physical limitations';

        if (clientName && clientAge && clientGender) {
            // Combine both body parts and specifics into one description
            const bodyPartDescriptions = Object.keys(formData.bodyParts)
                .filter(key => formData.bodyParts[key])
                .map(part => formatBodyPartDescription(part))
                .concat(
                    Object.keys(formData.specific)
                        .filter(key => formData.specific[key])
                        .map(part => formatBodyPartDescription(part))
                )
                .join(', ');

            // Get level, intensity, and training type descriptions from descriptions object
            const levelDescription = descriptions.levels[formData.level] || "Fitness level description not found.";
            const trainingTypeDescription = descriptions.trainingType[formData.trainingType] || "Training type description not found.";

            // Intensity description
            let intensityDescription = '';
            if (formData.trainingType === 'cardio') {
                if (formData.intensityMethod === 'heartRate') {
                    intensityDescription = `Cardio exercises will be performed between ${formData.intensityMin}% and ${formData.intensityMax}% of the client's maximum heart rate.`;
                } else if (formData.intensityMethod === 'RPE') {
                    intensityDescription = `Cardio exercises will be guided by an RPE of ${formData.RPE} on a scale of 1-10.`;
                }
            } else if (formData.trainingType === 'athletic') {
                intensityDescription = `Exercises will be performed within an intensity range of ${formData.intensityRange}% to improve performance in ${formData.sport}.`;
            } else {
                intensityDescription = `Exercises will be performed between ${formData.intensityMin}% and ${formData.intensityMax}% of the client's one-repetition maximum (1RM).`;
            }

            // Fallback data for client-specific fields, like goals, medical history, etc.
            const clientGoals = selectedSummary?.goals || selectedGoal;
            const exercisePreferences = selectedSummary?.exercise_preferences || selectedExercisePreference;
            const motivationInfo = selectedSummary?.motivation || selectedMotivation;

            // Use the joined strings for medical history and limitations
            const medicalHistoryInfo = selectedSummary?.medical_history || medicalHistoryString;
            const physicalLimitations = selectedSummary?.physical_limitations || limitationsString;
            // Final workout plan message
            return `
           Please create a comprehensive **${formData.sessionType} workout plan** tailored for the following client:

            **Client Information:**
            - **Name:** ${clientName}
            - **Age:** ${clientAge}
            - **Gender:** ${clientGender}

            **Fitness Profile:**
            - **Fitness Level:** ${formData.level} (${levelDescription})
            - **Intensity:** ${intensityDescription}
            - **Training Type:** ${formData.trainingType} (${trainingTypeDescription})
            - **Session Duration:** Approximately ${formData.duration} minutes
            - **Available Equipment:** ${formData.equipment}

            **Focus Areas:**
            - **Targeted Body Parts:** ${bodyPartDescriptions}

            **Personal Goals and Preferences:**
            - **Goals:** ${clientGoals}
            - **Exercise Preferences:** ${exercisePreferences}
            - **Motivation Factors:** ${motivationInfo}

            **Health Considerations:**
            - **Medical History:** ${medicalHistoryInfo}
            - **Physical Limitations:** ${physicalLimitations}

            **Additional Notes:**
            - ${formData.comments}

            **Instructions:**
            Please ensure the workout plan:
            - Is aligned with the client's fitness level and goals.
            - Takes into account their medical history and physical limitations.
            - Incorporates their exercise preferences and motivation factors.
            - Is structured in a clear, step-by-step format.

            Thank you.
            `;
        } else {
            return "Loading client data...";
        }
    };

    const capitalizeFirstLetter = (string) => {
        if (!string) return '';
        return string.charAt(0).toUpperCase() + string.slice(1);
    };


    const createSimplifiedOverview = () => {
        if (clientName && clientAge && clientGender) {
            // Prepare key details for the overview
            const levelType = capitalizeFirstLetter(formData.level) || 'Unspecified level';
            const levelDescription = descriptions.levels[formData.level] || "Fitness level description not found.";
            const trainingType = capitalizeFirstLetter(formData.trainingType) || 'Unspecified training type';
            const trainingTypeDescription = descriptions.trainingType[formData.trainingType] || "Training type description not found.";
            const duration = formData.duration ? `${formData.duration} minutes` : 'Unspecified duration';
            const equipment = capitalizeFirstLetter(formData.equipment) || 'Unspecified equipment';
            const sessionType = capitalizeFirstLetter(formData.sessionType) || 'Unspecified session type';
            const additionalComments = formData.comments || 'No additional comments';

            // Intensity overview
            let intensityOverview = '';
            if (formData.trainingType === 'cardio') {
                if (formData.intensityMethod === 'heartRate') {
                    intensityOverview = `Heart Rate: ${formData.intensityMin}% - ${formData.intensityMax}% of Max HR`;
                } else if (formData.intensityMethod === 'RPE') {
                    intensityOverview = `RPE Level: ${formData.RPE}/10`;
                }
            } else if (formData.trainingType === 'athletic') {
                intensityOverview = `Intensity Range: ${formData.intensityRange}%`;
            } else {
                intensityOverview = `Intensity: ${formData.intensityMin}% - ${formData.intensityMax}% of 1RM`;
            }

            // Body parts or specifics
            const bodyPartDescriptions = Object.keys(formData.bodyParts)
                .filter(key => formData.bodyParts[key])
                .map(part => formatBodyPartDescription(part))
                .concat(
                    Object.keys(formData.specific)
                        .filter(key => formData.specific[key])
                        .map(part => formatBodyPartDescription(part))
                )
                .join(', ') || 'No specific body parts selected';

            // Sport (for athletic training)
            const sport = formData.sport ? `Sport: ${formData.sport}` : '';

            // Simplified overview
            return (
                <>
                    <p><strong>Fitness Level:</strong> {levelType} - {levelDescription}</p>
                    <p><strong>Training Type:</strong> {trainingType} - {trainingTypeDescription}</p>
                    <p><strong>{intensityOverview}</strong></p>
                    <p><strong>Focus Areas:</strong> {bodyPartDescriptions}</p>
                    <p><strong>Duration:</strong> {duration}</p>
                    <p><strong>Equipment:</strong> {equipment}</p>
                    <p><strong>Session Type:</strong> {sessionType}</p>
                    {sport && <p><strong>{sport}</strong></p>}
                    <p><strong>Comments:</strong> {additionalComments}</p>
                </>
            );
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
            setSubmitting(true);  // Show loading spinner
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
        } finally {
            setSubmitting(false);  // Hide loading spinner
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="container mx-auto p-4">
            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
                <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6" style={{ fontSize: '30px' }}>Build Your Plan</h1>
                <div className="flex justify-end space-x-2 mt-4">
                    <button onClick={() => navigate(-1)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
                        Return Back
                    </button>
                </div>
                <div className="my-4">
                    <div className="flex items-center">
                        <h2 className="text-xl font-medium text-gray-700">Client: {clientName}</h2>
                        <FaInfoCircle
                            className="ml-2 text-blue-600 cursor-pointer"
                            onClick={() => setShowBasePrompt(!showBasePrompt)}
                            data-tooltip-id={`tooltip-summary`}
                            data-tooltip-content="View Client Summary"
                        />
                        <Tooltip id={`tooltip-summary`} place="right" type="dark" effect="solid" style={{ padding: '3px 8px', fontSize: '12px' }} />
                    </div>
                    {showBasePrompt && (
                        <div className="mt-2 p-4 bg-gray-100 rounded-md">
                            <h3 className="text-lg font-medium text-gray-700">Base Prompt (Summary):</h3>
                            {basePrompt ? (
                                <p>{basePrompt}</p>
                            ) : (
                                <p className="text-red-500">No base summary prompt available for this client.</p>
                            )}
                        </div>
                    )}
                </div>
                {allSummaries.length > 0 && (
                    <div className="my-4">
                        <label htmlFor="summarySelect" className="block text-lg font-medium text-gray-700">Select a Summary:</label>
                        <select
                            id="summarySelect"
                            value={selectedSummary?.id}
                            onChange={handleSummaryChange}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        >
                            {allSummaries.map((summary) => (
                                <option key={summary.id.id} value={summary.id.id}>
                                    {summary.id.summary_type} - {new Date(summary.id.created_at).toLocaleDateString()}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
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

                {/* Intensity Selection */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Intensity
                        <FaInfoCircle
                            className="ml-2 text-blue-600 cursor-pointer inline"
                            data-tooltip-id="intensity-tooltip"
                            data-tooltip-content="Adjust the intensity based on the client's fitness level and training type."
                        />
                        <Tooltip id="intensity-tooltip" place="right" type="dark" effect="solid" />
                    </label>

                    {formData.trainingType && formData.level && (
                        <div className="mb-4">
                            {formData.trainingType === 'cardio' ? (
                                <>
                                    {/* Intensity Method Selection */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Intensity Method</label>
                                        <div className="flex items-center">
                                            {/* First Option: Percentage of Max Heart Rate (%MHR) */}
                                            <div className="flex items-center mr-4">
                                                <input
                                                    type="radio"
                                                    name="intensityMethod"
                                                    value="heartRate"
                                                    checked={formData.intensityMethod === 'heartRate'}
                                                    onChange={handleChange}
                                                    className="mr-2"
                                                />
                                                <label className="flex items-center">
                                                    Percentage of Max Heart Rate (%MHR)
                                                    <FaInfoCircle
                                                        className="ml-1 text-blue-600 cursor-pointer inline"
                                                        data-tooltip-id="mhr-tooltip"
                                                        data-tooltip-content={mhrExplanation}
                                                    />
                                                    <Tooltip id="mhr-tooltip" place="top" type="dark" effect="solid" />
                                                </label>
                                            </div>
                                            {/* Second Option: Rate of Perceived Exertion (RPE 1-10) */}
                                            <div className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="intensityMethod"
                                                    value="RPE"
                                                    checked={formData.intensityMethod === 'RPE'}
                                                    onChange={handleChange}
                                                    className="mr-2"
                                                />
                                                <label className="flex items-center">
                                                    Rate of Perceived Exertion (RPE 1-10)
                                                    <FaInfoCircle
                                                        className="ml-1 text-blue-600 cursor-pointer inline"
                                                        data-tooltip-id="rpe-tooltip"
                                                        data-tooltip-content={rpeExplanation}
                                                    />
                                                    <Tooltip id="rpe-tooltip" place="top" type="dark" effect="solid" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Intensity Inputs Based on Method */}
                                    {formData.intensityMethod === 'heartRate' && (
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                                Intensity Range (% of Max Heart Rate)
                                            </label>
                                            <div className="flex space-x-2">
                                                <div>
                                                    <label className="block text-gray-700 text-sm">Min</label>
                                                    <select
                                                        name="intensityMin"
                                                        value={formData.intensityMin}
                                                        onChange={handleChange}
                                                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                    >
                                                        {generateIntensityOptions(50, 85)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-gray-700 text-sm">Max</label>
                                                    <select
                                                        name="intensityMax"
                                                        value={formData.intensityMax}
                                                        onChange={handleChange}
                                                        className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                    >
                                                        {generateIntensityOptions(formData.intensityMin || 50, 85)}
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {formData.intensityMethod === 'RPE' && (
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                                RPE Intensity Level (1-10)
                                            </label>
                                            <select
                                                name="RPE"
                                                value={formData.RPE || ''}
                                                onChange={handleChange}
                                                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            >
                                                <option value="">Select RPE</option>
                                                {[...Array(10)].map((_, i) => (
                                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </>
                            ) : formData.trainingType === 'athletic' ? (
                                <>
                                    {/* Athletic Training Intensity Range Selection */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Intensity Range (% of 1RM)
                                        </label>
                                        <select
                                            name="intensityRange"
                                            value={formData.intensityRange}
                                            onChange={handleChange}
                                            className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                        >
                                            <option value="">Select Intensity Range</option>
                                            <option value="50-60">50% - 60%</option>
                                            <option value="60-75">60% - 75%</option>
                                            <option value="75-90">75% - 90%</option>
                                        </select>
                                        {errors.intensity && <p className="text-red-500 text-xs italic">{errors.intensity}</p>}
                                    </div>

                                    {/* Sport Input Field */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">Sport</label>
                                        <input
                                            type="text"
                                            name="sport"
                                            value={formData.sport || ''}
                                            onChange={handleChange}
                                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            placeholder="Enter the sport (e.g., soccer, basketball)"
                                        />
                                        {errors.sport && <p className="text-red-500 text-xs italic">{errors.sport}</p>}
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Regular Training Intensity Range Selection */}
                                    <div className="mb-4">
                                        <label className="block text-gray-700 text-sm font-bold mb-2">
                                            Intensity Range (% of 1RM)
                                            <FaInfoCircle
                                                className="ml-2 text-blue-600 cursor-pointer inline"
                                                data-tooltip-id="intensity-tooltip"
                                                data-tooltip-content="Select the intensity range based on the client's fitness level and training type."
                                            />
                                            <Tooltip id="intensity-tooltip" place="right" type="dark" effect="solid" />
                                        </label>
                                        <div className="flex space-x-2">
                                            <div>
                                                <label className="block text-gray-700 text-sm">Min</label>
                                                <select
                                                    name="intensityMin"
                                                    value={formData.intensityMin}
                                                    onChange={handleChange}
                                                    className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                >
                                                    {generateIntensityOptions(adjustedIntensityRange.min, adjustedIntensityRange.max)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-gray-700 text-sm">Max</label>
                                                <select
                                                    name="intensityMax"
                                                    value={formData.intensityMax}
                                                    onChange={handleChange}
                                                    className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                >
                                                    {generateIntensityOptions(formData.intensityMin || adjustedIntensityRange.min, adjustedIntensityRange.max)}
                                                </select>
                                            </div>
                                        </div>
                                        {errors.intensity && <p className="text-red-500 text-xs italic">{errors.intensity}</p>}
                                    </div>
                                </>
                            )}

                            {intensityWarning && (
                                <p className="text-red-500 text-xs italic">{intensityWarning}</p>
                            )}
                        </div>
                    )}
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
                        <option value="45">45 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="90">90 minutes</option>
                        <option value="120+">2+ hours</option>
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
                {allSummaries.length === 0 && (
                    <div className="my-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
                        <p>No client summary data available. Using default options for the workout plan. Customize as needed below:</p>
                    </div>
                )}

                {allSummaries.length === 0 && (
                    <>
                        {/* Primary Goal */}
                        <div className="my-4">
                            <label htmlFor="goalSelect" className="block text-lg font-medium text-gray-700">Select Primary Goal:</label>
                            <select
                                id="goalSelect"
                                value={goal}
                                onChange={handleGoalChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-400 rounded-md"
                            >
                                <option value="">Select a goal</option>
                                <option value="fitness and strength">Fitness and Strength</option>
                                <option value="muscle gain">Muscle Gain</option>
                                <option value="weight loss">Weight Loss</option>
                                <option value="improve endurance">Improve Endurance</option>
                                <option value="flexibility and mobility">Flexibility and Mobility</option>
                                <option value="other">Other</option>
                            </select>
                            {goal === 'other' && (
                                <input
                                    type="text"
                                    value={customGoal}
                                    onChange={(e) => setCustomGoal(e.target.value)}
                                    placeholder="Enter custom goal"
                                    className="mt-2 block w-full pl-3 pr-3 py-2 border-2 border-gray-400 rounded-md"
                                />
                            )}
                        </div>

                        {/* Medical History */}
                        <div className="my-4">
                            <label className="block text-lg font-medium text-gray-700">Select Medical History:</label>
                            <div className="mt-2">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        value="No significant medical history"
                                        checked={medicalHistory.includes("No significant medical history")}
                                        onChange={handleMedicalHistoryChange}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2">No significant medical history</span>
                                </label>
                                <div className="flex flex-wrap mt-2">
                                    {["Knee injury", "Back pain", "Shoulder issues", "Heart condition"].map((item) => (
                                        <label key={item} className="inline-flex items-center mr-6">
                                            <input
                                                type="checkbox"
                                                value={item}
                                                checked={medicalHistory.includes(item)}
                                                onChange={handleMedicalHistoryChange}
                                                className="form-checkbox"
                                                disabled={medicalHistory.includes("No significant medical history")}
                                            />
                                            <span className="ml-2">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Physical Limitations */}
                        <div className="my-4">
                            <label className="block text-lg font-medium text-gray-700">Select Physical Limitations:</label>
                            <div className="mt-2">
                                <label className="inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        value="No physical limitations"
                                        checked={limitations.includes("No physical limitations")}
                                        onChange={handleLimitationsChange}
                                        className="form-checkbox"
                                    />
                                    <span className="ml-2">No physical limitations</span>
                                </label>
                                <div className="flex flex-wrap mt-2">
                                    {["Avoid heavy lifting", "Limit cardio", "Limited range of motion", "Low impact only"].map((item) => (
                                        <label key={item} className="inline-flex items-center mr-6">
                                            <input
                                                type="checkbox"
                                                value={item}
                                                checked={limitations.includes(item)}
                                                onChange={handleLimitationsChange}
                                                className="form-checkbox"
                                                disabled={limitations.includes("No physical limitations")}
                                            />
                                            <span className="ml-2">{item}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Exercise Preferences */}
                        <div className="my-4">
                            <label htmlFor="exercisePreferenceSelect" className="block text-lg font-medium text-gray-700">Select Exercise Preference:</label>
                            <select
                                id="exercisePreferenceSelect"
                                value={exercisePreference}
                                onChange={handleExercisePreferenceChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-400 rounded-md"
                            >
                                <option value="">Select an exercise preference</option>
                                <option value="a balanced mix of cardio and strength training">Balanced mix of cardio and strength training</option>
                                <option value="heavy resistance training">Heavy resistance training</option>
                                <option value="yoga and flexibility">Yoga and flexibility</option>
                                <option value="high-intensity interval training (HIIT)">High-Intensity Interval Training (HIIT)</option>
                                <option value="low-impact exercises">Low-Impact Exercises</option>
                                <option value="other">Other</option>
                            </select>
                            {exercisePreference === 'other' && (
                                <input
                                    type="text"
                                    value={customExercisePreference}
                                    onChange={(e) => setCustomExercisePreference(e.target.value)}
                                    placeholder="Enter custom exercise preference"
                                    className="mt-2 block w-full pl-3 pr-3 py-2 border-2 border-gray-400 rounded-md"
                                />
                            )}
                        </div>

                        {/* Motivation */}
                        <div className="my-4">
                            <label htmlFor="motivationSelect" className="block text-lg font-medium text-gray-700">Select Motivation:</label>
                            <select
                                id="motivationSelect"
                                value={motivation}
                                onChange={handleMotivationChange}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-2 border-gray-400 rounded-md"
                            >
                                <option value="">Select a motivation</option>
                                <option value="personal progress">Personal Progress</option>
                                <option value="competitive drive">Competitive Drive</option>
                                <option value="health improvement">Health Improvement</option>
                                <option value="stress relief">Stress Relief</option>
                                <option value="social engagement">Social Engagement</option>
                                <option value="other">Other</option>
                            </select>
                            {motivation === 'other' && (
                                <input
                                    type="text"
                                    value={customMotivation}
                                    onChange={(e) => setCustomMotivation(e.target.value)}
                                    placeholder="Enter custom motivation"
                                    className="mt-2 block w-full pl-3 pr-3 py-2 border-2 border-gray-400 rounded-md"
                                />
                            )}
                        </div>
                    </>
                )}

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

                {/* Simplified Overview and Full Prompt Toggle */}
                <div className="bg-gray-100 p-4 border-2 border-gray-700 rounded-lg shadow mb-4" style={{ color: 'black' }}>
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold">Workout Plan Overview</h2>
                        <FaInfoCircle
                            className="text-blue-600 cursor-pointer"
                            onClick={() => setShowFullPrompt(!showFullPrompt)}
                            data-tooltip-id="full-prompt-tooltip"
                            data-tooltip-content="View Full Prompt Details"
                        />
                        <Tooltip id="full-prompt-tooltip" place="left" type="dark" effect="solid" />
                    </div>
                    <div className="mt-2">
                        {createSimplifiedOverview()}
                    </div>
                    {showFullPrompt && (
                        <div className="mt-4">
                            <h3 className="text-md font-semibold">Full Prompt:</h3>
                            <p className="mt-2 whitespace-pre-wrap">{createWorkoutPlanMessage()}</p>
                        </div>
                    )}
                </div>

                {/* Submit Button and Loader */}
                {submitting && (
                    <div className="flex justify-center my-4">
                        <ClipLoader color={"#123abc"} loading={submitting} size={150} />
                    </div>
                )}
                <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mb-4"
                    disabled={submitting}
                >
                    Generate
                </button>

                {errors.submitError && <div className="text-red-500 text-sm mt-2">{errors.submitError}</div>}
            </form>
        </div>
    );
};

export default CustomPrompt;
