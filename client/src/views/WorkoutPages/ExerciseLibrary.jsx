import React, { useState, useEffect } from 'react';
import BodyPartSlideShow from './BodyPartSlideShow/BodyPartSlideShow';
import ExerciseList from './ExerciseList/ExerciseList';
import axios from 'axios';

const ExerciseLibrary = () => {
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    const initializeExercises = async () => {
      try {
        await axios.get('http://localhost:5000/api/load_all_exercises');
      } catch (error) {
        console.error('Error loading exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeExercises();
  }, []);

  const handleSelectBodyPart = (bodyPart) => {
    setSelectedBodyPart(bodyPart);
  };

  const handleReturnBack = () => {
    setSelectedBodyPart(null);
  };

  return (
    <div style={{color: 'black'}}>
      <h1 style={{textAlign: 'center', fontSize: '35px'}}>Exercise Library</h1>
      {selectedBodyPart ? (
        <ExerciseList bodyPart={selectedBodyPart} onReturnBack={handleReturnBack} />
      ) : (
        <BodyPartSlideShow onSelectBodyPart={handleSelectBodyPart} />
      )}
    </div>
  );
};

export default ExerciseLibrary;
