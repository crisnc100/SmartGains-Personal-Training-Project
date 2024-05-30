from flask_app.config.mysqlconnection import connectToMySQL

class FavoriteExercise:
    def __init__(self, data):
        self.id = data.get('id')
        self.exercise_type = data.get('exercise_type')
        self.trainer_id = data.get('trainer_id')
        self.exercise_id = data.get('exercise_id')
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)

    def serialize(self):
        return {
            'id': self.id,
            'exercise_type': self.exercise_type,
            'trainer_id': self.trainer_id,
            'exercise_id': self.exercise_id,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at)
        }

    @classmethod
    def save(cls, data):
        query = """
            INSERT INTO trainer_exercise_favorites (exercise_type, trainer_id, exercise_id, created_at, updated_at)
            VALUES (%(exercise_type)s, %(trainer_id)s, %(exercise_id)s, NOW(), NOW())
        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)

    @classmethod
    def get_by_trainer_id(cls, trainer_id):
        query = "SELECT * FROM trainer_exercise_favorites WHERE trainer_id = %(trainer_id)s"
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
