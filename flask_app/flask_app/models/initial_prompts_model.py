from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash

class InitialPrompts:
    def __init__(self, data):
        self.id = data['id']
        self.level = data['level']
        self.prompt_template = data['prompt_template']
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)
        self.trainer_id = data['trainer_id']
        self.client_id = data['client_id']

    @classmethod
    def save(cls, data):
        query = """INSERT INTO initial_prompts (level, prompt_template, created_at, updated_at, trainer_id, client_id) 
        VALUES (%(level)s, %(prompt_template)s, NOW(), NOW(), %(trainer_id)s, %(client_id)s);"""
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
    
    #READ
    @classmethod
    def get_by_client_id(cls, client_id):
        query = """
        SELECT * FROM initial_prompts
        WHERE client_id = %(client_id)s;
    """
        data = {'client_id': client_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None
    
    @classmethod
    def get_by_trainer_id(cls, trainer_id):
        query = """
        SELECT * FROM initial_prompts
        WHERE trainer_id = %(trainer_id)s;
        """
        data = {'trainer_id': trainer_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return [cls(row) for row in result]  
        else:
            return None
    
    @classmethod
    def get_by_level(cls, level):
        query = """
            SELECT * FROM initial_prompts
            WHERE level = %(level)s;
        """
        data = {'level': level}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return [cls(row) for row in result]  
        else:
            return None

    #UPDATE
    @classmethod
    def update(cls, data):
        query = """
                UPDATE initial_prompts
                SET level = %(level)s, prompt_template = %(prompt_template)s, updated_at = NOW()
                WHERE id = %(client_id)s;"""
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return results
    
    #DELETE
    @classmethod
    def delete(cls, initial_prompt_id):
        query = "DELETE FROM initial_prompts WHERE id = %(id)s;"
        data = {"id": initial_prompt_id}
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)