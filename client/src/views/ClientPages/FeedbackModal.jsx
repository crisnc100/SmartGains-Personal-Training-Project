import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';

const FeedbackModal = ({ planId, onClose }) => {
    const [rating, setRating] = useState("");
    const { clientId } = useParams();
    const [comments, setComments] = useState("");
    const user = useUser();

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Submitting feedback:", { planId, trainerId: user.id, clientId, rating, comments });

        try {
            const response = await axios.post(`http://localhost:5000/api/submit_feedback`, {
                plan_id: planId,
                trainer_id: user.id,
                client_id: clientId,
                rating: rating,
                comments: comments
            }, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Feedback submission response:", response.data);
            alert('Thank you for your feedback!');
            onClose();
        } catch (error) {
            if (error.response) {
                console.error("Error data:", error.response.data);
                console.error("Error status:", error.response.status);
                console.error("Error headers:", error.response.headers);
            } else if (error.request) {
                // The request was made but no response was received
                console.error("No response received:", error.request);
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error("Error message:", error.message);
            }
            console.error("Config error:", error.config);
            alert('Failed to submit feedback. Please try again.');
        }
    };

    return (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-700 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg">
                <h2 className="text-xl font-bold mb-4">Rate This Plan</h2>
                <form onSubmit={handleSubmit}>
                    <label>Rating (1-10):
                        <select value={rating} onChange={e => setRating(e.target.value)}>
                            {Array.from({ length: 10 }, (_, i) => (
                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                            ))}
                        </select>
                    </label>
                    <div className="mt-4">
                        <textarea
                            value={comments}
                            onChange={e => setComments(e.target.value)}
                            rows="3"
                            required
                            placeholder="Add any comments here..."
                            className="w-full p-2 border rounded"
                        />
                    </div>
                    <div className="flex justify-between items-center mt-4">
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                            Submit
                        </button>
                        <button onClick={onClose} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Close
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
