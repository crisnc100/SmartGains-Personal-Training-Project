import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { format } from 'date-fns';
import styles from './CurrentClient/CurrentClient.module.css'

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const groupAssessmentsByDate = (assessments) => {
    return assessments.reduce((acc, assessment) => {
        const date = format(new Date(assessment.created_at), 'MM-dd-yyyy');
        if (!acc[date]) acc[date] = [];
        acc[date].push(assessment);
        return acc;
    }, {});
};

const ClientAssessments = ({ clientAssessmentData, isEditMode, handleInputChange, handleDeleteAssessment }) => {
    const navigate = useNavigate();
    const [expandedDate, setExpandedDate] = useState(null);

    const isDataEmpty = (!clientAssessmentData || clientAssessmentData.length === 0);

    if (isDataEmpty) {
        return (
            <div>
                <div className="text-center">
                    <p className="text-gray-600">No data is available</p>
                    <NavLink
                        to='assessment-choice'
                        className="inline-flex items-center px-4 py-2 bg-blue-500 text-white font-bold rounded-md shadow hover:bg-blue-700 transition duration-300"
                    >
                        Add Assessments
                    </NavLink>
                </div>
            </div>
        );
    }

    const toggleExpand = (date) => {
        setExpandedDate(prevDate => (prevDate === date ? null : date));
    };

    const groupedAssessments = groupAssessmentsByDate(clientAssessmentData);

    const renderAssessment = (assessment, assessmentIndex) => {
        const inputData = JSON.parse(assessment.input_data);

        const handleAssessmentInputChange = (event, field) => {
            handleInputChange(event, 'client_assessment_data', assessmentIndex, field);
        };
        

        return (
            <div key={assessment.id} className="mb-2 p-4 border rounded-md shadow-md bg-white">
                <h4 className="font-semibold mb-2 text-lg">{assessment.assessment_name}</h4>
                {/* Render assessment fields */}
                {Object.entries(inputData).map(([key, value], index) => (
                    <div key={index} className="mb-1 text-gray-700">
                        <strong>{capitalizeFirstLetter(key.replace(/_/g, ' '))}:</strong>
                        {isEditMode ? (
                            <input
                                type="text"
                                value={value}
                                onChange={(event) => handleAssessmentInputChange(event, key)}
                                className={styles.editableField}
                            />
                        ) : (
                            <span className="ml-2">{value}</span>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-4">
            {Object.entries(groupedAssessments).map(([date, assessments]) => (
                <div key={date} className="mb-6">
                    <div
                        className="p-4 bg-gray-100 cursor-pointer flex justify-between items-center rounded-t-md"
                        onClick={() => toggleExpand(date)}
                    >
                        <h3 className="font-bold text-lg">Assessments for {date}</h3>
                        <span className="text-sm text-blue-500">{expandedDate === date ? 'Hide' : 'Show'}</span>
                    </div>
                    {expandedDate === date && (
                        <div className="p-4 bg-white rounded-b-md shadow-md">
                            {/* Render all assessments for the selected date */}
                            {assessments.map((assessment, index) => renderAssessment(assessment, index))}

                            {/* Show "Delete" button only once for each assessment group when in edit mode */}
                            {isEditMode && (
                                <div className="flex justify-end">
                                    <button
                                        onClick={() => handleDeleteAssessment(assessments.map(a => a.id))}
                                        className="py-2 px-4 mt-4 font-semibold rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300 ease-in-out"
                                    >
                                        Delete Assessments for {date}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ))}
            <div className="mt-4 text-center">
                <NavLink
                    to='assessment-choice'
                    className="inline-flex items-center px-4 py-2 bg-blue-500 text-white font-bold rounded-md shadow hover:bg-blue-700 transition duration-300"
                >
                    Add More Assessments
                </NavLink>
            </div>
        </div>
    );
};

export default ClientAssessments;
