from flask_app.config.mysqlconnection import connectToMySQL
from datetime import datetime

class IntakeFormAnswers:
    def __init__(self, data):
        self.id = data.get('id')
        self.question_source = data.get('question_source')
        self.answer = data.get('answer')
        self.form_id = data.get('form_id')
        self.question_id = data.get('question_id')
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')
        self.question_text = data.get('question_text')  # Add question_text to the initializer

    
    def serialize(self):
        return {
            'id': self.id,
            'question_source': self.question_source,
            'answer': self.answer,
            'form_id': self.form_id,
            'question_id': self.question_id,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at),
            'question_text': self.question_text  # Include question_text in serialization

        }

    # CREATE or UPDATE
    @classmethod
    def save(cls, data):
        query_check = """
            SELECT id FROM intake_form_answers 
            WHERE form_id = %(form_id)s AND question_id = %(question_id)s
        """
        existing_answer = connectToMySQL('fitness_consultation_schema').query_db(query_check, data)

        if existing_answer:
            query_update = """
                UPDATE intake_form_answers
                SET answer = %(answer)s, updated_at = NOW()
                WHERE id = %(id)s
            """
            data['id'] = existing_answer[0]['id']
            try:
                return connectToMySQL('fitness_consultation_schema').query_db(query_update, data)
            except Exception as e:
                print(f"Error updating data: {e}")
                return None
        else:
            query_insert = """
                INSERT INTO intake_form_answers
                (question_source, answer, form_id, question_id, created_at, updated_at)
                VALUES
                (%(question_source)s, %(answer)s, %(form_id)s, %(question_id)s, NOW(), NOW());
            """
            try:
                return connectToMySQL('fitness_consultation_schema').query_db(query_insert, data)
            except Exception as e:
                print(f"Error inserting data: {e}")
                return None

    # READ ALL BY FORM
    @classmethod
    def get_all_by_form(cls, form_id):
        query = "SELECT * FROM intake_form_answers WHERE form_id = %(form_id)s"
        data = {'form_id': form_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            answers = [cls(row) for row in results]
            return answers
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    # READ ALL BY CLIENT
    @classmethod
    def get_all_by_client(cls, client_id):
        query = """
            SELECT a.* FROM intake_form_answers a
            JOIN intake_forms f ON a.form_id = f.id
            WHERE f.client_id = %(client_id)s
        """
        data = {'client_id': client_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            answers = [cls(row) for row in results]
            return answers
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    # READ BY ID
    @classmethod
    def get_by_id(cls, answer_id):
        query = "SELECT * FROM intake_form_answers WHERE id = %(id)s"
        data = {'id': answer_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return cls(results[0]) if results else None
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None
    
    @classmethod
    def get_all_by_form_with_question_text(cls, form_id):
        query = """
            SELECT a.*, q.question_text 
            FROM intake_form_answers a
            JOIN global_form_questions q ON a.question_id = q.id
            WHERE a.form_id = %(form_id)s
        """
        data = {'form_id': form_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            answers = [cls(row) for row in results]
            return answers
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    

    # DELETE
    @classmethod
    def delete(cls, answer_id):
        query = "DELETE FROM intake_form_answers WHERE id = %(id)s"
        data = {'id': answer_id}
        try:
            return connectToMySQL('fitness_consultation_schema').query_db(query, data)
        except Exception as e:
            print(f"Error deleting data: {e}")
            return None
