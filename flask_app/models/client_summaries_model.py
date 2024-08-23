from flask_app.config.mysqlconnection import connectToMySQL
from datetime import datetime

class ClientSummaries:
    def __init__(self, id=None, summary_text=None, summary_prompt=None, summary_type=None, goals=None, medical_history=None, 
                 physical_limitations=None, exercise_preferences=None, lifestyle_factors=None, 
                 motivation=None, current_exercise_routine=None, challenges=None, 
                 created_at=None, updated_at=None, client_id=None, form_id=None):
        self.id = id
        self.summary_text = summary_text
        self.summary_prompt = summary_prompt
        self.summary_type = summary_type
        self.goals = goals
        self.medical_history = medical_history
        self.physical_limitations = physical_limitations
        self.exercise_preferences = exercise_preferences
        self.lifestyle_factors = lifestyle_factors
        self.motivation = motivation
        self.current_exercise_routine = current_exercise_routine
        self.challenges = challenges
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
            'goals': self.goals,
            'medical_history': self.medical_history,
            'physical_limitations': self.physical_limitations,
            'exercise_preferences': self.exercise_preferences,
            'lifestyle_factors': self.lifestyle_factors,
            'motivation': self.motivation,
            'current_exercise_routine': self.current_exercise_routine,
            'challenges': self.challenges,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at),
            'client_id': self.client_id,
            'form_id': self.form_id,
            'client_first_name': getattr(self, 'client_first_name', None),
            'client_last_name': getattr(self, 'client_last_name', None),
            'client_age': getattr(self, 'client_age', None),
            'client_gender': getattr(self, 'client_gender', None)
        }
    
    def save(self):
        data = {
            'summary_text': self.summary_text,
            'summary_prompt': self.summary_prompt,
            'summary_type': self.summary_type,
            'goals': self.goals,
            'medical_history': self.medical_history,
            'physical_limitations': self.physical_limitations,
            'exercise_preferences': self.exercise_preferences,
            'lifestyle_factors': self.lifestyle_factors,
            'motivation': self.motivation,
            'current_exercise_routine': self.current_exercise_routine,
            'challenges': self.challenges,
            'client_id': self.client_id,
            'form_id': self.form_id
        }
    
        print("Data to be inserted:", data)  # Debugging line
    
        query = """
        INSERT INTO client_summaries (summary_text, summary_prompt, summary_type, goals, medical_history, 
        physical_limitations, exercise_preferences, lifestyle_factors, motivation, current_exercise_routine, 
        challenges, client_id, form_id, 
        created_at, updated_at) 
        VALUES (%(summary_text)s, %(summary_prompt)s, %(summary_type)s, %(goals)s, %(medical_history)s, 
        %(physical_limitations)s, %(exercise_preferences)s, %(lifestyle_factors)s, %(motivation)s, 
        %(current_exercise_routine)s, %(challenges)s, %(client_id)s, %(form_id)s, NOW(), NOW());
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
        query = """
        SELECT cs.*, c.first_name, c.last_name, c.dob, c.gender
        FROM client_summaries cs
        JOIN clients c ON cs.client_id = c.id
        WHERE cs.client_id = %(client_id)s
        ORDER BY cs.created_at DESC
        """
        data = {'client_id': client_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            summaries = []
            for row in results:
                summary = cls(row)
                summary.client_first_name = row.get('first_name')
                summary.client_last_name = row.get('last_name')
                summaries.append(summary)
            return summaries
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






