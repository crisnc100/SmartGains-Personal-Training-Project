import React, { useState, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import ManageQuestions from './ManageQuestions';
import Modal from 'react-modal';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};


const getLocalStorageKey = (clientId, key) => `client_${clientId}_${key}`;

const CustomizeForm = ({ onSave }) => {
  const { clientId } = useParams();
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCurrentQuestions, setShowCurrentQuestions] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [modalIsOpen, setModalIsOpen] = useState(false); // State to handle modal visibility


  const openModal = () => setModalIsOpen(true);
  const closeModal = () => setModalIsOpen(false);


  const refreshQuestions = () => {
    const key = getLocalStorageKey(clientId, 'currentQuestions');
    const savedCurrentQuestions = JSON.parse(localStorage.getItem(key));
    fetchQuestions(savedCurrentQuestions);
  };

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
        // Fetch global and trainer questions from the backend
        const response = await axios.get('http://localhost:5000/api/get_user_questions');
        const questions = response.data;

        // Create an array of all the global question IDs that have trainer-specific versions
        const trainerSpecificGlobalIds = new Set(
            questions
                .filter(q => q.question_source === 'trainer')  // Only trainer-specific questions
                .map(q => q.global_question_id)  // Get the global_question_id linked to trainer questions
        );

        // Filter out global questions that have a trainer-specific version in the allQuestions array
        let allQuestionsArray = questions.filter(question => {
            return !(question.question_source === 'global' && trainerSpecificGlobalIds.has(question.id));
        });

        // Add uniqueId for all questions
        allQuestionsArray = allQuestionsArray.map((question) => {
            const uniqueId = `${question.question_source}_${question.id}`;
            return { ...question, uniqueId }; // Append uniqueId to each question object
        });

        if (savedCurrentQuestions) {
            // Same filtering logic for current intake questions
            const savedCurrentQuestionsWithUniqueId = savedCurrentQuestions.map((question) => {
                const uniqueId = `${question.question_source}_${question.id}`;
                return { ...question, uniqueId }; // Append uniqueId to each current question
            });

            // Update the currentQuestions state and local storage
            updateCurrentQuestions(savedCurrentQuestionsWithUniqueId, allQuestionsArray);

        } else {
            // Set allQuestions and currentQuestions state if no saved current questions exist
            setAllQuestions(allQuestionsArray);
            setCurrentQuestions([]);  // Set current intake form to an empty array if no questions are saved
        }

        // Create a list of categories for filtering in the question bank
        const allCategories = ['All', ...new Set(allQuestionsArray.map(q => q.category))];
        setCategories(allCategories);

    } catch (error) {
        console.error('Error fetching questions:', error);
    }
};



