import React, { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 
import styles from './MyCalendar.module.css';

const MyCalendar = () => {
  const [date, setDate] = useState(new Date());

  const onChange = (newDate) => {
    setDate(newDate);
  };

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarCard}>
        <Calendar
          onChange={onChange}
          value={date}
          className={styles.reactCalendar}
        />
      </div>
    </div>
  );
};

export default MyCalendar;
