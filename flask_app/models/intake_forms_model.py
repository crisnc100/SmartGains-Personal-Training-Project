from flask_app.config.mysqlconnection import connectToMySQL
from datetime import datetime

class IntakeForms:
    def __init__(self, data):
        self.id = data.get('id')
        self.form_type = data.get('form_type')
        self.status = data.get('status', 'draft')
        self.client_id = data.get('client_id')
        self.trainer_id = data.get('trainer_id')
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')
        self.client_first_name = data.get('client_first_name', None)
        self.client_last_name = data.get('client_last_name', None)
    
    def serialize(self):
        return {
            'id': self.id,
            'form_type': self.form_type,
            'status': self.status,
            'client_id': self.client_id,
            'trainer_id': self.trainer_id,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at)
        }

    # CREATE
    @classmethod
    def save(cls, data):
        query = """
            INSERT INTO intake_forms
            (form_type, status, client_id, trainer_id, created_at, updated_at) 
            VALUES 
            (%(form_type)s, %(status)s, %(client_id)s, %(trainer_id)s, NOW(), NOW());
        """
        try:
            connection = connectToMySQL('fitness_consultation_schema')
            form_id = connection.query_db(query, data)
            return form_id
        except Exception as e:
            print(f"Error inserting data: {e}")
            return None

    # READ ALL
    @classmethod
    def get_all(cls):
        query = "SELECT * FROM intake_forms"
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query)
            forms = [cls(row) for row in results]
            return forms
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    # READ BY ID
    @classmethod
    def get_by_id(cls, form_id):
        query = "SELECT * FROM intake_forms WHERE id = %(id)s"
        data = {'id': form_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return cls(results[0]) if results else None
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None
    
    @classmethod
    def get_by_client_and_type(cls, client_id, form_type):
        query = """
        SELECT i.*, c.first_name AS client_first_name, c.last_name AS client_last_name
        FROM intake_forms i
        JOIN clients c ON i.client_id = c.id
        WHERE i.client_id = %(client_id)s
        AND i.form_type = %(form_type)s
        LIMIT 1
        """
        data = {
            'client_id': client_id,
            'form_type': form_type
        }
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            if results:
                form_data = results[0]
                return {
                    'id': form_data['id'],
                    'form_type': form_data['form_type'],
                    'status': form_data['status'],
                    'client_id': form_data['client_id'],
                    'trainer_id': form_data['trainer_id'],
                    'created_at': form_data['created_at'],
                    'updated_at': form_data['updated_at'],
                    'client_first_name': form_data['client_first_name'],
                    'client_last_name': form_data['client_last_name']
                }
            return None
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None


    # READ BY CLIENT
    @classmethod
    def get_by_client_id(cls, client_id):
        query = "SELECT * FROM intake_forms WHERE client_id = %(client_id)s"
        data = {'client_id': client_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            forms = [cls(row) for row in results]
            return forms
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None

    # READ BY TRAINER
    @classmethod
    def get_by_trainer_id(cls, trainer_id):
        query = "SELECT * FROM intake_forms WHERE trainer_id = %(trainer_id)s"
        data = {'trainer_id': trainer_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            forms = [cls(row) for row in results]
            return forms
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None
    
    #Update
    @classmethod
    def update(cls, data):
        query = """
            UPDATE intake_forms 
            SET status = %(status)s, updated_at = NOW()
            WHERE id = %(id)s
        """
        try:
            #print(f"Running query: {query} with data: {data}")
            connectToMySQL('fitness_consultation_schema').query_db(query, data)
            #print("Query executed successfully.")
        except Exception as e:
            #print(f"Error updating data: {e}")
            raise

    # DELETE
    @classmethod
    def delete(cls, form_id):
        query = "DELETE FROM intake_forms WHERE id = %(id)s"
        data = {'id': form_id}
        try:
            return connectToMySQL('fitness_consultation_schema').query_db(query, data)
        except Exception as e:
            print(f"Error deleting data: {e}")
            return None
