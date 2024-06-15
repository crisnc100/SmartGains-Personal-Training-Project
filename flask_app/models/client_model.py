from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash
import re
from datetime import datetime

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$')
PHONE_REGEX = re.compile(r'^\d{3}-\d{3}-\d{4}$')

class Client:
    def __init__(self, data):
        self.id = data['id']
        self.first_name = data['first_name']
        self.last_name = data['last_name']
        self.dob = data['dob']
        self.gender = data['gender']
        self.occupation = data['occupation']
        self.email = data['email']
        self.phone_number = data['phone_number']
        self.address = data['address']
        self.location_gym = data['location_gym']
        self.created_at = data['created_at']
        self.updated_at = data['updated_at']
        self.trainer_id = data['trainer_id']
        self.trainer_first_name = data.get('trainer_first_name')  # Using .get to avoid errors with KeyError if not present
        self.trainer_last_name = data.get('trainer_last_name')
    
    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "dob": self.dob,
            "gender": self.gender,
            "occupation": self.occupation,
            "email": self.email,
            "phone_number": self.phone_number,
            "address": self.address,
            "location_gym": self.location_gym,
            "created_at": str(self.created_at), 
            "updated_at": str(self.updated_at),
            "trainer_id": self.trainer_id,
            "trainer_first_name": self.trainer_first_name,
            "trainer_last_name": self.trainer_last_name
        }

    @classmethod
    def save(cls, data):
        query = "INSERT INTO clients (first_name, last_name, dob, gender, occupation, email, phone_number, address, location_gym, created_at, updated_at, trainer_id) VALUES (%(first_name)s, %(last_name)s, %(dob)s, %(gender)s, %(occupation)s, %(email)s, %(phone_number)s, %(address)s, %(location_gym)s, NOW(), NOW(), %(trainer_id)s);"
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
    
    @classmethod
    def get_all(cls):
        query = """
            SELECT cl.*, t.first_name AS trainer_first_name, t.last_name AS trainer_last_name
            FROM clients AS cl
            JOIN trainers AS t ON cl.trainer_id = t.id;
        """
        results = connectToMySQL('fitness_consultation_schema').query_db(query)
        clients = []
        for result in results:
            clients.append(cls(result))
        return clients

    @classmethod
    def get_one(cls, client_id):
        query = """
            SELECT cl.*, t.first_name AS trainer_first_name, t.last_name AS trainer_last_name
            FROM clients AS cl
            JOIN trainers AS t ON cl.trainer_id = t.id
            WHERE cl.id = %(client_id)s;

        """
        data = {'client_id': client_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        if result:
            return cls(result[0])
        return None
    
    @classmethod
    def get_by_trainer_id(cls, trainer_id):
        query = """
        SELECT * FROM clients
        WHERE trainer_id = %(trainer_id)s;
    """
        data = {'trainer_id': trainer_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None
    
    @classmethod
    def get_all_by_trainer(cls, trainer_id):
        query = """
            SELECT cl.*, t.first_name AS trainer_first_name, t.last_name AS trainer_last_name
            FROM clients AS cl
            JOIN trainers AS t ON cl.trainer_id = t.id
            WHERE cl.trainer_id = %(trainer_id)s;
        """
        data = {'trainer_id': trainer_id}
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        clients = []
        for result in results:
            clients.append(cls(result))
        return clients
    
    @classmethod
    def count_by_trainer(cls, trainer_id):
        query = """
            SELECT COUNT(*) as total_clients
            FROM clients
            WHERE trainer_id = %(trainer_id)s
        """
        data = {'trainer_id': trainer_id}
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        if results:
            return results[0]['total_clients']
        else:
            return 0

    @classmethod
    def get_nutrition_profiles_by_trainer(cls, trainer_id):
        query = """
            SELECT c.id, c.first_name, c.last_name, 
                   (SELECT COUNT(*) FROM nutrition_profile np WHERE np.client_id = c.id) AS has_nutrition_profile 
            FROM clients c
            WHERE c.trainer_id = %(trainer_id)s;
        """
        data = {'trainer_id': trainer_id}
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        clients = []
        for result in results:
            client_data = {
                'id': result['id'],
                'first_name': result['first_name'],
                'last_name': result['last_name'],
                'has_nutrition_profile': result['has_nutrition_profile'] > 0
            }
            clients.append(client_data)
        return clients
    
    
    #UPDATE
    @classmethod
    def update(cls, data):
        date_str = data.get('dob')
        try:
            if len(date_str) == 10:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d')
            else:
                # Convert the date string from 'EEE, dd MMM yyyy HH:mm:ss GMT' to 'YYYY-MM-DD'
                date_obj = datetime.strptime(date_str, '%a, %d %b %Y %H:%M:%S %Z')
            formatted_date = date_obj.strftime('%Y-%m-%d')
            data['dob'] = formatted_date
        except ValueError as e:
            # Handle the error or re-raise it
            print(f"Error parsing date: {e}")
            raise e
        query = """
                UPDATE clients
                SET first_name = %(first_name)s, last_name = %(last_name)s, dob = %(dob)s, gender = %(gender)s, occupation = %(occupation)s, email = %(email)s, phone_number = %(phone_number)s, address = %(address)s, location_gym = %(location_gym)s, updated_at = NOW()
                WHERE id = %(id)s;"""
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        print("Running Query: ", query)
        print("With Data: ", data)
        print("Results: ", results)
        
        return results
    
    #DELETE
    @classmethod
    def delete(cls, client_id):
        query = "DELETE FROM clients WHERE id = %(id)s;"
        data = {"id": client_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return result != 0
    
    #VALIDATE
    @staticmethod
    def validate_client(client):
        errors = []
        
        if len(client['first_name']) < 2:
            errors.append("First name must be at least 2 characters.")
        
        if len(client['last_name']) < 2:
            errors.append("Last name must be at least 2 characters.")
        
        if not EMAIL_REGEX.match(client['email']): 
            errors.append("Invalid email address!")
        
        if not PHONE_REGEX.match(client['phone_number']):
            errors.append("Invalid phone number format. Use XXX-XXX-XXXX.")
        
        if Client.email_exists(client['email']):
            errors.append("Email already exists. Please use a different email.")
        
        return errors

    @classmethod
    def email_exists(cls, email):
        query = "SELECT COUNT(*) AS count FROM clients WHERE email = %(email)s;"
        data = {'email': email}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return result[0]['count'] > 0
    
    
    @classmethod
    def client_name_exists(cls, first_name, last_name):
        query = "SELECT COUNT(*) AS count FROM clients WHERE first_name = %(first_name)s AND last_name = %(last_name)s;"
        data = {'first_name': first_name, 'last_name': last_name}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return result[0]['count'] > 0
    

    @classmethod
    def phone_number_exists(cls, phone_number):
        query = "SELECT COUNT(*) AS count FROM clients WHERE phone_number = %(phone_number)s;"
        data = {'phone_number': phone_number}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return result[0]['count'] > 0

