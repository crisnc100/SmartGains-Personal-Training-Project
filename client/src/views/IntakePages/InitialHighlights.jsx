import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { format, differenceInYears } from 'date-fns';

const calculateAge = (dob) => {
    if (!dob) return null;
    return differenceInYears(new Date(), new Date(dob));
};

const InitialHighlights = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [allIntakeData, setAllIntakeData] = useState({});
    const [assessmentNames, setAssessmentNames] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/view_exercise_highlights/${clientId}`);
                setAllIntakeData(response.data);
                const assessmentsResponse = await axios.get('http://localhost:5000/api/get_all_assessments');
                const assessments = assessmentsResponse.data;
                const assessmentNameMap = {};
                assessments.forEach(assessment => {
                    assessmentNameMap[assessment.id] = assessment.name;
                });
                setAssessmentNames(assessmentNameMap);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();
    }, [clientId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const handleContinue = () => {
        navigate(`/trainer_dashboard/current_client/${clientId}/choose-prompt`);
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };


    return (
        <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg">
            <div className='flex justify-end space-x-2 mt-4'>
                <button onClick={() => navigate(`/trainer_dashboard/all_clients/${clientId}/current-client`)} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
                    Return to Client
                </button>
            </div>
            <h1 style={{ color: 'black', fontSize: '35px' }} className="text-3xl font-bold mb-6 text-center">Client Highlights</h1>
            {allIntakeData.client_data && (
                <div className="mb-6 p-4 bg-gray-100 rounded-md shadow" style={{ color: 'black' }}>
                    <h2 className="text-2xl font-semibold mb-2" style={{ fontSize: '26px' }}>Client Information</h2>
                    <p className="mb-1"><span style={{ fontWeight: 'bold' }}>Name:</span> {allIntakeData.client_data.first_name} {allIntakeData.client_data.last_name}</p>
                    <p className="mb-1"><span style={{ fontWeight: 'bold' }}>Date of Birth:</span> {format(new Date(allIntakeData.client_data.dob), 'MMMM d, yyyy')} ({calculateAge(allIntakeData.client_data.dob)} years old)</p>
                    <p className="mb-1"><span style={{ fontWeight: 'bold' }}>Gender:</span> {allIntakeData.client_data.gender}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Contact:</span> {allIntakeData.client_data.email}, {allIntakeData.client_data.phone_number}</p>
                </div>
            )}
            {allIntakeData.consultation_data && (
                <div className="mb-6 p-4 bg-gray-100 rounded-md shadow" style={{ color: 'black' }}>
                    <h2 className="text-2xl font-semibold mb-2" style={{ fontSize: '26px' }}>Fitness Goals and Exercise Experience</h2>
                    <p><span style={{ fontWeight: 'bold' }}>Fitness Goals:</span> {allIntakeData.consultation_data.fitness_goals}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Prior Exercise Programs:</span> {allIntakeData.consultation_data.prior_exercise_programs}</p>
                </div>
            )}
            {allIntakeData.consultation_data && (
                <div className="mb-6 p-4 bg-gray-100 rounded-md shadow" style={{ color: 'black' }}>
                    <h2 className="text-2xl font-semibold mb-2" style={{ fontSize: '26px' }}>Diet and Lifestyle Factors</h2>
                    <p><span style={{ fontWeight: 'bold' }}>Existing Conditions:</span> {allIntakeData.history_data.existing_conditions}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Medications:</span> {allIntakeData.history_data.medications}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Diet Description:</span> {allIntakeData.consultation_data.diet_description}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Processed Food Consumption:</span> {allIntakeData.consultation_data.processed_food_consumption}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Daily Water Intake:</span> {allIntakeData.consultation_data.daily_water_intake}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Daily Routine:</span> {allIntakeData.consultation_data.daily_routine}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Stress Level:</span> {allIntakeData.consultation_data.stress_level}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Smoking/Alcohol Habits:</span> {allIntakeData.consultation_data.smoking_alcohol_habits}</p>
                    <p><span style={{ fontWeight: 'bold' }}>Hobbies:</span> {allIntakeData.consultation_data.hobbies}</p>
                </div>
            )}
            {allIntakeData.client_assessment_data && (
                <div className="mb-6 p-4 bg-gray-100 rounded-md shadow" style={{ color: 'black' }}>
                    <h2 className="text-2xl font-semibold mb-2" style={{ fontSize: '26px' }}>Assessment Data</h2>
                    {allIntakeData.client_assessment_data.map((assessment, index) => (
                        <div key={index} className="mb-4 p-4 bg-white rounded-md shadow-md">
                            <h3 className="text-xl font-semibold mb-2">{assessmentNames[assessment.assessment_id]}</h3>
                            <ul>
                                {Object.entries(JSON.parse(assessment.input_data)).map(([key, value], idx) => (
                                    <li key={idx}><span style={{ fontWeight: 'bold' }}>{capitalizeFirstLetter(key)}:</span> {value}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
            <div className="mb-6 p-4 bg-gray-100 rounded-md shadow" style={{ color: 'black' }}>
                <h2 className="text-2xl font-semibold mb-2" style={{ fontSize: '26px' }}>Recommendations and Next Steps</h2>
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
