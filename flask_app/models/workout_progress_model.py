from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash

class WorkoutProgress:
    def __init__(self, data):
        self.id = data.get('id')
        self.name = data.get('name')
        self.date = data.get('date', None) 
        self.workout_type = data.get('workout_type')
        self.duration_minutes = data.get('duration_minutes')
        self.exercises_log = data.get('exercises_log')
        self.intensity_level = data.get('intensity_level')
        self.location = data.get('location')
        self.workout_rating = data.get('workout_rating')
        self.trainer_notes = data.get('trainer_notes', None)
        self.workout_source = data.get('workout_source')
        self.day_index = data.get('day_index', None)
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)
        self.client_id = data.get('client_id')
        self.generated_plan_id = data.get('generated_plan_id')
        self.demo_plan_id = data.get('demo_plan_id')
        self.client_first_name = data.get('client_first_name', None)
        self.client_last_name = data.get('client_last_name', None)
    
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'date': self.date,
            'workout_type': self.workout_type,
            'duration_minutes': self.duration_minutes,
            'exercises_log': self.exercises_log,
            'intensity_level': self.intensity_level,
            'location': self.location,
            'workout_rating': self.workout_rating,
            'trainer_notes': self.trainer_notes,
            'workout_source': self.workout_source,
            'day_index': self.day_index,
            'created_at': str(self.created_at),  
            'updated_at': str(self.updated_at),
            'client_id': self.client_id,
            'generated_plan_id': self.generated_plan_id,
            'demo_plan_id': self.demo_plan_id
        }
        
    @classmethod
    def save(cls, data):
        base_query = """
        INSERT INTO workout_progress (
            name, date, workout_type, duration_minutes, exercises_log,
            intensity_level, location, workout_rating, trainer_notes,
            workout_source, day_index, created_at, updated_at, client_id
        """
        values_query = """
            VALUES (
            %(name)s, %(date)s, %(workout_type)s, %(duration_minutes)s, %(exercises_log)s,
            %(intensity_level)s, %(location)s, %(workout_rating)s, %(trainer_notes)s,
            %(workout_source)s, %(day_index)s, NOW(), NOW(), %(client_id)s
        """
    
        if 'generated_plan_id' in data:
            base_query += ", generated_plan_id"
            values_query += ", %(generated_plan_id)s"
    
        if 'demo_plan_id' in data:
            base_query += ", demo_plan_id"
            values_query += ", %(demo_plan_id)s"
    
        if 'adaptive_plan_id' in data:
            base_query += ", adaptive_plan_id"
            values_query += ", %(adaptive_plan_id)s"
    
        query = base_query + " ) " + values_query + " );"

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
    def get_most_recent_by_client_id(cls, client_id):
        query = """
        SELECT * FROM workout_progress
        WHERE client_id = %(client_id)s
        ORDER BY date DESC
        LIMIT 1;
        """
        data = {'client_id': client_id}
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
    
        if results:
            return cls(results[0])  
        else:   
            return None
    
    
    @classmethod
    def get_grouped_progress(cls, client_id):
        try:
            # Fetch demo plan progress
            demo_progress_query = """
                SELECT wp.*, dp.name AS plan_name 
                FROM workout_progress wp
                JOIN demo_plans dp ON wp.demo_plan_id = dp.id
                WHERE wp.client_id = %(client_id)s AND wp.demo_plan_id IS NOT NULL
                ORDER BY wp.demo_plan_id, wp.day_index;
            """
            demo_progress_results = connectToMySQL('fitness_consultation_schema').query_db(demo_progress_query, {'client_id': client_id})

            # Fetch generated plan progress
            generated_progress_query = """
                SELECT wp.*, gp.name AS plan_name 
                FROM workout_progress wp
                JOIN generated_plans gp ON wp.generated_plan_id = gp.id
                WHERE wp.client_id = %(client_id)s AND wp.generated_plan_id IS NOT NULL
                ORDER BY wp.generated_plan_id, wp.day_index;
            """
            generated_progress_results = connectToMySQL('fitness_consultation_schema').query_db(generated_progress_query, {'client_id': client_id})

            grouped_progress = {}

            # Process demo plan progress
            for row in demo_progress_results:
                plan_key = f"demo_{row['demo_plan_id']}"
                if plan_key not in grouped_progress:
                    grouped_progress[plan_key] = {
                        'plan_id': row['demo_plan_id'],
                        'plan_type': 'demo',
                        'plan_name': row['plan_name'],
                        'sessions': []
                    }
                grouped_progress[plan_key]['sessions'].append(row)

            # Process generated plan progress
            for row in generated_progress_results:
                plan_key = f"generated_{row['generated_plan_id']}"
                if plan_key not in grouped_progress:
                    grouped_progress[plan_key] = {
                        'plan_id': row['generated_plan_id'],
                        'plan_type': 'generated',
                        'plan_name': row['plan_name'],
                        'sessions': []
                    }
                grouped_progress[plan_key]['sessions'].append(row)

            return grouped_progress

        except Exception as e:
            print(f"An error occurred while fetching grouped progress: {str(e)}")
            raise e
        

    
    @classmethod
    def get_by_demo_plan_id(cls, plan_id):
        query = """
        SELECT wp.*, c.first_name AS client_first_name, c.last_name AS client_last_name
        FROM workout_progress wp
        JOIN clients c ON wp.client_id = c.id
        WHERE wp.demo_plan_id = %(plan_id)s;
        """
        data = {'plan_id': plan_id}
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return [cls(result) for result in results]

    @classmethod
    def get_by_generated_plan_id(cls, plan_id):
        query = """
        SELECT wp.*, c.first_name AS client_first_name, c.last_name AS client_last_name
        FROM workout_progress wp
        JOIN clients c ON wp.client_id = c.id
        WHERE wp.generated_plan_id = %(plan_id)s;
        """
        data = {'plan_id': plan_id}
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return [cls(result) for result in results]

        
    @classmethod
    def update(cls, data):
        query = """
            UPDATE workout_progress
            SET name = %(name)s, date = %(date)s, workout_type = %(workout_type)s, duration_minutes = %(duration_minutes)s, 
            exercises_log = %(exercises_log)s, intensity_level = %(intensity_level)s, 
            location = %(location)s, workout_rating = %(workout_rating)s, trainer_notes = %(trainer_notes)s, updated_at = NOW()
            WHERE id = %(id)s;
        """
        print("Running Query:\n", query % data)  # Debug statement
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        print("Query result (rows affected):", results)  # Debug statement
        return results




    
    @classmethod
    def delete(cls, progress_id):
        query = "DELETE FROM workout_progress WHERE id = %(id)s;"
        data = {"id": progress_id}
        result =  connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return result != 0