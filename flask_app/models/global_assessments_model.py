from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash

class GlobalAssessments:
    def __init__(self, data):
        self.id = data.get('id')
        self.name = data.get('name')
        self.description = data.get('description')
        self.level = data.get('level')
        self.instructions = data.get('instructions')
        self.input_fields = data.get('input_fields')
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')
    
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'level': self.level,
            'instructions': self.instructions,
            'input_fields': self.input_fields,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at)
        }

    # CREATE
    @classmethod
    def save(cls, data):
        query = """
            INSERT INTO global_assessments
            (name, description, level, instructions, input_fields, created_at, updated_at) 
            VALUES 
            (%(name)s, %(description)s, %(level)s, %(instructions)s, %(input_fields)s, NOW(), NOW());
        """
        try:
            return connectToMySQL('fitness_consultation_schema').query_db(query, data)
        except Exception as e:
            print(f"Error inserting data: {e}")
            return None

    @classmethod
    def get_all(cls):
        query = "SELECT * FROM global_assessments"
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query)
            assessments = [cls(row) for row in results]
            return assessments
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    @classmethod
    def get_by_name(cls, name):
        query = "SELECT * FROM global_assessments WHERE name = %(name)s"
        data = {'name': name}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return cls(results[0]) if results else None
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None
    
    @classmethod
    def get_all_assessment_names(cls):
        query = "SELECT id, name FROM global_assessments"
        results = connectToMySQL('fitness_consultation_schema').query_db(query)
        return results

    @classmethod
    def get_by_level(cls, level):
        query = "SELECT * FROM global_assessments WHERE level = %(level)s"
        data = {'level': level}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            assessments = [cls(row) for row in results]
            return assessments
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []
