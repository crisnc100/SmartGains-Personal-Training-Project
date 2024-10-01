from flask_app.config.mysqlconnection import connectToMySQL
import json


class ClientAssessments:
    def __init__(self, data):
        self.id = data.get('id')
        self.input_data = data.get('input_data')
        self.client_id = data.get('client_id')
        self.assessment_id = data.get('assessment_id')
        self.trainer_id = data.get('trainer_id')
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')
        self.assessment_name = data.get('assessment_name')  # Ensure this field is initialized

    
    def serialize(self):
        return {
            'id': self.id,
            'input_data': self.input_data,
            'client_id': self.client_id,
            'assessment_id': self.assessment_id,
            'trainer_id': self.trainer_id,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at),
            'assessment_name': self.assessment_name
        }

    # CREATE
    @classmethod
    def save(cls, data):
        query = """
            INSERT INTO client_assessments
            (input_data, client_id, assessment_id, trainer_id, created_at, updated_at) 
            VALUES 
            (%(input_data)s, %(client_id)s, %(assessment_id)s, %(trainer_id)s, NOW(), NOW());
        """
        try:
            return connectToMySQL('fitness_consultation_schema').query_db(query, data)
        except Exception as e:
            print(f"Error inserting data: {e}")
            return None

    @classmethod
    def get_all_by_client_id(cls, client_id):
        query = """
            SELECT ca.*, 
                   ga.name AS assessment_name,
                   ga.description AS assessment_description,
                   ga.level AS assessment_level,
                   ga.instructions AS assessment_instructions,
                   ga.input_fields AS assessment_input_fields
            FROM client_assessments ca
            LEFT JOIN global_assessments ga ON ca.assessment_id = ga.id
            WHERE ca.client_id = %(client_id)s
        """
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, {'client_id': client_id})
            return [cls(result) for result in results]
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    @classmethod
    def get_all_by_trainer_id(cls, trainer_id):
        query = """
            SELECT ca.*, 
                   ga.name AS assessment_name,
                   ga.description AS assessment_description,
                   ga.level AS assessment_level,
                   ga.instructions AS assessment_instructions,
                   ga.input_fields AS assessment_input_fields
            FROM client_assessments ca
            LEFT JOIN global_assessments ga ON ca.assessment_id = ga.id
            WHERE ca.trainer_id = %(trainer_id)s
        """
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, {'trainer_id': trainer_id})
            return [cls(result) for result in results]
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    @classmethod
    def get_all_by_assessment_id(cls, assessment_id):
        query = """
            SELECT ca.*, 
                   ga.name AS assessment_name,
                   ga.description AS assessment_description,
                   ga.level AS assessment_level,
                   ga.instructions AS assessment_instructions,
                   ga.input_fields AS assessment_input_fields
            FROM client_assessments ca
            LEFT JOIN global_assessments ga ON ca.assessment_id = ga.id
            WHERE ca.assessment_id = %(assessment_id)s
        """
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, {'assessment_id': assessment_id})
            return [cls(result) for result in results]
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    @classmethod
    def get_by_id(cls, id):
        query = """
            SELECT ca.*, 
                   ga.name AS assessment_name,
                   ga.description AS assessment_description,
                   ga.level AS assessment_level,
                   ga.instructions AS assessment_instructions,
                   ga.input_fields AS assessment_input_fields
            FROM client_assessments ca
            LEFT JOIN global_assessments ga ON ca.assessment_id = ga.id
            WHERE ca.id = %(id)s
        """
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, {'id': id})
            return cls(results[0]) if results else None
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None

    @classmethod
    def update(cls, data):
        # Ensure input_data is a JSON string
        if isinstance(data.get('input_data'), dict):
            data['input_data'] = json.dumps(data['input_data'])
        query = """
            UPDATE client_assessments
            SET
                input_data = %(input_data)s,
                assessment_id = %(assessment_id)s,
                updated_at = NOW()
            WHERE id = %(id)s;
        """
        try:
            return connectToMySQL('fitness_consultation_schema').query_db(query, data)
        except Exception as e:
            print(f"Error updating data: {e}")
            return None

    @classmethod
    def delete(cls, client_assessment_id):
        query = "DELETE FROM client_assessments WHERE id = %(id)s;"
        data = {"id": client_assessment_id}
        try:
            result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return result != 0
        except Exception as e:
            print(f"Error deleting data: {e}")
            return False
