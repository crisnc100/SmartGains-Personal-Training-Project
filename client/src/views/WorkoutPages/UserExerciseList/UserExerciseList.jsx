import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from './UserExerciseList.module.css';
import { FaFilter, FaTrashAlt, FaCheckCircle, FaRegEdit, FaEye, FaTimes } from 'react-icons/fa';
import AddExerciseModal from '../AddExerciseModal';
import EditExerciseModal from '../EditExerciseModal';
import { useUser } from '../../../contexts/UserContext';
import { Tooltip } from 'react-tooltip';
import Select, { components } from 'react-select';
import { Rnd } from 'react-rnd';


import Modal from 'react-modal';

axios.defaults.withCredentials = true;

const equipmentCategories = {
  'Bodyweight and Assistive Devices': ['body weight', 'assisted'],
  'Free Weights': ['dumbbell', 'barbell', 'ez barbell', 'kettlebell', 'olympic barbell', 'weighted', 'trap bar'],
  'Machines and Large Equipment': ['leverage machine', 'cable', 'sled machine', 'smith machine', 'upper body ergometer', 'stationary bike', 'elliptical machine', 'step mill machine', 'skierg machine'],
  'Balls and Balance Tools': ['medicine balls', 'stability ball', 'bosu ball'],
  'Bands and Ropes': ['band', 'resistance bands', 'rope'],
  'Miscellaneous': ['roller', 'wheel roller', 'hammer', 'tire']
};

const targetMuscles = [
  'abductors', 'abs', 'adductors', 'biceps', 'calves', 'cardiovascular system', 'delts', 'forearms',
  'glutes', 'hamstrings', 'lats', 'pectorals', 'quads', 'serratus anterior', 'spine', 'traps', 'upper back'
];

const capitalizeWords = (str) => str.replace(/\b\w/g, char => char.toUpperCase());

const getEquipmentCategory = (equipment) => {
  for (const category in equipmentCategories) {
    if (equipmentCategories[category].includes(equipment.toLowerCase())) {
      return normalizeString(category);
    }
  }
  return 'uncategorized';
};
const normalizeString = (str) => str.toLowerCase();

