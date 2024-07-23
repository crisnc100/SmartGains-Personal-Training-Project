from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash

class GlobalFormQuestions:
    def __init__(self, data):
        self.id = data.get('id')
        self.question_text = data.get('question_text')
        self.question_type = data.get('question_type')
        self.options = data.get('options')
        self.category = data.get('category')
        self.visual_aid_url = data.get('visual_aid_url')
        self.is_default = data.get('is_default')
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')
    
    def serialize(self):
        return {
            'id': self.id,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'options': self.options,
            'category': self.category,
            'visual_aid_url': self.visual_aid_url,
            'is_default': self.is_default,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at)
        }

    # CREATE
    @classmethod
    def save(cls, data):
        query = """
            INSERT INTO global_form_questions
            (question_text, question_type, options, category, visual_aid_url, created_at, updated_at) 
            VALUES 
            (%(question_text)s, %(question_type)s, %(options)s, %(category)s, %(visual_aid_url)s, NOW(), NOW());
        """
        try:
            return connectToMySQL('fitness_consultation_schema').query_db(query, data)
        except Exception as e:
            print(f"Error inserting data: {e}")
            return None

    @classmethod
    def get_all(cls):
        query = "SELECT * FROM global_form_questions"
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query)
            questions = [cls(row) for row in results]
            return questions
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []
    
    @classmethod
    def get_by_question(cls, question_text):
        query = "SELECT * FROM global_form_questions WHERE question_text = %(question_text)s"
        data = {'question_text': question_text}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return cls(results[0]) if results else None
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None
    
    @classmethod
    def get_all_questions(cls):
        query = "SELECT id, question_text FROM global_form_questions"
        results = connectToMySQL('fitness_consultation_schema').query_db(query)
        return results

    @classmethod
    def get_by_category(cls, category):
        query = "SELECT * FROM global_form_questions WHERE category = %(category)s"
        data = {'category': category}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            categories = [cls(row) for row in results]
            return categories
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []
        
    
    @classmethod
    def get_all_defaults(cls):
        query = "SELECT * FROM global_form_questions WHERE is_default = 1"
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query)
            return [cls(row) for row in results]
        except Exception as e:
            print(f"Error fetching default questions: {e}")
            return []
