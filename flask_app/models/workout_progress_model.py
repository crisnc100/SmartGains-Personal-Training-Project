from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash

class WorkoutProgress:
    def __init__(self, data):
        self.date = data['date']
        self.workout_type = data['workout_type']
        self.duration_minutes = data['duration_minutes']
        self.exercises_log = data['exercises_log']
        self.intensity_level = data['intensity_level']
        self.location = data['location']
        self.workout_rating = data['workout_rating']
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)
        self.client_id = data['client_id']
        
    @classmethod
    def save(cls, data):
        query = """INSERT INTO workout_progress (date, workout_type, duration_minutes, exercises_log, intensity_level, location, workout_rating, created_at, updated_at, client_id) 
        VALUES (%(date)s, %(workout_type)s, %(duration_minutes)s, %(exercises_log)s, %(intensity_level)s, %(location)s, %(workout_rating)s, NOW(), NOW(), %(client_id)s);"""
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
    
    #READ
    @classmethod
    def get_by_id(cls, progress_id):
        query = """
            SELECT wp.*, c.first_name AS client_first_name, c.last_name AS client_last_name
            FROM workout_progress wp
            JOIN clients c ON wp.client_id = c.id
            WHERE wp.id = %(id)s;
        """
        data = {'id': progress_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None
    
    @classmethod
    def get_by_client_id(cls, client_id):
        query = """
        SELECT * FROM workout_progress
        WHERE client_id = %(client_id)s;
    """
        data = {'client_id': client_id}
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        workout_progress = []
        for result in results:
            workout_progress.append(cls(result))
        return workout_progress
        
    @classmethod
    def update(cls, data):
        query = """
                UPDATE workout_progress
                SET date = %(date)s, workout_type = %(workout_type)s, duration_minutes = %(duration_minutes)s, 
                exercises_log = %(exercises_log)s, intensity_level = %(intensity_level)s, 
                location = %(location)s, workout_rating = %(workout_rating)s, updated_at = NOW()
                WHERE id = %(id)s;"""
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return results
    
    @classmethod
    def delete(cls, progress_id):
        query = "DELETE FROM workout_progress WHERE id = %(id)s;"
        data = {"id": progress_id}
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)