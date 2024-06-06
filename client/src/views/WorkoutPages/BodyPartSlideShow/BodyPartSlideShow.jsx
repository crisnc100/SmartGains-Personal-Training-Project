import React, { useState, useEffect } from 'react';
import styles from './BodyPartSlideShow.module.css';
import axios from 'axios';

const bodyPartImages = {
  Back: '/images/back_body_part.webp',
  Cardio: '/images/cardio_body_part.webp',
  Chest: '/images/chest_body_part.webp',
  Arms: '/images/arms1_body_part.webp',
  Legs: '/images/legs1_body_part.webp',
  Shoulders: '/images/shoulders_body_part.webp',
  Waist: '/images/waist_body_part.webp',
  'My List': '/images/my_exercises.webp' // Add an image for My List section
};

const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const BodyPartSlideShow = ({ onSelectBodyPart, onSelectMyList }) => {
  const [bodyParts, setBodyParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBodyParts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/body_parts');
        setBodyParts(['My List', ...response.data]);
      } catch (error) {
        setError('Error fetching body parts');
        console.error('Error fetching body parts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBodyParts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const container = document.getElementById('bodyPartSlideshow');
      if (container) {
        if (container.scrollLeft + container.clientWidth >= container.scrollWidth) {
          container.scrollLeft = 0; // Reset to start
        } else {
          container.scrollLeft += 200;
        }
      }
    }, 15000); // 10 seconds interval
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const handleScroll = (direction) => {
    const container = document.getElementById('bodyPartSlideshow');
    if (direction === 'left') {
      container.scrollLeft -= 200;
    } else {
      container.scrollLeft += 200;
    }
  };

  const handleBodyPartClick = (bodyPart) => {
    if (bodyPart === 'My List') {
      onSelectMyList();
    } else {
      onSelectBodyPart(bodyPart);
    }
  };

  return (
    <div className={styles.container}>
      <button className={`${styles.scrollButton} ${styles.left}`} onClick={() => handleScroll('left')}>{"<"}</button>
      <div id="bodyPartSlideshow" className={styles.bodyPartSlideshow}>
        {bodyParts.map((bodyPart) => (
          <div key={bodyPart} className={styles.bodyPart} onClick={() => handleBodyPartClick(bodyPart)}>
            <img src={bodyPartImages[bodyPart]} alt={bodyPart} className={styles.bodyPartImage} />
            <p>{bodyPart}</p>
          </div>
        ))}
      </div>
      <button className={`${styles.scrollButton} ${styles.right}`} onClick={() => handleScroll('right')}>{">"}</button>
    </div>
  );
};

export default BodyPartSlideShow;
