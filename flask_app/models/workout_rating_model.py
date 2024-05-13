from flask_app.config.mysqlconnection import connectToMySQL

class WorkoutRating:
    def __init__(self, data):
        self.id = data.get('id')
        self.rating = data.get('rating')
        self.comments = data.get('comments')
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)
        self.trainer_id = data.get('trainer_id', None)
        self.client_id = data.get('client_id')
        self.plan_id = data.get('plan_id')
    
    def serialize(self):
        return {
            'id': self.id,
            'rating': self.rating,
            'comoments': self.comments,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
            'trainer_id': self.trainer_id,
            'client_id': self.client_id,
            'plan_id': self.plan_id
        }
    
    def save(self):
        data = {
            'trainer_id': self.trainer_id,
            'client_id': self.client_id,
            'plan_id': self.plan_id,
            'rating': self.rating,
            'comments': self.comments,
        }
        query = """
                INSERT INTO workout_rating (trainer_id, client_id, plan_id, rating, comments, created_at, updated_at)
                VALUES (%(trainer_id)s, %(client_id)s, %(plan_id)s, %(rating)s, %(comments)s, NOW(), NOW());
                """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
    
    @classmethod
    def get_all_by_trainer_id(cls, trainer_id):
        query = "SELECT * FROM workout_rating WHERE trainer_id = %(trainer_id)s;"
        results = connectToMySQL('fitness_consultation_schema').query_db(query, {'trainer_id': trainer_id})
        return [cls(result) for result in results]
    
    @classmethod
    def get_by_id(cls, id):
        query = "SELECT * FROM workout_rating WHERE id = %(id)s;"
        results = connectToMySQL('fitness_consultation_schema').query_db(query, {'id': id})
        if results:
            return cls(results[0])
        return None
    
    @classmethod
    def get_all_by_plan_id(cls, plan_id):
        query = "SELECT * FROM workout_rating WHERE plan_id = %(plan_id)s;"
        results = connectToMySQL('fitness_consultation_schema').query_db(query, {'plan_id': plan_id})
        return [cls(result) for result in results]
    

    @classmethod
    def update_feedback(cls, id, updated_data):
        query = """
        UPDATE workout_rating
        SET rating = %(rating)s, comments = %(comments)s, updated_at = NOW()
            WHERE id = %(id)s;
    """
        params = {'id': id, 'rating': updated_data['rating'], 'comments': updated_data['comments']}
        connectToMySQL('fitness_consultation_schema').query_db(query, params)

    @classmethod
    def delete_feedback(cls, id):
        query = "DELETE FROM workout_rating WHERE id = %(id)s;"
        connectToMySQL('fitness_consultation_schema').query_db(query, {'id': id})


    @classmethod
    def average_rating_by_trainer(cls, trainer_id):
        query = """
        SELECT AVG(rating) as average_rating
        FROM workout_rating
        WHERE trainer_id = %(trainer_id)s;
        """
        result = connectToMySQL('fitness_consultation_schema').query_db(query, {'trainer_id': trainer_id})
        return result[0]['average_rating'] if result else None




    
