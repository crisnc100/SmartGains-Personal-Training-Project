import React, { useState, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';


const getLocalStorageKey = (clientId, key) => `client_${clientId}_${key}`;

const CustomizeForm = ({ onSave }) => {
  const { clientId } = useParams();
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCurrentQuestions, setShowCurrentQuestions] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '' });


  useEffect(() => {
    // Ensure clientId is initialized early
    if (!clientId) {
      // Handle the case where clientId isn't available, maybe redirect or show a warning
      console.warn("Client ID is missing, initializing...");
    }

    const key = getLocalStorageKey(clientId, 'currentQuestions');
    let savedCurrentQuestions = JSON.parse(localStorage.getItem(key));

    if (!savedCurrentQuestions) {
      savedCurrentQuestions = [];
      localStorage.setItem(key, JSON.stringify(savedCurrentQuestions));
    }

    console.log('Current clientId:', clientId);
    console.log('Loading savedCurrentQuestions from local storage with key:', key);
    console.log('Loaded savedCurrentQuestions:', savedCurrentQuestions);

    fetchQuestions(savedCurrentQuestions);

  }, [clientId]);

  const fetchQuestions = async (savedCurrentQuestions = null) => {
    try {
        const globalResponse = await axios.get('http://localhost:5000/api/get_user_questions');
        const globalQuestions = globalResponse.data;

        let combinedQuestions = {};

        // Combine global and trainer questions
        globalQuestions.forEach((q) => {
            if (q.action === 'edit' && q.global_question_id) {
                combinedQuestions[q.global_question_id] = q; // Replace global question with trainer's edited version
            } else {
                combinedQuestions[q.id] = q; // Add global or trainer question
            }
        });

        let allQuestionsArray = Object.values(combinedQuestions);

        if (savedCurrentQuestions) {
            // Filter out questions that are already in the 'Current Intake Form'
            const filteredQuestions = allQuestionsArray.filter(q => 
                !savedCurrentQuestions.some(cq => cq.id === q.id || cq.global_question_id === q.id)
            );

            setAllQuestions(filteredQuestions);
            setCurrentQuestions(savedCurrentQuestions);
        } else {
            setCurrentQuestions([]);
        }

        const allCategories = ['All', ...new Set(allQuestionsArray.map(q => q.category))];
        setCategories(allCategories);

    } catch (error) {
        console.error('Error fetching questions:', error);
    }
};




  useEffect(() => {
    const key = getLocalStorageKey(clientId, 'currentQuestions');
    const savedCurrentQuestions = JSON.parse(localStorage.getItem(key));
    console.log('Current clientId:', clientId);
    console.log('Loading savedCurrentQuestions from local storage with key:', key);
    console.log('Loaded savedCurrentQuestions:', savedCurrentQuestions);

    if (savedCurrentQuestions) {
      fetchQuestions(savedCurrentQuestions);
    } else {
      console.log('No savedCurrentQuestions found, fetching default questions.');
      fetchQuestions();
    }
  }, [clientId]);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceIndex = source.index;
    const destIndex = destination.index;
    const sourceDroppable = source.droppableId;
    const destDroppable = destination.droppableId;

    const itemId = parseInt(draggableId.split('-')[1]);

    let newCurrentQuestions = Array.from(currentQuestions);
    let newAllQuestions = Array.from(allQuestions);

    if (sourceDroppable === 'all-questions' && destDroppable === 'current-questions') {
      const [movedItem] = newAllQuestions.splice(sourceIndex, 1);
      newCurrentQuestions.splice(destIndex, 0, movedItem);
    } else if (sourceDroppable === 'current-questions' && destDroppable === 'all-questions') {
      const [movedItem] = newCurrentQuestions.splice(sourceIndex, 1);
      newAllQuestions.splice(destIndex, 0, movedItem);
    } else if (sourceDroppable === 'current-questions' && destDroppable === 'current-questions') {
      const [reorderedItem] = newCurrentQuestions.splice(sourceIndex, 1);
      newCurrentQuestions.splice(destIndex, 0, reorderedItem);
    }

    setAllQuestions(newAllQuestions);
    setCurrentQuestions(newCurrentQuestions);
    localStorage.setItem(getLocalStorageKey(clientId, 'currentQuestions'), JSON.stringify(newCurrentQuestions));
  };

  const filteredQuestions = selectedCategory === 'All'
    ? allQuestions
    : allQuestions.filter(question => question.category === selectedCategory);

  // Log filtered questions to check if trainer-added questions are included
  //console.log('Filtered Questions:', filteredQuestions);


  const handleSaveChanges = () => {
    console.log('Saving current questions to local storage:', currentQuestions);
    const key = getLocalStorageKey(clientId, 'currentQuestions');
    localStorage.setItem(key, JSON.stringify(currentQuestions));

    // Update the question bank by removing questions that are already in the 'Current Intake Form'
    const updatedQuestionBank = allQuestions.filter(q =>
      !currentQuestions.some(cq => cq.id === q.id || cq.global_question_id === q.id)
    );
    setAllQuestions(updatedQuestionBank);

    setNotification({ show: true, message: 'Changes saved successfully!' });

    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };



  return (
    <div className="flex flex-col">
      <button
        className="self-center bg-green-500 text-white px-4 py-2 rounded mb-4"
        onClick={() => setShowCurrentQuestions(!showCurrentQuestions)}
      >
        {showCurrentQuestions ? 'Hide Current Intake Questions' : 'Show Current Intake Questions'}
      </button>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex">
          <div className="w-1/2 p-4 border-r">
            <h2 className="text-xl font-bold mb-4">Question Bank</h2>
            <div className="mb-4">
              <label className="mr-2">Filter by category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <Droppable droppableId="all-questions">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="max-h-96 overflow-y-auto">
                  {filteredQuestions.map((question, index) => (
                    <Draggable
                      key={`all-${question.id}-${index}`}  // Ensure unique keys by adding the index or another unique identifier
                      draggableId={`all-${question.id}`}
                      index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-2 mb-2 border rounded shadow"
                        >
                          {question.question_text}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
          {showCurrentQuestions && (
            <div className="w-1/2 p-4">
              <h2 className="text-xl font-bold mb-4">Current Intake Questions</h2>
              <Droppable droppableId="current-questions">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="max-h-96 overflow-y-auto">
                    {currentQuestions.map((question, index) => (
                      <Draggable
                        key={`current-${question.id}-${index}`}  // Ensure unique keys by adding the index or another unique identifier
                        draggableId={`current-${question.id}`}
                        index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white p-2 mb-2 border rounded shadow flex justify-between items-center"
                          >
                            <span>{question.question_text}</span>
                            <button
                              className="bg-red-500 text-white px-2 py-1 rounded"
                              onClick={() => {
                                const newCurrentQuestions = Array.from(currentQuestions);
                                const [removedQuestion] = newCurrentQuestions.splice(index, 1);
                                setCurrentQuestions(newCurrentQuestions);
                                setAllQuestions(prevAllQuestions => [...prevAllQuestions, removedQuestion]);
                                localStorage.setItem(getLocalStorageKey(clientId, 'currentQuestions'), JSON.stringify(newCurrentQuestions));
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )}
        </div>
      </DragDropContext>
      <button
        className="self-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4"
        onClick={handleSaveChanges}
      >
        Save Changes
      </button>
      {notification.show && (
        <div className="self-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mt-4">
          {notification.message}
        </div>
      )}
    </div>
  );

};

export default CustomizeForm;
