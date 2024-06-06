import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './ExerciseList.module.css';
import { FaFilter, FaPlus, FaTrashAlt, FaCheckCircle } from 'react-icons/fa';
import AddExerciseModal from '../AddExerciseModal';
import { useUser } from '../../../contexts/UserContext';
import { Tooltip } from 'react-tooltip';


axios.defaults.withCredentials = true;

const equipmentCategories = {
  'Bodyweight and Assistive Devices': ['body weight', 'assisted'],
  'Free Weights': ['dumbbell', 'barbell', 'ez barbell', 'kettlebell', 'olympic barbell', 'weighted', 'trap bar'],
  'Machines and Large Equipment': ['leverage machine', 'cable', 'sled machine', 'smith machine', 'upper body ergometer', 'stationary bike', 'elliptical machine', 'step mill machine', 'skierg machine'],
  'Balls and Balance Tools': ['medicine balls', 'stability ball', 'bosu ball'],
  'Bands and Ropes': ['band', 'resistance bands', 'rope'],
  'Miscellaneous': ['roller', 'wheel roller', 'hammer', 'tire']
};

const getEquipmentCategory = (equipment) => {
  for (const category in equipmentCategories) {
    if (equipmentCategories[category].includes(equipment.toLowerCase())) {
      return category;
    }
  }
  return 'Uncategorized';
};

