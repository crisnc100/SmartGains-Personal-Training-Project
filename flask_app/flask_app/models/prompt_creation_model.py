from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash

class PromptCreation:
    def __init__(self, data):
        self.level = data['level']
        self.intensity = data['intensity']
        self.training_type = data['intensity']
        self.body_parts = data['body_parts']
        self.duration_min = data['duration_min']
        self.equipment = data['equipment']
        self.session_type = data['session_type']
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)
        self.client_id = data['client_id']


    @classmethod
    def save(cls, data):
        query = """INSERT INTO prompt_creation (level, intensity, training_type, body_parts, duration_min, equipment, session_type, created_at, updated_at, client_id) 
        VALUES (%(level)s, %(intensity)s, %(training_type)s, %(body_parts)s, %(duration_min)s, %(equipment)s, %(session_type)s, NOW(), NOW(), %(client_id)s);"""
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
    
    #READ
    @classmethod
    def get_by_client_id(cls, client_id):
        query = """
        SELECT * FROM prompt_creation
        WHERE client_id = %(client_id)s;
    """
        data = {'client_id': client_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None
    
   

    #UPDATE
    @classmethod
    def update(cls, data):
        query = """
                UPDATE prompt_creation
                SET level = %(level)s, intensity = %(intensity)s, training_type = %(training_type)s, 
                body_parts = %(body_parts)s, duration_min = %(duration_min)s, equipment = %(equipment)s, 
                session_type = %(session_type)s, updated_at = NOW()
                WHERE id = %(client_id)s;"""
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return results
    
    #DELETE
    @classmethod
    def delete(cls, initial_prompt_id):
        query = "DELETE FROM prompt_creation WHERE id = %(id)s;"
        data = {"id": initial_prompt_id}
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)