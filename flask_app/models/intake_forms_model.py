from flask_app.config.mysqlconnection import connectToMySQL

class IntakeForms:
    def __init__(self, data):
        self.id = data.get('id')
        self.form_type = data.get('form_type')
        self.client_id = data.get('client_id')
        self.trainer_id = data.get('trainer_id')
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')
    
    def serialize(self):
        return {
            'id': self.id,
            'form_type': self.form_type,
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
            (form_type, client_id, trainer_id, created_at, updated_at) 
            VALUES 
            (%(form_type)s, %(client_id)s, %(trainer_id)s, NOW(), NOW());
        """
        try:
            return connectToMySQL('fitness_consultation_schema').query_db(query, data)
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
