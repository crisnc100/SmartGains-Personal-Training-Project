from flask_app.config.mysqlconnection import connectToMySQL
from datetime import datetime

class ClientSummaries:
    def __init__(self, id=None, summary_text=None, summary_prompt=None, summary_type=None, created_at=None, updated_at=None, client_id=None, form_id=None):
        self.id = id
        self.summary_text = summary_text
        self.summary_prompt = summary_prompt
        self.summary_type = summary_type
        self.created_at = created_at
        self.updated_at = updated_at
        self.client_id = client_id
        self.form_id = form_id

    

    def serialize(self):
        return {
            'id': self.id,
            'summary_text': self.summary_text,
            'summary_prompt': self.summary_prompt,
            'summary_type': self.summary_type,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at),
            'client_id': self.client_id,
            'form_id': self.form_id
        }
    
    def save(self):
        data = {
            'summary_text': self.summary_text,
            'summary_prompt': self.summary_prompt,
            'summary_type': self.summary_type,
            'client_id': self.client_id,
            'form_id': self.form_id
        }
    
        print("Data to be inserted:", data)  # Debugging line
    
        query = """
        INSERT INTO client_summaries (summary_text, summary_prompt, summary_type, client_id, form_id, 
        created_at, updated_at) 
        VALUES (%(summary_text)s, %(summary_prompt)s, %(summary_type)s, %(client_id)s, %(form_id)s, NOW(), NOW());
        """
        try:
            result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            print("Insert result:", result)  # Confirm successful insertion
            return result
        except Exception as e:
            print(f"Error inserting data: {e}")  # Log the error with details
            return None

    
       # READ BY ID
    @classmethod
    def get_by_id(cls, summary_id):
        query = "SELECT * FROM client_summaries WHERE id = %(id)s"
        data = {'id': summary_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return cls(results[0]) if results else None
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None
    

    @classmethod
    def get_all_by_client_id(cls, client_id):
        query = "SELECT * FROM client_summaries WHERE client_id = %(client_id)s ORDER BY created_at DESC"
        data = {'client_id': client_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return [cls(row) for row in results]
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    def update(self):
        data = {
            'id': self.id,
            'summary_text': self.summary_text,
            'summary_prompt': self.summary_prompt,
            'summary_type': self.summary_type
        }
        query = """
        UPDATE client_summaries 
        SET summary_text = %(summary_text)s, 
            summary_prompt = %(summary_prompt)s, 
            summary_type = %(summary_type)s, 
            updated_at = NOW() 
        WHERE id = %(id)s
        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
    

    @classmethod
    def get_latest_by_client_id(cls, client_id):
        query = """
        SELECT * FROM client_summaries 
        WHERE client_id = %(client_id)s 
        ORDER BY created_at DESC LIMIT 1
        """
        data = {'client_id': client_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return cls(results[0]) if results else None
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None
        
    @classmethod
    def search_summaries(cls, client_id, search_term=None, summary_type=None):
        query = """
        SELECT * FROM client_summaries 
        WHERE client_id = %(client_id)s
        """
        data = {'client_id': client_id}
        if search_term:
            query += " AND (summary_text LIKE %(search_term)s OR summary_prompt LIKE %(search_term)s)"
            data['search_term'] = f"%{search_term}%"
        if summary_type:
            query += " AND summary_type = %(summary_type)s"
            data['summary_type'] = summary_type

        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return [cls(row) for row in results]
        except Exception as e:
            print(f"Error searching data: {e}")
            return []
        
    
    @classmethod
    def get_prompt_by_id(cls, summary_id):
        query = "SELECT summary_prompt FROM client_summaries WHERE id = %(id)s"
        data = {'id': summary_id}
        try:
            result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return result[0]['summary_prompt'] if result else None
        except Exception as e:
            print(f"Error fetching prompt: {e}")
            return None
        
    @classmethod
    def get_latest_prompt_by_client_id(cls, client_id):
        query = """
        SELECT summary_prompt FROM client_summaries 
        WHERE client_id = %(client_id)s 
        ORDER BY created_at DESC LIMIT 1
        """
        data = {'client_id': client_id}
        try:
            result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return result[0]['summary_prompt'] if result else None
        except Exception as e:
            print(f"Error fetching latest prompt: {e}")
            return None


    @classmethod
    def get_prompt_by_client_and_type(cls, client_id, summary_type):
        query = """
        SELECT summary_prompt FROM client_summaries 
        WHERE client_id = %(client_id)s AND summary_type = %(summary_type)s
        ORDER BY created_at DESC LIMIT 1

        """
        data = {'client_id': client_id, 'summary_type': summary_type}
        try:
            result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return result[0]['summary_prompt'] if result else None
        except Exception as e:
            print(f"Error fetching prompt by type: {e}")
            return None






