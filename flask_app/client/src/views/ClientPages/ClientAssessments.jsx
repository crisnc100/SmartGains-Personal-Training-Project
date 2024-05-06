import React from 'react';

const ClientAssessments = ({ flexibilityData, beginnerData, advancedData }) => {
    // Check if all assessment data is missing
    const isDataEmpty = (!flexibilityData || Object.keys(flexibilityData).length === 0) &&
                        (!beginnerData || Object.keys(beginnerData).length === 0) &&
                        (!advancedData || Object.keys(advancedData).length === 0);

    if (isDataEmpty) {
        return <div>No data is available</div>;
    }

    // Helper function to render assessment details
    const renderAssessment = (data, title, properties) => {
        if (!data || Object.keys(data).length === 0) {
            return null;  // Return null if specific data type is missing, showing nothing
        }

        return (
            <div>
                <h3 className="font-bold mb-2" style={{fontSize: '22px'}}>{title}</h3>
                {properties.map(property => (
                    <p key={property.key} className="mb-3">
                        <strong>{property.label}:</strong> {data[property.key]}
                    </p>
                ))}
            </div>
        );
    };

    // Define properties to display for each type of data
    const flexibilityProperties = [
        { key: 'joint_mobility', label: 'Joint Mobility' },
        { key: 'lower_body_flexibility', label: 'Lower Body Flexibility' },
        { key: 'shoulder_flexibility', label: 'Shoulder Flexibility' }
    ];

    const advancedProperties = [
        { key: 'advanced_technique', label: 'Advanced Technique' },
        { key: 'circuit', label: 'Circuit Performance' },
        { key: 'moderate_cardio', label: 'Moderate Cardio' },
        { key: 'strength_endurance', label: 'Strength Endurance' },
        { key: 'strength_max', label: 'Maximal Strength' }
    ];

    const beginnerProperties = [
        { key: 'basic_technique', label: 'Movement Technique' },
        { key: 'chair_sit_to_stand', label: 'Chair Sit-To-Stand Test'},
        { key: 'arm_curl', label: 'Arm Curl Test'},
        { key: 'balance_test_results', label: 'Balance Test Results'},
        { key: 'cardio_test', label: 'Cardio Results'}
    ];
    return (
        <div>
            {renderAssessment(flexibilityData, "Initial Flexibility Assessment", flexibilityProperties)}
            {renderAssessment(beginnerData, "Initial Performance Assessment - Beginner", beginnerProperties)}
            {renderAssessment(advancedData, "Initial Performance Assessment - Advanced", advancedProperties)}
        </div>
    );
};

export default ClientAssessments;
