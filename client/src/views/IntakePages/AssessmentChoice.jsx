import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const AssessmentChoice = () => {
    const { clientId } = useParams();
    const navigate = useNavigate();
    const [assessments, setAssessments] = useState([]);
    const [filteredAssessments, setFilteredAssessments] = useState([]);
    const [selectedAssessments, setSelectedAssessments] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('All');
    const recommendedLimit = 6;


    useEffect(() => {
        // Fetch the list of assessments from the server
        axios.get('http://localhost:5000/api/get_all_assessments')
            .then(response => {
                setAssessments(response.data);
                setFilteredAssessments(response.data);
            })
            .catch(error => {
                console.error("There was an error fetching the assessments!", error);
            });
    }, []);

    useEffect(() => {
        // Filter assessments based on search term and selected level
        let filtered = assessments;
        if (selectedLevel !== 'All') {
            filtered = filtered.filter(assessment => assessment.level === selectedLevel);
        }
        if (searchTerm) {
            filtered = filtered.filter(assessment =>
                assessment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                assessment.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredAssessments(filtered);
    }, [searchTerm, selectedLevel, assessments]);

    const toggleSelection = (assessment) => {
        setSelectedAssessments(prevSelected => {
            if (prevSelected.includes(assessment)) {
                return prevSelected.filter(a => a !== assessment);
            } else {
                return [...prevSelected, assessment];
            }
        });
    };

    const goBack = () => {
        navigate(-1);
    };

    const handleNext = () => {
        if (selectedAssessments.length === 0) {
            alert("Please select at least one assessment.");
            return;
        }
        navigate(`assessment-form`, { state: { selectedAssessments } });
    };


    return (
        <div>
            <div className="flex justify-end space-x-2 mt-2">
                <button onClick={goBack} className="px-4 py-2 text-white bg-gray-400 hover:bg-gray-600 transition-colors duration-300 ease-in-out rounded">
                    Return Back
                </button>
            </div>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-4">Select Assessments</h1>
                <div className="mb-4 flex flex-col sm:flex-row justify-between">
                    <input
                        type="text"
                        className="p-2 border rounded w-full sm:w-1/3 mb-2 sm:mb-0"
                        placeholder="Search assessments..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="p-2 border rounded w-full sm:w-1/3"
                        value={selectedLevel}
                        onChange={e => setSelectedLevel(e.target.value)}
                    >
                        <option value="All">All Levels</option>
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredAssessments.map(assessment => (
                        <div
                            key={assessment.id}
                            className={`p-4 border rounded cursor-pointer ${selectedAssessments.includes(assessment) ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}
                            onClick={() => toggleSelection(assessment)}
                        >
                            <h2 className="text-xl font-semibold">{assessment.name}</h2>
                            <p>{assessment.description}</p>
                        </div>
                    ))}
                </div>
                {selectedAssessments.length > recommendedLimit && (
                    <div className="mt-4 p-4 bg-yellow-200 text-yellow-800 rounded">
                        Warning: You have selected more than {recommendedLimit} assessments. This might be overwhelming for the client.
                    </div>
                )}
                <button
                    className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700"
                    onClick={handleNext}
                >
                    Next
                </button>
            </div>
        </div>
    );
}

export default AssessmentChoice;
