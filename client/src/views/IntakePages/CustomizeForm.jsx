import React, { useState, useEffect } from 'react';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import axios from 'axios';

const CustomizeForm = () => {
  const [allQuestions, setAllQuestions] = useState([]);
  const [currentQuestions, setCurrentQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCurrentQuestions, setShowCurrentQuestions] = useState(true);

  useEffect(() => {
    fetchAllQuestions();
    fetchCurrentQuestions();
  }, []);

  const fetchAllQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/get_global_questions');
      setAllQuestions(response.data);
      setCategories(['All', ...new Set(response.data.map(q => q.category))]);
    } catch (error) {
      console.error('Error fetching all questions:', error);
    }
  };

  const fetchCurrentQuestions = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/get_user_default_questions');
      setCurrentQuestions(response.data);
    } catch (error) {
      console.error('Error fetching current questions:', error);
    }
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) return;

    // Moving within the same list
    if (source.droppableId === destination.droppableId) {
      const items = Array.from(
        source.droppableId === 'all-questions' ? allQuestions : currentQuestions
      );
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      if (source.droppableId === 'all-questions') {
        setAllQuestions(items);
      } else {
        setCurrentQuestions(items);
      }
    } else {
      // Moving between lists
      const sourceItems = Array.from(
        source.droppableId === 'all-questions' ? allQuestions : currentQuestions
      );
      const destinationItems = Array.from(
        destination.droppableId === 'all-questions' ? allQuestions : currentQuestions
      );
      const [movedItem] = sourceItems.splice(source.index, 1);
      destinationItems.splice(destination.index, 0, movedItem);

      if (source.droppableId === 'all-questions') {
        setAllQuestions(sourceItems);
        setCurrentQuestions(destinationItems);
      } else {
        setAllQuestions(destinationItems);
        setCurrentQuestions(sourceItems);
      }
    }
  };

  // Filter the questions that are not in the current intake list
  const filteredQuestions = selectedCategory === 'All'
    ? allQuestions.filter(q => !currentQuestions.some(cq => cq.id === q.id))
    : allQuestions.filter(question => 
        question.category === selectedCategory &&
        !currentQuestions.some(cq => cq.id === question.id)
      );

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
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
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
                                setAllQuestions([...allQuestions, removedQuestion]);
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
    </div>
  );
};

export default CustomizeForm;
