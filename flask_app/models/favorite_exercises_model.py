from flask_app.config.mysqlconnection import connectToMySQL

class FavoriteExercise:
    def __init__(self, data):
        self.id = data.get('id')
        self.exercise_type = data.get('exercise_type')
        self.trainer_id = data.get('trainer_id')
        self.exercise_id = data.get('exercise_id')
        self.custom_exercise_id = data.get('custom_exercise_id')
        self.name = data.get('name')
        self.body_part = data.get('body_part')
        self.equipment = data.get('equipment')
        self.target_muscle = data.get('target_muscle')
        self.secondary_muscles = data.get('secondary_muscles')
        self.instructions = data.get('instructions')
        self.gif_url = data.get('gif_url')
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)

    def serialize(self):
        return {
            'id': self.id,
            'exercise_type': self.exercise_type,
            'trainer_id': self.trainer_id,
            'exercise_id': self.exercise_id,
            'custom_exercise_id': self.custom_exercise_id,
            'name': self.name,
            'body_part': self.body_part,
            'equipment': self.equipment,
            'target_muscle': self.target_muscle,
            'secondary_muscles': self.secondary_muscles,
            'instructions': self.instructions,
            'gif_url': self.gif_url,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at)
        }

    @classmethod
    def save(cls, data):
        query = """
            INSERT INTO trainer_exercise_favorites (exercise_type, trainer_id, exercise_id, created_at, updated_at)
            VALUES (%(exercise_type)s, %(trainer_id)s, %(exercise_id)s, NOW(), NOW())
            ON DUPLICATE KEY UPDATE updated_at = NOW();

        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)

    @classmethod
    def get_all_by_trainer_id(cls, trainer_id):
        query = """
            SELECT tef.*, 
                   COALESCE(el.name, ce.name) AS name,
                   COALESCE(el.body_part, ce.body_part) AS body_part,
                   COALESCE(el.equipment, ce.equipment) AS equipment,
                   COALESCE(el.target_muscle, ce.target_muscle) AS target_muscle,
                   COALESCE(el.secondary_muscles, ce.secondary_muscles) AS secondary_muscles,
                   COALESCE(el.instructions, ce.instructions) AS instructions,
                   COALESCE(el.gif_url, ce.gif_url) AS gif_url
            FROM trainer_exercise_favorites tef
            LEFT JOIN exercise_library el ON tef.exercise_id = el.id
            LEFT JOIN trainer_custom_exercises ce ON tef.custom_exercise_id = ce.id
            WHERE tef.trainer_id = %(trainer_id)s
        """
        results = connectToMySQL('fitness_consultation_schema').query_db(query, {'trainer_id': trainer_id})
        return [cls(result) for result in results]

    @classmethod
    def update(cls, data):
        query = """
            UPDATE trainer_exercise_favorites
            SET
                exercise_type = %(exercise_type)s,
                exercise_id = %(exercise_id)s,
                updated_at = NOW()
            WHERE id = %(id)s;
        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)

    @classmethod
    def delete(cls, favorite_exercise_id):
        query = "DELETE FROM trainer_exercise_favorites WHERE id = %(id)s;"
        data = {"id": favorite_exercise_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return result != 0
