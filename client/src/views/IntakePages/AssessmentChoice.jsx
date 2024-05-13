import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const AssessmentChoice = () => {
    const { clientId } = useParams(); 
    const navigate = useNavigate();

    const handleBeginner = () => {
        navigate(`/trainer_dashboard/add_client/${clientId}/additional-services/intake-form/assessment-choice/beginner`);
    };

    const handleAdvanced = () => {
        navigate(`/trainer_dashboard/add_client/${clientId}/additional-services/intake-form/assessment-choice/advanced`);
    };

    return (
        <div className="flex flex-col items-center justify-start pt-10 bg-white-100" style={{ minHeight: 'calc(100vh - 2rem)' }}>
            <h1 className="text-2xl font-bold text-center mb-4" style={{ color: 'black', fontSize:'35px' }}>Performance Assessments</h1>
            <div className="w-full max-w-4xl p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Beginner Card */}
                    <div className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-4 h-full border-2 border-black">
                        <h2 className="text-lg font-semibold text-center" style={{color: 'black', fontSize:'25px'}}>Beginner Level</h2>
                        <p className="text-gray-600 text-center mt-2">Designed for individuals new to fitness or with limited experience.</p>
                        <button 
                            onClick={handleBeginner} 
                            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            style={{ transition: 'background-color 0.3s' }}>
                            Start Beginner Assessment
                        </button>
                    </div>
                    {/* Advanced Card */}
                    <div className="flex flex-col items-center justify-center bg-white shadow-md rounded-lg p-4 h-full border-2 border-black">
                        <h2 className="text-lg font-semibold text-center" style={{color: 'black', fontSize:'25px'}}>Advanced Level</h2>
                        <p className="text-gray-600 text-center mt-2">Designed for experienced individuals seeking a challenging assessment.</p>
                        <button 
                            onClick={handleAdvanced} 
                            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                            style={{ transition: 'background-color 0.3s' }}>
                            Start Advanced Assessment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AssessmentChoice;
