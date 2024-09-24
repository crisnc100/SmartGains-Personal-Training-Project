import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { format } from 'date-fns';

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

const ClientAssessments = ({ clientAssessmentData }) => {
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

    const renderAssessment = (assessment) => {
        const inputData = JSON.parse(assessment.input_data);

        return (
            <div key={assessment.id} className="mb-2 p-4 border rounded-md shadow-md bg-white">
                <h4 className="font-semibold mb-2 text-lg">{assessment.assessment_name}</h4>
                {Object.entries(inputData).map(([key, value], index) => (
                    <p key={index} className="mb-1 text-gray-700">
                        <strong>{capitalizeFirstLetter(key.replace(/_/g, ' '))}:</strong> {value}
                    </p>
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
                            {assessments.map(renderAssessment)}
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