const UserExerciseList = ({ onReturnBack }) => {
  const { user } = useUser();
  const [favoriteExercises, setFavoriteExercises] = useState([]);
  const [customExercises, setCustomExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [exercisesPerPage] = useState(25);
  const [expandedExerciseId, setExpandedExerciseId] = useState(null);
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [selectedMuscles, setSelectedMuscles] = useState([]);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const filterRef = useRef(null);
  const containerRef = useRef(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showEditExerciseModal, setShowEditExerciseModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [showOnlyCustomExercises, setShowOnlyCustomExercises] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [tooltipVisible, setTooltipVisible] = useState(true);




  useEffect(() => {
    fetchFavoriteExercises();
    fetchCustomExercises();
  }, []);

  const fetchFavoriteExercises = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/get_favorite_exercises', { withCredentials: true });
      if (response.data) {
        const normalizedData = response.data.map(exercise => ({
          ...exercise,
          target_muscle: capitalizeWords(exercise.target_muscle),
          equipment: capitalizeWords(exercise.equipment),
        })).sort((a, b) => a.name.localeCompare(b.name));
        setFavoriteExercises(normalizedData);
      } else {
        setError('Data not found');
      }
    } catch (error) {
      setError(error.response ? error.response.data.error : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomExercises = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/get_custom_exercises', { withCredentials: true });
      if (response.data) {
        const normalizedData = response.data.map(exercise => ({
          ...exercise,
          target_muscle: capitalizeWords(exercise.target_muscle),
          equipment: capitalizeWords(exercise.equipment),
        })).sort((a, b) => a.name.localeCompare(b.name));
        setCustomExercises(normalizedData);
      } else {
        setError('Data not found');
      }
    } catch (error) {
      setError(error.response ? error.response.data.error : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (event) => setSearchTerm(event.target.value);
  const handleTitleClick = (exerciseId) => setExpandedExerciseId(prevId => (prevId === exerciseId ? null : exerciseId));
  const openAddExerciseModal = () => {
    setSelectedExercise(null);
    setShowAddExerciseModal(true);
  };

  const openEditExerciseModal = (exercise) => {
    setSelectedExercise(exercise);
    setShowEditExerciseModal(true);
  };

  const closeExerciseModal = () => {
    setSelectedExercise(null);
    setShowAddExerciseModal(false);
    setShowEditExerciseModal(false);
  };
  const handleEquipmentChange = (selectedOptions) => setSelectedEquipment(selectedOptions ? selectedOptions.map(option => option.value) : []);
  const handleMuscleChange = (selectedOptions) => setSelectedMuscles(selectedOptions ? selectedOptions.map(option => option.value) : []);
  const handleCustomExerciseToggle = () => setShowOnlyCustomExercises(!showOnlyCustomExercises);

  const updateCustomExerciseList = (updatedExercise) => {
    setCustomExercises(prevExercises =>
      prevExercises.map(exercise =>
        exercise.id === updatedExercise.id ? updatedExercise : exercise
      )
    );
  };

  const removeFavoriteExercise = async (exerciseId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/remove_favorite_exercise/${exerciseId}`);
      if (response.status === 200) {
        setFavoriteExercises(favoriteExercises.filter(exercise => exercise.id !== exerciseId));
        setSuccessMessage('Exercise removed from your list.');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error removing exercise from list:', error);
      alert('Failed to remove exercise from your favorites.');
    }
  };

  const removeCustomExercise = async (exerciseId) => {
    if (window.confirm("Are you sure you want to delete this exercise?"))
      try {
        const response = await axios.delete(`http://localhost:5000/api/remove_custom_exercise/${exerciseId}`);
        if (response.status === 200) {
          setCustomExercises(customExercises.filter(exercise => exercise.id !== exerciseId));
          setSuccessMessage('Exercise removed from your list.');
          setTimeout(() => setSuccessMessage(''), 3000);
        }
      } catch (error) {
        console.error('Error removing exercise from list:', error);
        alert('Failed to remove exercise from your list.');
      }
  };

  const filteredFavoriteExercises = favoriteExercises.filter(exercise =>
    normalizeString(exercise.name).includes(normalizeString(searchTerm)) &&
    (selectedEquipment.length === 0 || selectedEquipment.includes(getEquipmentCategory(normalizeString(exercise.equipment)))) &&
    (selectedMuscles.length === 0 || selectedMuscles.includes(normalizeString(exercise.target_muscle)))
  );

  const filteredCustomExercises = customExercises.filter(exercise =>
    normalizeString(exercise.name).includes(normalizeString(searchTerm)) &&
    (selectedEquipment.length === 0 || selectedEquipment.includes(getEquipmentCategory(normalizeString(exercise.equipment)))) &&
    (selectedMuscles.length === 0 || selectedMuscles.includes(normalizeString(exercise.target_muscle)))
  );
  const filteredExercises = showOnlyCustomExercises ? filteredCustomExercises : [...filteredFavoriteExercises, ...filteredCustomExercises];

  const indexOfLastExercise = currentPage * exercisesPerPage;
  const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
  const currentExercises = filteredExercises.slice(indexOfFirstExercise, indexOfLastExercise);
  const totalPages = Math.ceil(filteredExercises.length / exercisesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

  const customStyles = {
    control: (provided) => ({
      ...provided,
      borderColor: 'gray',
      minHeight: '40px'
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'lightgray'
    }),
    option: (provided, state) => ({
      ...provided,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: state.isFocused ? 'lightgray' : 'white',
      color: 'black'
    })
  };

  const CheckboxOption = (props) => (
    <components.Option {...props}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <input type="checkbox" checked={props.isSelected} onChange={() => null} style={{ marginRight: '10px' }} />
        <label>{props.label}</label>
      </div>
    </components.Option>
  );

  const CustomClearIndicator = (props) => (
    <components.ClearIndicator {...props}>
      <div style={{ cursor: 'pointer' }}>✕</div>
    </components.ClearIndicator>
  );

  const openVideoModal = (url) => {
    setVideoUrl(url);
    setModalIsOpen(true);
    setTooltipVisible(false);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setVideoUrl('');
    setTooltipVisible(true);
  };

  const renderVideoContent = (url) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.split('v=')[1] || url.split('youtu.be/')[1];
      const embedUrl = `https://www.youtube.com/embed/${videoId.split('&')[0]}`;
      return (
        <iframe
          width="100%"
          height="100%"
          src={embedUrl}
          title="YouTube video"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    } else if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1];
      const embedUrl = `https://player.vimeo.com/video/${videoId}`;
      return (
        <iframe
          width="100%"
          height="100%"
          src={embedUrl}
          title="Vimeo video"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    } else {
      return (
        <video controls className={styles.videoContainer}>
          <source src={url} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }
  };

  if (loading) return <p style={{ color: 'blue' }}>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.container}>
      {successMessage && (
        <div className={styles.successMessage}>
          <FaCheckCircle className="icon" /> {successMessage}
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
            <span className={`${styles.tooltip}`}>Exercise Filter</span>
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
          <p className="font-semibold mb-2">Filter by Target Muscle:</p>
          <Select
            isMulti
            options={targetMuscles.map(muscle => ({ value: normalizeString(muscle), label: capitalizeWords(muscle) }))}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={handleMuscleChange}
            value={targetMuscles.filter(muscle => selectedMuscles.includes(normalizeString(muscle))).map(muscle => ({ value: normalizeString(muscle), label: capitalizeWords(muscle) }))}
            placeholder="Select..."
            styles={customStyles}
            components={{ Option: CheckboxOption, ClearIndicator: CustomClearIndicator }}
            closeMenuOnSelect={false}
          />
          <p className="font-semibold mb-2 mt-4">Filter by Equipment:</p>
          <Select
            isMulti
            options={Object.keys(equipmentCategories).map(category => ({ value: normalizeString(category), label: category }))}
            className="basic-multi-select"
            classNamePrefix="select"
            onChange={handleEquipmentChange}
            value={Object.keys(equipmentCategories).filter(category => selectedEquipment.includes(normalizeString(category))).map(category => ({ value: normalizeString(category), label: category }))}
            placeholder="Select..."
            styles={customStyles}
            components={{ Option: CheckboxOption, ClearIndicator: CustomClearIndicator }}
            closeMenuOnSelect={false}
          />
          <div className="mt-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={showOnlyCustomExercises}
                onChange={handleCustomExerciseToggle}
              />
              <span className="ml-2">Show Only My Custom Exercises</span>
            </label>
          </div>
        </div>
      )}
      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={openAddExerciseModal}
          className="px-4 py-2 overflow-hidden text-sm text-green-500 border border-green-500 hover:bg-green-500 hover:text-white rounded-md cursor-pointer shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 ease-out focus:outline-none"
        >
          Add Exercise
        </button>
        {showAddExerciseModal && <AddExerciseModal onClose={closeExerciseModal} />}

      </div>
      <ul className={styles.exerciseList}>
        {currentExercises.map(exercise => (
          <li key={exercise.id} className={styles.exerciseItem}>
            <div className="flex items-center justify-between">
              <h2 className={styles.exerciseTitle} onClick={() => handleTitleClick(exercise.id)}>
                {capitalizeWords(exercise.name)}
              </h2>
              {customExercises.some(custom => custom.id === exercise.id) && (
                <FaEye
                  data-tooltip-id={`tooltip-icons-${exercise.id}`}
                  data-tooltip-content="View Exercise Video"
                  className={styles.previewIcon}
                  onClick={() => openVideoModal(exercise.video_url)}
                  style={{ cursor: 'pointer' }}
                />
              )}
            </div>

            <p><strong>Equipment:</strong> {capitalizeWords(exercise.equipment)}</p>
            <p><strong>Target Muscle:</strong> {capitalizeWords(exercise.target_muscle)}</p>
            {customExercises.some(custom => custom.id === exercise.id) && (
              <>
                <p><strong>Fitness Level:</strong> {exercise.fitness_level}</p>
              </>
            )}
            {expandedExerciseId === exercise.id && (
              <div className={styles.exerciseDetails}>
                <p><strong>Secondary Muscles:</strong> {capitalizeWords(exercise.secondary_muscles)}</p>
                <p><strong>Instructions:</strong> {exercise.instructions}</p>
                <div className={styles.gifContainer}>
                  <img src={exercise.gif_url} alt={exercise.name} />
                </div>
              </div>
            )}
            <div className={styles.favoriteActions}>
              {customExercises.some(custom => custom.id === exercise.id) ? (
                <>
                  <button
                    className={styles.editButton}
                    onClick={() => openEditExerciseModal(exercise)}
                    data-tooltip-id={`tooltip-icons-${exercise.id}`}
                    data-tooltip-content="Edit Exercise"
                  >
                    <FaRegEdit />
                  </button>
                  {showEditExerciseModal && <EditExerciseModal 
                  onClose={closeExerciseModal} 
                  exercise={selectedExercise} 
                  onUpdateExercise={updateCustomExerciseList}
                  />}

                  <button
                    className={styles.removeButton}
                    onClick={() => removeCustomExercise(exercise.id)}
                    data-tooltip-id={`tooltip-icons-${exercise.id}`}
                    data-tooltip-content="Remove from list"
                  >
                    <FaTrashAlt />
                  </button>
                </>
              ) : (
                <button
                  className={styles.removeButton}
                  onClick={() => removeFavoriteExercise(exercise.id)}
                  data-tooltip-id={`tooltip-icons-${exercise.id}`}
                  data-tooltip-content="Remove from list"
                >
                  <FaTrashAlt />
                </button>
              )}
              {tooltipVisible && (
                <Tooltip id={`tooltip-icons-${exercise.id}`} place="top" type="dark" effect="solid" style={{ padding: '3px 8px', fontSize: '12px' }} />
              )}
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
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className={styles.modal}
        overlayClassName={styles.overlay}
        contentLabel="Exercise Video Modal"
      >
        <Rnd
          default={{
            x: (window.innerWidth - 2000) / 2,
            y: (window.innerHeight - 1000) / 2,
            width: 800,
            height: 450,
          }}
          minWidth={300}
          minHeight={200}
          bounds="window"
          style={{ background: 'white', padding: '10px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', borderRadius: '8px' }}
        >
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Video Exercise</h2>
            <button onClick={closeModal} className={styles.closeButton}>
              <FaTimes />
            </button>
            <div className={styles.videoContainer}>
              {renderVideoContent(videoUrl)}
            </div>
          </div>
        </Rnd>
      </Modal>
    </div>
  );
};

export default UserExerciseList;
