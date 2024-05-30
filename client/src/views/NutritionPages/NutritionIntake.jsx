import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const NutritionIntake = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [relatableData, setRelatableData] = useState({});
    const [nutritionForm, setNutritionForm] = useState({
        client_id: clientId,
        height: "",
        weight: "",
        dob: "",
        gender: "",
        bodyfat_est: "",
        health_conditions: "",
        allergies: "",
        current_diet: "",
        dietary_preferences: "",
        favorite_foods: "",
        disliked_foods: "",
        meal_preferences: "",
        meal_snack_preference: "",
        meal_prep_habits: "",
        hydration: "",
        current_cheat_meals: "",
        common_cravings: "",
        specific_days_indulgence: "",
        nutritional_goals: "",
        dieting_challenges: "",
        typical_work_schedule: "",
        activity_level_neat: "",
        activity_level_eat: "",
        exercise_days_per_week: "",
        gym_duration: "",
        additional_notes: ""
    });

    const [clientName, setClientName] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:5000/api/get_relatable_nutrition_data/${clientId}`, { withCredentials: true })
            .then(response => {
                const { client_data, consultation_data, history_data } = response.data;
                setRelatableData(response.data);
                setClientName(`${client_data.first_name} ${client_data.last_name}`);
                setNutritionForm(prevForm => ({
                    ...prevForm,
                    ...client_data,
                    dob: formatDate(client_data.dob),
                    ...consultation_data,
                    ...history_data,
                }));
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data');
                setLoading(false);
            });
    }, [clientId]);

    const validateForm = () => {
        let tempErrors = {};
        let isValid = true;

        const requiredFields = [
            'height', 'weight', 'dob', 'gender', 'bodyfat_est', 'health_conditions', 'allergies', 'current_diet',
            'dietary_preferences', 'favorite_foods', 'disliked_foods', 'meal_preferences', 'meal_snack_preference',
            'meal_prep_habits', 'hydration', 'current_cheat_meals', 'common_cravings', 'specific_days_indulgence',
            'nutritional_goals', 'dieting_challenges', 'typical_work_schedule', 'activity_level_neat',
            'activity_level_eat', 'exercise_days_per_week', 'gym_duration'
        ];

        requiredFields.forEach(field => {
            if (field in nutritionForm) {
                const value = nutritionForm[field];
                if (typeof value !== 'string' || !value.trim()) {
                    tempErrors[field] = 'This field is required';
                    isValid = false;
                }
            }
        });

        setErrors(tempErrors);
        return isValid;
    };
    const handleInputChange = (event) => {
        setNutritionForm({
            ...nutritionForm,
            [event.target.name]: event.target.value
        });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            console.log('Validation failed', errors);
            return;
        }

        try {
            console.log("Sending data:", nutritionForm);
            const res = await axios.post('http://localhost:5000/api/add_nutrition_form', nutritionForm, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            console.log("Response Data:", res.data);
            navigate('tdee-calculator');
        } catch (err) {
            console.error("Submission error:", err);
            if (err.response) {
                console.error("Error response data:", err.response.data);
                console.error("Error status:", err.response.status);
                setErrors(prevErrors => ({
                    ...prevErrors,
                    ...err.response.data.errors,
                }));
            } else {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    general: 'An unexpected error occurred. Please try again.'
                }));
            }
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg" style={{ color: 'black' }}>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Client: {clientName}</h2>
                <button onClick={() => navigate(-1)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
                    Return Back
                </button>
            </div>
            <h1 className="text-3xl font-bold mb-4 text-center">Nutrition Intake Form</h1>
            <form onSubmit={submitHandler}>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Basic Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label htmlFor="height" className="block text-gray-700">Height</label>
                                <input
                                    type="text"
                                    name="height"
                                    value={nutritionForm.height}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.height && <p className="text-red-500 text-sm">{errors.height}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="weight" className="block text-gray-700">Weight</label>
                                <input
                                    type="text"
                                    name="weight"
                                    value={nutritionForm.weight}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="dob" className="block text-gray-700">Date of Birth:</label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={nutritionForm.dob}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.dob && <p className="text-red-500 text-sm">{errors.dob}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="gender" className="block text-gray-700">Gender</label>
                                <select
                                    name="gender"
                                    value={nutritionForm.gender}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-sm">{errors.gender}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="bodyfat_est" className="block text-gray-700">Body Fat Estimation</label>
                                <input
                                    type="text"
                                    name="bodyfat_est"
                                    value={nutritionForm.bodyfat_est}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.bodyfat_est && <p className="text-red-500 text-sm">{errors.bodyfat_est}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Health Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label htmlFor="health_conditions" className="block text-gray-700">Please list any existing health conditions:</label>
                                <input
                                    type="text"
                                    name="health_conditions"
                                    value={nutritionForm.existing_conditions}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.health_conditions && <p className="text-red-500 text-sm">{errors.health_conditions}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="allergies" className="block text-gray-700">Do you have any allergies?</label>
                                <input
                                    type="text"
                                    name="allergies"
                                    value={nutritionForm.allergies}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.allergies && <p className="text-red-500 text-sm">{errors.allergies}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Dietary Preferences</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label htmlFor="current_diet" className="block text-gray-700">Describe your current diet:</label>
                                <textarea
                                    name="current_diet"
                                    value={nutritionForm.diet_description}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.current_diet && <p className="text-red-500 text-sm">{errors.current_diet}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="dietary_preferences" className="block text-gray-700">What are your dietary preferences? (Keto, Paleo,)</label>
                                <input
                                    type="text"
                                    name="dietary_preferences"
                                    value={nutritionForm.dietary_preferences}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.dietary_preferences && <p className="text-red-500 text-sm">{errors.dietary_preferences}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="favorite_foods" className="block text-gray-700">What are your favorite foods?</label>
                                <textarea
                                    name="favorite_foods"
                                    value={nutritionForm.favorite_foods}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.favorite_foods && <p className="text-red-500 text-sm">{errors.favorite_foods}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="disliked_foods" className="block text-gray-700">What foods do you dislike?</label>
                                <textarea
                                    name="disliked_foods"
                                    value={nutritionForm.disliked_foods}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.disliked_foods && <p className="text-red-500 text-sm">{errors.disliked_foods}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="meal_preferences" className="block text-gray-700">Do you prefer a consistent meal plan or a variety of foods?</label>
                                <input
                                    type="text"
                                    name="meal_preferences"
                                    value={nutritionForm.meal_preferences}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.meal_preferences && <p className="text-red-500 text-sm">{errors.meal_preferences}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="meal_snack_preference" className="block text-gray-700">How many meals or snacks do you prefer per day based on your current schedule?</label>
                                <input
                                    type="text"
                                    name="meal_snack_preference"
                                    value={nutritionForm.meal_snack_preference}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.meal_snack_preference && <p className="text-red-500 text-sm">{errors.meal_snack_preference}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Meal Preparation Habits</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label htmlFor="meal_prep_habits" className="block text-gray-700">How much time can you realistically allocate to meal preparation on a daily basis?</label>
                                <textarea
                                    name="meal_prep_habits"
                                    value={nutritionForm.meal_prep_habits}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.meal_prep_habits && <p className="text-red-500 text-sm">{errors.meal_prep_habits}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="hydration" className="block text-gray-700">How much water do you drink daily?</label>
                                <input
                                    type="text"
                                    name="hydration"
                                    value={nutritionForm.daily_water_intake}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.hydration && <p className="text-red-500 text-sm">{errors.hydration}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="current_cheat_meals" className="block text-gray-700">How often do you consume cheat meals on a weekly basis?</label>
                                <textarea
                                    name="current_cheat_meals"
                                    value={nutritionForm.current_cheat_meals}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.current_cheat_meals && <p className="text-red-500 text-sm">{errors.current_cheat_meals}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="common_cravings" className="block text-gray-700">What are your most common cravings?</label>
                                <input
                                    type="text"
                                    name="common_cravings"
                                    value={nutritionForm.common_cravings}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.common_cravings && <p className="text-red-500 text-sm">{errors.common_cravings}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="specific_days_indulgence" className="block text-gray-700">Are there specific days you'd like to indulge in drinks or have a "cheat meal"?</label>
                                <textarea
                                    name="specific_days_indulgence"
                                    value={nutritionForm.specific_days_indulgence}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.specific_days_indulgence && <p className="text-red-500 text-sm">{errors.specific_days_indulgence}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Goals and Challenges</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label htmlFor="nutritional_goals" className="block text-gray-700">What are your main goals for dieting and nutrition?</label>
                                <input
                                    type="text"
                                    name="nutritional_goals"
                                    value={nutritionForm.nutritional_goals}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.nutritional_goals && <p className="text-red-500 text-sm">{errors.nutritional_goals}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="dieting_challenges" className="block text-gray-700">What are your main challenges with dieting or nutrition?</label>
                                <textarea
                                    type="text"
                                    name="dieting_challenges"
                                    value={nutritionForm.dieting_challenges}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.dieting_challenges && <p className="text-red-500 text-sm">{errors.dieting_challenges}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Activity and Lifestyle</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-group">
                                <label htmlFor="typical_work_schedule" className="block text-gray-700">What is your typical work schedule?</label>
                                <textarea
                                    type="text"
                                    name="typical_work_schedule"
                                    value={nutritionForm.daily_routine}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.typical_work_schedule && <p className="text-red-500 text-sm">{errors.typical_work_schedule}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="activity_level_neat" className="block text-gray-700">What is your typical daily activity level?</label>
                                <select
                                    name="activity_level_neat"
                                    value={nutritionForm.activity_level_neat}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                >
                                    <option value="Sedentary">Sedentary: 0-2999 steps/day</option>
                                    <option value="Light">Light: 3000 - 4999 steps/day</option>
                                    <option value="Moderate">Moderate: 5000-7499 steps/day</option>
                                    <option value="Active">Active: 7500 steps/day </option>
                                    <option value="Very_Active">Very Active: 10000 - 14999 steps/day</option>
                                    <option value="Extremely_Active">Extremely Active: 15000+ steps/day</option>
                                </select>
                                {errors.activity_level_neat && <p className="text-red-500 text-sm">{errors.activity_level_neat}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="activity_level_eat" className="block text-gray-700">What is your exercise activity level?</label>
                                <select
                                    name="activity_level_eat"
                                    value={nutritionForm.activity_level_eat}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                >
                                    <option value="None">None</option>
                                    <option value="Light">Light</option>
                                    <option value="Moderate">Moderate</option>
                                    <option value="Intense">Intense</option>
                                    <option value="Very_Intense">Very Intense</option>
                                </select>
                                {errors.activity_level_eat && <p className="text-red-500 text-sm">{errors.activity_level_eat}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="exercise_days_per_week" className="block text-gray-700">How many days per week do you exercise?</label>
                                <input
                                    type="number"
                                    name="exercise_days_per_week"
                                    value={nutritionForm.exercise_days_per_week}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.exercise_days_per_week && <p className="text-red-500 text-sm">{errors.exercise_days_per_week}</p>}
                            </div>
                            <div className="form-group">
                                <label htmlFor="gym_duration" className="block text-gray-700">How long do you usually exercise per session (in minutes)?</label>
                                <input
                                    type="number"
                                    name="gym_duration"
                                    value={nutritionForm.gym_duration}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border border-gray-300 rounded mt-1"
                                />
                                {errors.gym_duration && <p className="text-red-500 text-sm">{errors.gym_duration}</p>}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-semibold">Additional Notes</h2>
                        <div className="form-group">
                            <textarea
                                name="additional_notes"
                                value={nutritionForm.additional_notes}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded mt-1"
                            />

                        </div>
                    </div>
                </div>
                <div className="form-group mt-4">
                    <button
                        type="submit"
                        className="w-full p-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300"
                    >
                        Submit
                    </button>
                </div>
            </form>
        </div>
    );
};

export default NutritionIntake;
