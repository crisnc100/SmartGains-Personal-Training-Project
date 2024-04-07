from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash

class History:
    def __init__(self, data):
        self.id = data['id']
        self.existing_conditions = data['existing_conditions']
        self.medications = data['medications']
        self.surgeries_or_injuries = data['surgeries_or_injuries']
        self.allergies = data['allergies']
        self.family_history = data['family_history']
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)
        self.client_id = data['client_id']
    
    #CREATE
    @classmethod
    def save(cls, data):
        query = """INSERT INTO medical_history (existing_conditions, medications, surgeries_or_injuries, allergies, family_history,created_at, updated_at, client_id) 
        VALUES (%(existing_conditions)s, %(medications)s, %(surgeries_or_injuries)s, %(allergies)s, %(family_history)s,NOW(), NOW(), %(client_id)s);"""
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
    
    #READ
    @classmethod
    def get_by_id(cls, history_id):
        query = """
            SELECT mh.*, c.first_name AS client_first_name, c.last_name AS client_last_name
            FROM medical_history mh
            JOIN clients c ON mh.client_id = c.id
            WHERE mh.id = %(id)s;
        """
        data = {'id': history_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None
    
    @classmethod
    def get_by_client_id(cls, client_id):
        query = """
        SELECT * FROM medical_history
        WHERE client_id = %(client_id)s;
    """
        data = {'client_id': client_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None

    @classmethod
    def get_all(cls):
        query = """
            SELECT mh.*, c.first_name AS client_first_name, c.last_name AS client_last_name
            FROM medical_history mh
            JOIN clients c ON mh.client_id = c.id;
        """
        results = connectToMySQL('fitness_consultation_schema').query_db(query)
        histories = []
        for history in results:
            histories.append(cls(history))
        return histories

    #UPDATE
    @classmethod
    def update(cls, data):
        query = """
                UPDATE medical_history
                SET existing_conditions = %(existing_conditions)s,medications = %(medications)s, surgeries_or_injuries = %(surgeries_or_injuries)s, allergies = %(allergies)s, family_history = %(family_history)s, updated_at = NOW()
                WHERE id = %(id)s;"""
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return results
    
    #DELETE
    @classmethod
    def delete(cls, history_id):
        query = "DELETE FROM medical_history WHERE id = %(id)s;"
        data = {"id": history_id}
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)