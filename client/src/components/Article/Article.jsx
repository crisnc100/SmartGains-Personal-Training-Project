import React from 'react';
import styles from './Article.module.css';

const Article = ({ imgUrl, date, text }) => (
  <div className={styles.container}>
    <div className={styles.image}>
      <img src={imgUrl} alt="testimonial_image" />
    </div>
    <div className={styles.content}>
      <div>
        <p>{date}</p>
        <h3>{text}</h3>
      </div>
      <p>Read Full Testimonial</p>
    </div>
  </div>
);

export default Article;