const updateCurrentQuestions = (savedCurrentQuestions, allQuestionsArray) => {
  // Find if a global question has been edited and is now a trainer question
  const updatedCurrentQuestions = savedCurrentQuestions.map(question => {
      // If a trainer version exists, use that
      const trainerQuestion = allQuestionsArray.find(q => q.global_question_id === question.id && q.question_source === 'trainer');
      
      // If a trainer version exists, replace the global version
      if (trainerQuestion) {
          return { ...trainerQuestion, uniqueId: `${trainerQuestion.question_source}_${trainerQuestion.id}` };
      }

      // Otherwise, keep the current question
      return question;
  });

  // Save the updated current questions to local storage
  const key = getLocalStorageKey(clientId, 'currentQuestions');
  localStorage.setItem(key, JSON.stringify(updatedCurrentQuestions));

  // Update the state
  setCurrentQuestions(updatedCurrentQuestions);

  // Filter out the questions already present in currentQuestions from the question bank
  const updatedAllQuestions = allQuestionsArray.filter(q => {
      return !updatedCurrentQuestions.some(cq => cq.uniqueId === q.uniqueId);
  });

  // Update the question bank (allQuestions) state
  setAllQuestions(updatedAllQuestions);
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
    console.log('Drag Result:', result); // Log the drag result

    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceIndex = source.index;
    const destIndex = destination.index;
    const sourceDroppable = source.droppableId;
    const destDroppable = destination.droppableId;

    //console.log('Dragging Item:', draggableId); // Log the dragged item
    //console.log('Source:', sourceDroppable, 'Destination:', destDroppable);
    const itemUniqueId = draggableId;  // Use draggableId directly as it includes the uniqueId (e.g., "global-1" or "trainer-1")

    if (sourceDroppable === destDroppable) {
      if (sourceDroppable === 'all-questions') {
        const items = Array.from(filteredQuestions);
        const [reorderedItem] = items.splice(sourceIndex, 1);
        items.splice(destIndex, 0, reorderedItem);
        const updatedAllQuestions = allQuestions.map(q => items.find(fq => fq.uniqueId === q.uniqueId) || q);  // Compare by uniqueId
        setAllQuestions(updatedAllQuestions);
      } else if (sourceDroppable === 'current-questions') {
        const items = Array.from(currentQuestions);
        const [reorderedItem] = items.splice(sourceIndex, 1);
        items.splice(destIndex, 0, reorderedItem);
        setCurrentQuestions(items);
      }
    } else {
      let sourceItems = sourceDroppable === 'all-questions' ? Array.from(filteredQuestions) : Array.from(currentQuestions);
      let destinationItems = destDroppable === 'all-questions' ? Array.from(filteredQuestions) : Array.from(currentQuestions);

      const [movedItem] = sourceItems.splice(sourceIndex, 1);
      destinationItems.splice(destIndex, 0, movedItem);

      if (sourceDroppable === 'all-questions') {
        const updatedAllQuestions = allQuestions.filter(q => q.uniqueId !== itemUniqueId);  // Use uniqueId for comparison
        setAllQuestions(updatedAllQuestions);
        setCurrentQuestions(destinationItems);
      } else {
        setCurrentQuestions(sourceItems);
        setAllQuestions([...allQuestions, movedItem]);
      }
    }

    localStorage.setItem(getLocalStorageKey(clientId, 'currentQuestions'), JSON.stringify(currentQuestions));
  };

  const filteredQuestions = selectedCategory === 'All'
    ? allQuestions.filter(q =>
      !currentQuestions.some(cq => cq.uniqueId === q.uniqueId)) // Compare by uniqueId
    : allQuestions.filter(q =>
      q.category === selectedCategory &&
      !currentQuestions.some(cq => cq.uniqueId === q.uniqueId)); // Compare by uniqueId



  // Log filtered questions to check if trainer-added questions are included
  //console.log('Filtered Questions:', filteredQuestions);


  const handleSaveChanges = () => {
    console.log('Saving current questions to local storage:', currentQuestions);
    const key = getLocalStorageKey(clientId, 'currentQuestions');
    localStorage.setItem(key, JSON.stringify(currentQuestions));

    // Update the question bank by removing questions that are already in the 'Current Intake Form'
    const updatedQuestionBank = allQuestions.filter(q =>
      !currentQuestions.some(cq => cq.uniqueId === q.uniqueId)); // Compare by uniqueId
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
                  {filteredQuestions.map((question, index) => {
                    // Create uniqueKey and draggableId based on question source and ID
                    const uniqueKey = `${question.question_source}-${question.id}`;  // Ensure globally unique key
                    const uniqueDraggableId = `${question.question_source}-${question.id}-${index}`;  // Ensure draggableId is unique

                    return (
                      <Draggable
                        key={uniqueKey}  // Ensure unique key for React
                        draggableId={uniqueDraggableId}  // Ensure unique draggableId for DnD
                        index={index}
                      >
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
                    );
                  })}

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
                              className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700"
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
      {/* Modal for ManageQuestions */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyles}
        contentLabel="Manage Questions"
      >
        <ManageQuestions onQuestionUpdated={refreshQuestions} />
        <button onClick={closeModal} className="bg-red-500 text-white px-4 py-2 rounded mt-4">
          Close
        </button>
      </Modal>
    </div>
  );

};

export default CustomizeForm;
