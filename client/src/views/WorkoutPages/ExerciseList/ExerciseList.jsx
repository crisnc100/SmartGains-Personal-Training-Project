import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ExerciseList.module.css';

const ExerciseList = ({ bodyPart, onReturnBack }) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exercisesPerPage] = useState(25);
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        let response;
        if (bodyPart === 'Arms') {
          const upperArmsResponse = await axios.get(`http://localhost:5000/api/exercises_by_body_part?bodyPart=upper%20arms`);
          const lowerArmsResponse = await axios.get(`http://localhost:5000/api/exercises_by_body_part?bodyPart=lower%20arms`);
          response = [...upperArmsResponse.data, ...lowerArmsResponse.data];
        } else if (bodyPart === 'Legs') {
          const upperLegsResponse = await axios.get(`http://localhost:5000/api/exercises_by_body_part?bodyPart=upper%20legs`);
          const lowerLegsResponse = await axios.get(`http://localhost:5000/api/exercises_by_body_part?bodyPart=lower%20legs`);
          response = [...upperLegsResponse.data, ...lowerLegsResponse.data];
        } else if (bodyPart === 'Shoulders') {
          const neckResponse = await axios.get(`http://localhost:5000/api/exercises_by_body_part?bodyPart=neck`);
          const shouldersResponse = await axios.get(`http://localhost:5000/api/exercises_by_body_part?bodyPart=shoulders`);
          response = [...neckResponse.data, ...shouldersResponse.data];
        } else {
          const singleResponse = await axios.get(`http://localhost:5000/api/exercises_by_body_part?bodyPart=${bodyPart}`);
          response = singleResponse.data;
        }

        console.log('API Response:', response);
        if (Array.isArray(response)) {
          setExercises(response);
        } else {
          setError('Unexpected data format');
          console.error('Unexpected data format:', response);
        }
      } catch (error) {
        setError('Error fetching exercises');
        console.error('Error fetching exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [bodyPart]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTitleClick = (exerciseId) => {
    setExpandedExerciseId(prevId => (prevId === exerciseId ? null : exerciseId));
  };

  const filteredExercises = Array.isArray(exercises)
    ? exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);

  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      <button className={styles.returnButton} onClick={onReturnBack}>Return Back</button>
      <input
        type="text"
        placeholder="Search exercises"
        value={searchTerm}
        onChange={handleSearch}
        className={styles.searchInput}
      />
      <ul className={styles.exerciseList}>
        {currentExercises.map(exercise => (
          <li key={exercise.id} className={styles.exerciseItem}>
            <h2
              className={styles.exerciseTitle}
              onClick={() => handleTitleClick(exercise.id)}
            >
              {capitalizeWords(exercise.name)}
            </h2>
            <p><strong>Equipment:</strong> {capitalizeWords(exercise.equipment)}</p>
            <p><strong>Target Muscle:</strong> {capitalizeWords(exercise.target_muscle)}</p>
            {expandedExerciseId === exercise.id && (
              <div className={styles.exerciseDetails}>
                <p><strong>Secondary Muscles:</strong> {capitalizeWords(exercise.secondary_muscles)} </p>
                <p><strong>Instructions:</strong> {exercise.instructions}</p>
                <div className={styles.gifContainer}>
                  <img src={exercise.gif_url} alt={exercise.name} />
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className={styles.pagination}>
        {[...Array(totalPages).keys()].map(number => (
          <button key={number + 1} onClick={() => paginate(number + 1)}>
            {number + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExerciseList;
