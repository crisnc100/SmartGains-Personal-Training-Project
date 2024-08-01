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
    const savedCurrentQuestions = JSON.parse(localStorage.getItem(getLocalStorageKey(clientId, 'currentQuestions')));
    if (savedCurrentQuestions) {
      fetchQuestions(savedCurrentQuestions);
    } else {
      fetchQuestions();
    }
  }, []);

  const fetchQuestions = async (savedCurrentQuestions = null) => {
    try {
      const globalResponse = await axios.get('http://localhost:5000/api/get_global_questions');
      const globalQuestions = globalResponse.data;

      if (savedCurrentQuestions) {
        const nonDefaultQuestions = globalQuestions.filter(gq => 
          !savedCurrentQuestions.some(dq => dq.id === gq.id)
        );

        setAllQuestions(nonDefaultQuestions);
        setCurrentQuestions(savedCurrentQuestions);
      } else {
        const defaultResponse = await axios.get('http://localhost:5000/api/get_user_default_questions');
        const defaultQuestions = defaultResponse.data;

        const nonDefaultQuestions = globalQuestions.filter(gq => 
          !defaultQuestions.some(dq => dq.id === gq.id)
        );

        setAllQuestions(nonDefaultQuestions);
        setCurrentQuestions(defaultQuestions);
      }

      setCategories(['All', ...new Set(globalQuestions.map(q => q.category))]);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;

    const sourceIndex = source.index;
    const destIndex = destination.index;
    const sourceDroppable = source.droppableId;
    const destDroppable = destination.droppableId;

    const itemId = parseInt(draggableId.split('-')[1]);

    if (sourceDroppable === destDroppable) {
      if (sourceDroppable === 'all-questions') {
        const items = Array.from(filteredQuestions);
        const [reorderedItem] = items.splice(sourceIndex, 1);
        items.splice(destIndex, 0, reorderedItem);
        const updatedAllQuestions = allQuestions.map(q => items.find(fq => fq.id === q.id) || q);
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
        const updatedAllQuestions = allQuestions.filter(q => q.id !== itemId);
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
    ? allQuestions
    : allQuestions.filter(question => question.category === selectedCategory);

  const handleSaveChanges = () => {
    localStorage.setItem(getLocalStorageKey(clientId, 'currentQuestions'), JSON.stringify(currentQuestions));
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
                    <Draggable key={`all-${question.id}`} draggableId={`all-${question.id}`} index={index}>
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
                      <Draggable key={`current-${question.id}`} draggableId={`current-${question.id}`} index={index}>
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

                                localStorage.setItem('currentQuestions', JSON.stringify(newCurrentQuestions));
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
