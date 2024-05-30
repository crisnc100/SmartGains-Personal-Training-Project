from flask_app.config.mysqlconnection import connectToMySQL


class CustomExercises:
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
        self.trainer_id = data.get('trainer_id')
    
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
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at),
            'trainer_id': self.trainer_id
        }
    


    @classmethod
    def save(cls, data):
        query = """
            INSERT INTO trainer_custom_exercises (name, body_part, equipment, target_muscle, secondary_muscles,
            instructions, gif_url, video_url, fitness_level, created_at, updated_at, trainer_id)
            VALUES (%(name)s, %(body_part)s, %(equipment)s, %(target_muscle)s, %(secondary_muscles)s,
            %(instructions)s, %(gif_url)s, %(video_url)s, %(fitness_level)s, NOW(), NOW(), %(trainer_id)s)
        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)

    @classmethod
    def get_by_trainer_id(cls, trainer_id):
        query = "SELECT * FROM trainer_custom_exercises WHERE trainer_id = %(trainer_id)s"
        results = connectToMySQL('fitness_consultation_schema').query_db(query, {'trainer_id': trainer_id})
        return [cls(result) for result in results]
    


    # UPDATE
    @classmethod
    def update(cls, data):
        query = """
            UPDATE trainer_custom_exercises
            SET
                name = %(name)s,
                body_part = %(body_part)s,
                equipment = %(equipment)s,
                target_muscle = %(target_muscle)s,
                secondary_muscles = %(secondary_muscles)s,
                instructions = %(instructions)s,
                gif_url = %(gif_url)s,
                video_url = %(video_url)s,
                fitness_level = %(fitness_level)s,
                updated_at = NOW()
            WHERE id = %(id)s;
                    """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
        


    @classmethod
    def delete(cls, custom_exercise_id):
        query = "DELETE FROM trainer_custom_exercises WHERE id = %(id)s;"
        data = {"id": custom_exercise_id}
        result =  connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return result != 0