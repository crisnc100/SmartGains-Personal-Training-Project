import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import TDEEModal from './TDEEModal';
import { differenceInYears } from 'date-fns';

const calculateAge = (dob) => {
    if (!dob) return '';
    return differenceInYears(new Date(), new Date(dob));
};

const TDEECalculator = () => {
    const { clientId } = useParams();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();
    const [tdeeVariables, setTdeeVariables] = useState({
        height: "",
        weight: "",
        age: "",
        gender: "Male",
        bodyfat_est: "",
        activity_level_neat: "Sedentary",
        activity_level_eat: "None",
        exercise_days_per_week: "",
        gym_duration: "",
        tef_percentage: 10
    });

    const [tdeeNormal, setTdeeNormal] = useState(null);
    const [tdeeAverage, setTdeeAverage] = useState(null);
    const [errorMargin, setErrorMargin] = useState(10);
    const [showBodyFatInfo, setShowBodyFatInfo] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    useEffect(() => {
        if (clientId) {
            axios.get(`http://localhost:5000/api/get_tdee_variables/${clientId}`, { withCredentials: true })
                .then(response => {
                    const dob = response.data.dob ? response.data.dob : '';
                    const age = dob ? calculateAge(dob) : response.data.age;
                    setTdeeVariables(prevState => ({
                        ...prevState,
                        ...response.data,
                        age: age,
                        tef_percentage: response.data.tef_percentage || 10
                    }));
                })
                .catch(error => {
                    console.error('Error fetching TDEE variables:', error);
                });
        }
    }, [clientId]);

    useEffect(() => {
        console.log("Initial State:", tdeeVariables);
    }, [tdeeVariables]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        console.log(`Input Change - Name: ${name}, Value: ${value}`);
        setTdeeVariables(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (name === 'bodyfat_est' && value) {
            setShowBodyFatInfo(true);
        } else if (name === 'bodyfat_est' && !value) {
            setShowBodyFatInfo(false);
        }
    };

    const handleErrorMarginChange = (event) => {
        setErrorMargin(parseFloat(event.target.value));
    };

    const parseWeight = (weightStr) => {
        const weight = parseFloat(weightStr.replace(/[^0-9.]/g, ''));
        return isNaN(weight) ? 0 : weight;
    };

    const parseHeight = (heightStr) => {
        const matchesFeetInches = heightStr.match(/(\d+)'(\d+)/);
        const matchesCm = heightStr.match(/(\d+)\s*cm/);

        if (matchesFeetInches) {
            const feet = parseInt(matchesFeetInches[1], 10);
            const inches = parseInt(matchesFeetInches[2], 10);
            return (feet * 12) + inches;
        } else if (matchesCm) {
            const cm = parseInt(matchesCm[1], 10);
            return cm / 2.54; // Convert cm to inches
        }
        return 0;
    };

    const calculateTDEE = () => {
        const { height, weight, age, gender, bodyfat_est, activity_level_neat, activity_level_eat, exercise_days_per_week, gym_duration, tef_percentage } = tdeeVariables;
        console.log("TEF Percentage:", tef_percentage);
        const weightKg = parseWeight(weight) * 0.453592; // Convert pounds to kg
        console.log("Weight (kg):", weightKg);
        const heightCm = parseHeight(height) * 2.54; // Convert inches to cm
        console.log("Height (cm):", heightCm);

        // Calculate BMR
        let bmr;
        if (bodyfat_est) {
            const leanBodyMass = weightKg * (1 - parseFloat(bodyfat_est) / 100);
            console.log("Lean Body Mass (kg):", leanBodyMass);
            bmr = 370 + (21.6 * leanBodyMass);
        } else {
            if (gender === 'Male') {
                bmr = 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age);
            } else if (gender === 'Female') {
                bmr = 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
            } else {
                throw new Error('Invalid gender specified');
            }
        }
        console.log("BMR:", bmr);

        const tef = !isNaN(parseFloat(tef_percentage)) ? bmr * (parseFloat(tef_percentage) / 100) : 0;
        console.log("TEF:", tef);

        const neatFactors = {
            'Sedentary': 1.01,
            'Light': 1.05,
            'Moderate': 1.1,
            'Active': 1.15,
            'Very_Active': 1.2,
            'Extremely_Active': 1.25
        };
        const neatFactor = neatFactors[activity_level_neat] || 1.0;
        const neatAdjustment = bmr * (neatFactor - 1);
        console.log("NEAT Adjustment:", neatAdjustment);

        const eatRatesPerPound = {
            'Female': {
                'Very_Intense': 5.868,
                'Intense': 4.398,
                'Moderate': 2.931,
                'Light': 1.466,
                'None': 0
            },
            'Male': {
                'Very_Intense': 6.078,
                'Intense': 4.559,
                'Moderate': 3.039,
                'Light': 1.520,
                'None': 0
            }
        };

        const genderRates = eatRatesPerPound[gender];
        const eatRatePerPound = genderRates[activity_level_eat];
        const eatRate = eatRatePerPound * parseWeight(weight);
        console.log("EAT Rate (calories/hour):", eatRate);
        const weeklyExerciseCalories = eatRate * (gym_duration / 60) * exercise_days_per_week; // Convert gym duration from minutes to hours
        const dailyExerciseCalories = weeklyExerciseCalories / 7;
        console.log("Daily Exercise Calories:", dailyExerciseCalories);

        const tdee = bmr + tef + neatAdjustment + dailyExerciseCalories;
        console.log("Total TDEE:", tdee);

        const lowerEndTDEE = tdee * (1 - errorMargin / 100);
        const upperEndTDEE = tdee * (1 + errorMargin / 100);
        const averageTDEE = (lowerEndTDEE + upperEndTDEE) / 2;

        setTdeeNormal({ lower: lowerEndTDEE, upper: upperEndTDEE, ErrorMargin: errorMargin });
        setTdeeAverage(averageTDEE);
    };

    const saveTDEE = () => {
        if (clientId) {
            axios.post('http://localhost:5000/api/save_tdee', {
                client_id: clientId,
                normal_tdee: { lower: tdeeNormal.lower, upper: tdeeNormal.upper, ErrorMargin: errorMargin },
                average_tdee: tdeeAverage
            }, { withCredentials: true })
                .then(response => {
                    console.log('TDEE saved:', response.data);
                })
                .catch(error => {
                    console.error('Error saving TDEE:', error);
                });
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg" style={{ color: 'black' }}>
            <div className="flex justify-between items-center mb-4">
                <button onClick={() => navigate(-1)} className="ml-auto px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
                    Return to Client
                </button>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-center">TDEE Calculator (Total Daily Energy Expenditure)</h1>
            <div className='flex justify-center mb-6'>
                <button
                    onClick={openModal}
                    className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                >
                    About This Calculator
                </button>
            </div>

            <TDEEModal isOpen={isModalOpen} onClose={closeModal}>
                <h2 className="text-xl font-semibold mb-4">About This Calculator</h2>
                <p className="text-gray-700 mt-2">
                    Most TDEE calculators are not 100% accurate because they do not consider all individual variations. Our method
                    includes more variables, such as body fat percentage, average daily steps, and exercise habits, to ensure a more
                    accurate TDEE estimate. However, please note that even with these additional factors, the calculation is still an
                    estimate and not a precise measurement.
                </p>
                <p className="text-gray-700 mt-2">
                    The TDEE margin of error ranges between 8-16%. This margin accounts for variations in daily activity levels and
                    other factors that may influence energy expenditure. While 10% is a common default value, you can adjust the margin
                    based on your specific needs.
                </p>
                <p className="text-gray-700 mt-2">
                    <strong>Using body fat percentage</strong> for BMR calculations provides a more personalized estimate and can be within
                    5-10% of your actual BMR. Without body fat percentage, we use the Mifflin-St Jeor equation, which is generally
                    within 10-15% of the actual BMR.
                </p>
            </TDEEModal>
            <form onSubmit={(e) => { e.preventDefault(); calculateTDEE(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                        <label htmlFor="height" className="block text-gray-700">Height</label>
                        <input
                            type="text"
                            name="height"
                            value={tdeeVariables.height}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="weight" className="block text-gray-700">Weight</label>
                        <input
                            type="text"
                            name="weight"
                            value={tdeeVariables.weight}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="age" className="block text-gray-700">Age</label>
                        <input
                            type="number"
                            name="age"
                            value={tdeeVariables.age}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gender" className="block text-gray-700">Gender</label>
                        <select
                            name="gender"
                            value={tdeeVariables.gender}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="bodyfat_est" className="block text-gray-700">Body Fat Estimation (optional)</label>
                        <input
                            type="text"
                            name="bodyfat_est"
                            value={tdeeVariables.bodyfat_est}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                        />
                        {showBodyFatInfo && (
                            <p className="text-sm text-gray-500 mt-1">
                                Using Katch-McArdle Formula for BMR calculation based on body fat percentage. This method can be more accurate if body fat percentage is known and actually accurate. This method can be within 5-10% of actual BMR.
                            </p>
                        )}
                        {!showBodyFatInfo && (
                            <p className="text-sm text-gray-500 mt-1">
                                Using Mifflin-St Jeor Equation for BMR calculation. This method is commonly used when body fat percentage is not available. This method can be within 10-15% of actual BMR.
                            </p>
                        )}
                    </div>
                    <div className="form-group">
                        <label htmlFor="activity_level_neat" className="block text-gray-700">Activity Level NEAT</label>
                        <select
                            name="activity_level_neat"
                            value={tdeeVariables.activity_level_neat}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                        >
                            <option value="Sedentary">Sedentary: 0 - 2999 steps/day (e.g., Office worker)</option>
                            <option value="Light">Light: 3000 - 4999 steps/day (e.g., Teacher, cashier)</option>
                            <option value="Moderate">Moderate: 5000 - 7499 steps/day (e.g., Retail worker, nurse)</option>
                            <option value="Active">Active: 7500 - 9999 steps/day (e.g., Construction worker, landscaper)</option>
                            <option value="Very_Active"> Very Active: 10000 - 14999 steps/day (e.g., Mail carrier, professional athlete)</option>
                            <option value="Extremely_Active">Extremely Active: 15000+ steps/day (e.g., Manual laborer, professional dancer)</option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1">
                            Tip: Do not overestimate your daily activity levels. It is better to underestimate for a more accurate result.
                        </p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="activity_level_eat" className="block text-gray-700">Activity Level EAT</label>
                        <select
                            name="activity_level_eat"
                            value={tdeeVariables.activity_level_eat}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                        >
                            <option value="None">None</option>
                            <option value="Light">Light</option>
                            <option value="Moderate">Moderate</option>
                            <option value="Intense">Intense</option>
                            <option value="Very_Intense">Very Intense</option>
                        </select>
                        <p className="text-sm text-gray-500 mt-1">
                            Tip: Do not overestimate your exercise activity levels. Lifting weights alone does not burn as many calories and should be considered "Light". Combining moderate cardio and weights can be classified as "Moderate". It is better to underestimate for a more accurate result.
                        </p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="exercise_days_per_week" className="block text-gray-700">Exercise Days Per Week</label>
                        <input
                            type="number"
                            name="exercise_days_per_week"
                            value={tdeeVariables.exercise_days_per_week}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="gym_duration" className="block text-gray-700">Gym Duration (minutes)</label>
                        <input
                            type="number"
                            name="gym_duration"
                            value={tdeeVariables.gym_duration}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="tef_percentage" className="block text-gray-700">TEF Percentage (%)</label>
                        <input
                            type="number"
                            name="tef_percentage"
                            value={tdeeVariables.tef_percentage}
                            onChange={handleInputChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                        />

                        <p className="text-sm text-gray-500 mt-1">Thermic Effect of Food. Average is 10%. Consider a range of 8-12% if you have a higher protein intake with more frequent meals.</p>
                    </div>
                    <div className="form-group">
                        <label htmlFor="errorMargin" className="block text-gray-700">Error Margin (%)</label>
                        <input
                            type="number"
                            name="errorMargin"
                            value={errorMargin}
                            onChange={handleErrorMarginChange}
                            className="w-full p-2 border border-gray-300 rounded mt-1"
                        />
                        <p className="text-sm text-gray-500 mt-1">Recommended range: 8-16%. Usually, 10% is the norm.</p>
                    </div>
                </div>
                <div className="form-group mt-4">
                    <button
                        type="submit"
                        className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                    >
                        Calculate TDEE
                    </button>
                </div>
                {tdeeNormal && tdeeAverage && (
                    <div className="mt-6">
                        <h2 className="text-xl font-semibold">Results</h2>
                        <p>Normal TDEE Range: {tdeeNormal.lower.toFixed(2)} - {tdeeNormal.upper.toFixed(2)} kcal/day - Error Margin: {errorMargin}%</p>
                        <p>Average TDEE: {tdeeAverage.toFixed(2)} kcal/day</p>
                        <button
                            onClick={saveTDEE}
                            className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300"
                        >
                            Save TDEE
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
};

export default TDEECalculator;
