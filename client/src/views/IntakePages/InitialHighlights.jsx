import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate, useParams } from 'react-router-dom';

const InitialHighlights = () => {
    const { clientId } = useParams(); 
    const navigate = useNavigate();
    const [allIntakeData, setAllIntakeData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:5000/api/view_exercise_highlights/${clientId}`)
            .then(response => {
                setAllIntakeData(response.data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data');
                setLoading(false);
            });
    }, [clientId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const displayAdvanced = allIntakeData.advanced_assessment_data && Object.keys(allIntakeData.advanced_assessment_data).length > 0;
    const assessmentData = displayAdvanced ? allIntakeData.advanced_assessment_data : allIntakeData.beginner_assessment_data;


    const handleContinue = () => {
        navigate(`/trainer_dashboard/add_client/${clientId}/additional-services/intake-form/choose-prompt`); // Navigate to performance assessments (flexibility assessment)
    };

    return (
        <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg">
            <h1 style={{ color: 'black', fontSize:'35px' }} className="text-3xl font-bold mb-6 text-center">Client Highlights</h1>
            {allIntakeData.client_data && (
                <div className="mb-6 p-4 bg-gray-100 rounded-md shadow" style={{color: 'black'}}>
                    <h2 className="text-2xl font-semibold mb-2"style={{fontSize:'26px'}}>Client Information</h2>
                    <p className="mb-1"><span style={{fontWeight:'bold'}}>Name:</span> {allIntakeData.client_data.first_name} {allIntakeData.client_data.last_name}</p>
                    <p className="mb-1"><span style={{fontWeight:'bold'}}>Age:</span> {allIntakeData.client_data.age}</p>
                    <p className="mb-1"><span style={{fontWeight:'bold'}}>Gender:</span> {allIntakeData.client_data.gender}</p>
                    <p><span style={{fontWeight:'bold'}}>Contact:</span> {allIntakeData.client_data.email}, {allIntakeData.client_data.phone_number}</p>
                </div>
            )}
            {allIntakeData.consultation_data && (
                <div className="mb-6 p-4 bg-gray-100 rounded-md shadow" style={{color: 'black'}}>
                    <h2 className="text-2xl font-semibold mb-2"style={{fontSize:'26px'}}>Fitness Goals and Exercise Experience</h2>
                    <p><span style={{fontWeight:'bold'}}>Fitness Goals:</span> {allIntakeData.consultation_data.fitness_goals}</p>
                    <p><span style={{fontWeight:'bold'}}>Prior Exercise Programs:</span> {allIntakeData.consultation_data.prior_exercise_programs}</p>
                </div>
            )}
            {allIntakeData.consultation_data && (
                <div className="mb-6 p-4 bg-gray-100 rounded-md shadow" style={{color: 'black'}}>
                    <h2 className="text-2xl font-semibold mb-2"style={{fontSize:'26px'}}>Diet and Lifestyle Factors</h2>
                    <p><span style={{fontWeight:'bold'}}>Existing Conditions:</span> {allIntakeData.history_data.existing_conditions}</p>
                    <p><span style={{fontWeight:'bold'}}>Medications:</span> {allIntakeData.history_data.medications}</p>
                    <p><span style={{fontWeight:'bold'}}>Diet Description:</span> {allIntakeData.consultation_data.diet_description}</p>
                    <p><span style={{fontWeight:'bold'}}>Processed Food Consumption: </span> {allIntakeData.consultation_data.processed_food_consumption}</p>
                    <p><span style={{fontWeight:'bold'}}>Daily Water Intake:</span> {allIntakeData.consultation_data.daily_water_intake}</p>
                    <p><span style={{fontWeight:'bold'}}>Daily Routine:</span> {allIntakeData.consultation_data.daily_routine}</p>
                    <p><span style={{fontWeight:'bold'}}>Stress Level:</span> {allIntakeData.consultation_data.stress_level}</p>
                    <p><span style={{fontWeight:'bold'}}>Smoking/Alcohol Habits:</span> {allIntakeData.consultation_data.smoking_alcohol_habits}</p>
                    <p><span style={{fontWeight:'bold'}}>Hobbies:</span> {allIntakeData.consultation_data.hobbies}</p>
                </div>
            )}
            {allIntakeData.flexibility_assessment_data && (
                <div className="mb-6 p-4 bg-gray-100 rounded-md shadow" style={{color: 'black'}}>
                    <h2 className="text-2xl font-semibold mb-2"style={{fontSize:'26px'}}>Flexibility Assessment</h2>
                    <p><span style={{fontWeight:'bold'}}>Shoulder Flexibility:</span> {allIntakeData.flexibility_assessment_data.shoulder_flexibility}</p>
                    <p><span style={{fontWeight:'bold'}}>Lower Body Flexibility:</span> {allIntakeData.flexibility_assessment_data.lower_body_flexibility}</p>
                    <p><span style={{fontWeight:'bold'}}>Joint Mobility:</span> {allIntakeData.flexibility_assessment_data.joint_mobility}</p>
                </div>
            )}
            {assessmentData && (
    <div className="mb-6 p-4 bg-gray-100 rounded-md shadow" style={{ color: 'black' }}>
        <h2 className="text-2xl font-semibold mb-2" style={{ fontSize: '26px' }}>Functional Assessment</h2>
        {displayAdvanced ? (
            <>
                <p><span style={{fontWeight:'bold'}}>Movement Techniques:</span> {assessmentData.advanced_technique}</p>
                <p><span style={{fontWeight:'bold'}}>Max Strength Results:</span> {assessmentData.strength_max}</p>
                <p><span style={{fontWeight:'bold'}}>Muscular Strength Endurance Results:</span> {assessmentData.strength_endurance}</p>
                <p><span style={{fontWeight:'bold'}}>Circuit Results:</span> {assessmentData.circuit}</p>
                <p><span style={{fontWeight:'bold'}}>Cardio Results:</span> {assessmentData.moderate_cardio}</p>
            </>
        ) : (
            <>
                <p><span style={{fontWeight:'bold'}}>Movement Techniques:</span> {assessmentData.basic_technique}</p>
                <p><span style={{fontWeight:'bold'}}>Chair Sit-to-Stand Test:</span> {assessmentData.chair_sit_to_stand}</p>
                <p><span style={{fontWeight:'bold'}}>Arm Curl Test:</span> {assessmentData.arm_curl}</p>
                <p><span style={{fontWeight:'bold'}}>Balance Test Results:</span> {assessmentData.balance_test_results}</p>
                <p><span style={{fontWeight:'bold'}}>Cardio Results:</span> {assessmentData.cardio_test}</p>
            </>
        )}
    </div>
)}

            <div className="mb-6 p-4 bg-gray-100 rounded-md shadow" style={{color: 'black'}}>
                <h2 className="text-2xl font-semibold mb-2"style={{fontSize:'26px'}}>Recommendations and Next Steps</h2>
                <p>Based on the assessment findings and client goals, we recommend the following:</p>
                <ul className="list-disc list-inside">
                    <li>Customized fitness program targeting specific areas for improvement.</li>
                    <li>Dietary adjustments to support fitness goals and overall health.</li>
                    <li>Lifestyle changes to reduce stress and improve overall well-being.</li>
                    <li>Scheduling follow-up assessments to track progress and adjust goals as needed.</li>
                </ul>
            </div>
            <div className="text-center">
                <button onClick={handleContinue} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
                    Continue to Prompt Page
                </button>
            </div>
        </div>
    );
}

export default InitialHighlights;