const ExerciseList = ({ bodyPart, onReturnBack }) => {
  const { user } = useUser();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exercisesPerPage] = useState(25);
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const filterRef = useRef(null);
  const containerRef = useRef(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [favoriteExercises, setFavoriteExercises] = useState([]);

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

  useEffect(() => {
    fetchFavoriteExercises();
  }, []);

  const fetchFavoriteExercises = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/get_favorite_exercises', { withCredentials: true });
      if (response.data) {
        setFavoriteExercises(response.data);
      } else {
        setError('Data not found');
      }
    } catch (error) {
      setError(error.response ? error.response.data.error : 'Something went wrong');
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target) && !containerRef.current.contains(event.target)) {
        setIsFilterVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTitleClick = (exerciseId) => {
    setExpandedExerciseId(prevId => (prevId === exerciseId ? null : exerciseId));
  };

  const openExerciseModal = () => setShowExerciseModal(true);
  const closeExerciseModal = () => setShowExerciseModal(false);

  const handleCategoryChange = (event) => {
    const { value, checked } = event.target;
    setSelectedCategories(prevSelectedCategories =>
      checked ? [...prevSelectedCategories, value] : prevSelectedCategories.filter(category => category !== value)
    );
  };

  const addExerciseToCustomList = async (exerciseId) => {
    try {
      const exercise = exercises.find(e => e.id === exerciseId);
      const response = await axios.post('http://localhost:5000/api/add_favorite_exercise', {
        exercise_type: 'library',
        exercise_id: exercise.id,
        custom_exercise_id: null
      });

      if (response.status === 201) {
        setFavoriteExercises([...favoriteExercises, { id: response.data.id, exercise_id: exercise.id }]);
        setSuccessMessage('Exercise added to your list!');
        setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
      }
    } catch (error) {
      console.error('Error adding exercise to custom list:', error);
      alert('Failed to add exercise to your list.');
    }
  };

  const removeExerciseFromCustomList = async (exerciseId) => {
    try {
      const favoriteExercise = favoriteExercises.find(fe => fe.exercise_id === exerciseId);
      const response = await axios.delete(`http://localhost:5000/api/remove_favorite_exercise/${favoriteExercise.id}`);

      if (response.status === 200) {
        setFavoriteExercises(favoriteExercises.filter(fe => fe.exercise_id !== exerciseId));
        setSuccessMessage('Exercise removed from your list.');
        setTimeout(() => setSuccessMessage(''), 3000); // Clear message after 3 seconds
      }
    } catch (error) {
      console.error('Error removing exercise from custom list:', error);
      alert('Failed to remove exercise from your favorites.');
    }
  };

  const isFavorite = (exerciseId) => {
    return favoriteExercises.some(fe => fe.exercise_id === exerciseId);
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategories.length === 0 || selectedCategories.includes(getEquipmentCategory(exercise.equipment)))
  );

  const capitalizeWords = (str) => {
    return str.replace(/\b\w/g, char => char.toUpperCase());
  };

  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);

  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loading) return <p style={{ color: 'blue' }}>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      {successMessage && (
        <div className={styles.successMessage}>
          <FaCheckCircle className="icon" />  {successMessage}
        </div>
      )}
      <div className="flex justify-end space-x-2 mt-4">
        <button onClick={onReturnBack} className="px-4 py-2 mb-4 text-white bg-blue-600 hover:bg-blue-900 transition-colors duration-300 ease-in-out rounded">
          Return Back
        </button>
      </div>
      <div className="container" ref={containerRef}>
        <div className="flex items-center mb-4">
          <button
            className={`p-2 border border-gray-300 rounded hover:bg-gray-100 relative mr-2 ${styles.filterButton}`}
            onClick={() => setIsFilterVisible(!isFilterVisible)}
          >
            <FaFilter className={`text-blue-600 ${styles.filterIcon}`} />
            <span className={`${styles.tooltip}`}>
              Exercise Filter
            </span>
          </button>
          <input
            type="text"
            placeholder="Search exercises"
            value={searchTerm}
            onChange={handleSearch}
            className="border border-gray-500 rounded py-2 px-4 flex-grow"
          />
        </div>
      </div>
      {isFilterVisible && (
        <div ref={filterRef} className={`${styles.filterContainer} absolute z-10 bg-white border border-gray-300 rounded p-4 mb-4`}>
          <p className="font-semibold mb-2">Filter by Equipment Categories:</p>
          <div className="grid grid-cols-1 gap-2">
            {Object.keys(equipmentCategories).map(category => (
              <label key={category} className="flex items-center">
                <input
                  type="checkbox"
                  value={category}
                  checked={selectedCategories.includes(category)}
                  onChange={handleCategoryChange}
                  className="mr-2"
                />
                {category}
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={openExerciseModal}
          className="px-4 py-2 overflow-hidden text-sm text-green-500 border border-green-500 hover:bg-green-500 hover:text-white rounded-md cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none"
        >
          Add Exercise
        </button>
        {showExerciseModal && <AddExerciseModal onClose={closeExerciseModal} />}
      </div>
      <ul className={styles.exerciseList}>
        {currentExercises.map(exercise => (
          <li key={exercise.id} className={`${styles.exerciseItem} ${isFavorite(exercise.id) ? styles.favorite : ''}`}>
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
            <div className={styles.favoriteActions}>
              {isFavorite(exercise.id) ? (
                <button
                  className={styles.removeButton}
                  onClick={() => removeExerciseFromCustomList(exercise.id)}
                  data-tooltip-id={`tooltip-remove-${exercise.id}`}
                  data-tooltip-content="Remove from list"
                  key={`tooltip-remove-${exercise.id}`}  // Adding unique key
                >
                  <FaTrashAlt />
                </button>
              ) : (
                <button
                  className={styles.addButton}
                  onClick={() => addExerciseToCustomList(exercise.id)}
                  data-tooltip-id={`tooltip-add-${exercise.id}`}
                  data-tooltip-content="Add to list"
                  key={`tooltip-add-${exercise.id}`}  // Adding unique key
                >
                  <FaPlus />
                </button>
              )}
              <Tooltip id={`tooltip-remove-${exercise.id}`} place="top" type="dark" effect="solid" style={{ padding: '3px 8px', fontSize: '12px' }} />
              <Tooltip id={`tooltip-add-${exercise.id}`} place="top" type="dark" effect="solid" style={{ padding: '3px 8px', fontSize: '12px' }} />
            </div>
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
