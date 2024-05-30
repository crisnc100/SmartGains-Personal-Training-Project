from flask_app.config.mysqlconnection import connectToMySQL


class ExerciseLibrary:
    def __init__(self, data):
        self.id = data.get('id')
        self.name = data.get('name')
        self.body_part = data.get('body_part')
        self.equipment = data.get('equipment')
        self.target_muscle = data.get('target_muscle')
        self.secondary_muscles = data.get('secondary_muscles')
        self.instructions = data.get('instructions')
        self.gif_url = data.get('gif_url')
        self.video_url = data.get('video_url')
        self.fitness_level = data.get('fitness_level')
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)

    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'body_part': self.body_part,
            'equipment': self.equipment,
            'target_muscle': self.target_muscle,
            'secondary_muscles': self.secondary_muscles,
            'instructions': self.instructions,
            'gif_url': self.gif_url,
            'video_url': self.video_url,
            'fitness_level': self.fitness_level,
            'created_at': str(self.created_at) if self.created_at else None,
            'updated_at': str(self.updated_at) if self.updated_at else None
        }
    @classmethod
    def save(cls, data):
        query = """
                INSERT INTO exercise_library (name, body_part, equipment, target_muscle, secondary_muscles, instructions,
                gif_url, video_url, fitness_level, created_at, updated_at)
                VALUES (%(name)s, %(body_part)s, %(equipment)s, %(target_muscle)s, %(secondary_muscles)s,
                 %(instructions)s, %(gif_url)s, %(video_url)s, %(fitness_level)s, NOW(), NOW())"""
        
        try:
            return connectToMySQL('fitness_consultation_schema').query_db(query, data)
        except Exception as e:
            print(f"Error saving exercise: {e}")
            return None

    @classmethod
    def get_all(cls):
        query = "SELECT * FROM exercise_library"
        results = connectToMySQL('fitness_consultation_schema').query_db(query)
        exercises = []
        for row in results:
            exercises.append(cls(row))
        return exercises

    @classmethod
    def get_exercises_by_body_part(cls, body_part):
        query = "SELECT * FROM exercise_library WHERE body_part = %(body_part)s"
        data = { 'body_part': body_part }
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        exercises = []
        for row in results:
            exercises.append(cls(row))
        return exercises
    
    @classmethod
    def get_body_parts(cls):
        query = "SELECT DISTINCT body_part FROM exercise_library"
        results = connectToMySQL('fitness_consultation_schema').query_db(query)
        return [row['body_part'] for row in results]
        