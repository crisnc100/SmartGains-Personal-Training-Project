from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash
import re
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$')

class Trainer:
    def __init__(self, data):
        self.id = data['id']
        self.first_name = data['first_name']
        self.last_name = data['last_name']
        self.email = data['email']
        self.password_hash = data['password_hash']
        self.created_at = data['created_at']
        self.updated_at = data['updated_at']

    @classmethod
    def save(cls, data):
        query = "INSERT INTO trainers (first_name, last_name, email, password_hash, created_at, updated_at) VALUES (%(first_name)s, %(last_name)s, %(email)s, %(password_hash)s, NOW(), NOW());"
        return connectToMySQL('fitness_consultation_schema').query_db(query,data)
    
    @staticmethod
    def validate_trainer(trainer):
        is_valid = True  
    
        if len(trainer['first_name']) < 2:
            flash("First name must be at least 3 characters.", 'register_error')
        is_valid = False
        
        if len(trainer['last_name']) < 2:
            flash("Last name must be at least 3 characters.", 'register_error')
        is_valid = False
        
        if not EMAIL_REGEX.match(trainer['email']): 
            flash("Invalid email address!", 'register_error')
        is_valid = False
        
        if len(trainer['password_hash']) < 8:
            flash("Password must be at least 8 characters.", 'register_error')
        is_valid = False
        
        return is_valid

    
    @classmethod
    def get_by_email(cls, email):
        query = "SELECT * FROM trainers WHERE email = %(email)s;"
        data = {'email': email}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        if result:
            return cls(result[0])  
        else:
            return None
        
    @classmethod
    def get_by_id(cls, trainer_id):
        query = "SELECT * FROM trainers WHERE id = %(id)s;"
        data = {
            'id': trainer_id
        }
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        if result:
            return cls(result[0]) 
        return None
    
    @classmethod
    def update(cls, data):
        query = """
                UPDATE trainers
                SET first_name = %(first_name)s, last_name = %(last_name)s, email = %(email)s, password_hash = %(password_hash)s, updated_at = NOW()
                WHERE id = %(id)s;"""
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return results