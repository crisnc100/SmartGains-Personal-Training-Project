from flask_app.config.mysqlconnection import connectToMySQL

class TrainerIntakeQuestions:
    def __init__(self, data):
        self.id = data.get('id')
        self.question_text = data.get('question_text')
        self.question_type = data.get('question_type')
        self.options = data.get('options')
        self.category = data.get('category')
        self.visual_aid_url = data.get('visual_aid_url')
        self.is_default = data.get('is_default')
        self.templates = data.get('templates')
        self.action = data.get('action')
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')
        self.trainer_id = data.get('trainer_id')
        self.global_question_id = data.get('global_question_id')
    
    def serialize(self):
        return {
            'id': self.id,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'options': self.options,
            'category': self.category,
            'visual_aid_url': self.visual_aid_url,
            'is_default': self.is_default,
            'templates': self.templates,
            'action': self.action,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at),
            'trainer_id': self.trainer_id,
            'global_question_id': self.global_question_id
        }

    # CREATE or UPDATE based on action
    @classmethod
    def update_or_create(cls, data):

        if 'visual_aid_url' not in data or not data['visual_aid_url']:
            data['visual_aid_url'] = None
        if 'is_default' not in data:
            data['is_default'] = None  # Set is_default to None if not provided
        if 'templates' not in data:
                data['templates'] = None
        existing_question = cls.get_by_global_question_id(data['trainer_id'], data['global_question_id'])
        if existing_question:
            query = """
                UPDATE trainer_intake_questions 
                SET question_text = %(question_text)s, question_type = %(question_type)s, options = %(options)s, 
                    category = %(category)s, visual_aid_url = %(visual_aid_url)s, is_default = %(is_default)s, 
                    templates = %(templates)s, action = %(action)s, updated_at = NOW()
                WHERE id = %(id)s AND trainer_id = %(trainer_id)s
            """
            data['id'] = existing_question.id
        else:
            query = """
                INSERT INTO trainer_intake_questions
                (question_text, question_type, options, category, visual_aid_url, is_default, templates, action, created_at, updated_at, trainer_id, global_question_id) 
                VALUES 
                (%(question_text)s, %(question_type)s, %(options)s, %(category)s, %(visual_aid_url)s, %(is_default)s, %(templates)s, 
                %(action)s, NOW(), NOW(), %(trainer_id)s, %(global_question_id)s);
            """
        try:
            return connectToMySQL('fitness_consultation_schema').query_db(query, data)
        except Exception as e:
            print(f"Error inserting/updating data: {e}")
            return None
    

    @classmethod
    def update_trainer_question(cls, data):
        """Force update trainer-specific questions with minimal logic for debugging purposes."""

        try:
            # Add the options field back in for testing
            query = """
                UPDATE trainer_intake_questions 
                SET question_text = %(question_text)s, question_type = %(question_type)s, options = %(options)s, 
                category = %(category)s, updated_at = NOW()
                WHERE id = %(id)s AND trainer_id = %(trainer_id)s
            """

            # Include options in the data
            update_data = {
                'question_text': data['question_text'],
                'question_type': data['question_type'],
                'options': data['options'],
                'category': data['category'],
                'id': data['id'],
                'trainer_id': data['trainer_id']
            }


            # Execute the query
            rows_affected = connectToMySQL('fitness_consultation_schema').query_db(query, update_data)

            print(f"Query executed. Affected rows: {rows_affected}")
            return rows_affected

        except Exception as e:
            print(f"Error updating trainer question: {e}")
            return None



    
    @classmethod
    def get_by_id(cls, question_id):
        query = "SELECT * FROM trainer_intake_questions WHERE id = %(id)s"
        data = {'id': question_id}
        try:
            result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return cls(result[0]) if result else None
        except Exception as e:
            print(f"Error fetching question by ID: {e}")
            return None


    # READ ALL BY TRAINER
    @classmethod
    def get_all_by_trainer(cls, trainer_id):
        query = "SELECT * FROM trainer_intake_questions WHERE trainer_id = %(trainer_id)s"
        data = {'trainer_id': trainer_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            questions = [cls(row) for row in results]
            return questions
        except Exception as e:
            print(f"Error fetching data: {e}")
            return []

    # READ BY QUESTION TEXT
    @classmethod
    def get_by_question(cls, trainer_id, question_text):
        query = "SELECT * FROM trainer_intake_questions WHERE trainer_id = %(trainer_id)s AND question_text = %(question_text)s"
        data = {'trainer_id': trainer_id, 'question_text': question_text}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return cls(results[0]) if results else None
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None
    
    # READ BY GLOBAL QUESTION ID
    @classmethod
    def get_by_global_question_id(cls, trainer_id, global_question_id):
        query = "SELECT * FROM trainer_intake_questions WHERE trainer_id = %(trainer_id)s AND global_question_id = %(global_question_id)s"
        data = {'trainer_id': trainer_id, 'global_question_id': global_question_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return cls(results[0]) if results else None
        except Exception as e:
            print(f"Error fetching data: {e}")
            return None
    
    @classmethod
    def get_all_defaults(cls, trainer_id):
        query = """
            SELECT * FROM trainer_intake_questions 
            WHERE trainer_id = %(trainer_id)s AND is_default = 1
        """
        data = {'trainer_id': trainer_id}
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return [cls(row) for row in results]  # Ensure each row is an instance of TrainerIntakeQuestions
        except Exception as e:
            print(f"Error fetching default questions for trainer_id {trainer_id}: {e}")
            return []
    
    @classmethod
    def mark_global_question_deleted(cls, data):
        # Ensure all required fields are present in the `data` dictionary
        query = """
            INSERT INTO trainer_intake_questions 
            (global_question_id, trainer_id, question_text, question_type, options, category, action, created_at, updated_at)
            VALUES (%(global_question_id)s, %(trainer_id)s, %(question_text)s, %(question_type)s, %(options)s, %(category)s, %(action)s, NOW(), NOW())
        """

        # You must provide these fields in the data before calling this method
        # `data` should contain 'question_text', 'question_type', 'options', 'category', etc.
        try:
            return connectToMySQL('fitness_consultation_schema').query_db(query, data)
        except Exception as e:
            print(f"Error marking global question as deleted: {e}")
            return None

    
    @classmethod
    def mark_trainer_question_deleted(cls, data):
        query = """
            UPDATE trainer_intake_questions 
            SET action = %(action)s, updated_at = NOW()
            WHERE id = %(id)s
        """
        connectToMySQL('fitness_consultation_schema').query_db(query, data)



    @classmethod
    def delete(cls, question_id):
        query = "DELETE FROM trainer_intake_questions WHERE id = %(id)s;"
        data = {"id": question_id}
        try:
            result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return result != 0
        except Exception as e:
            print(f"Error deleting data: {e}")
            return False

    @classmethod
    def delete_all_by_trainer(cls, trainer_id):
        query = "DELETE FROM trainer_intake_questions WHERE trainer_id = %(trainer_id)s"
        data = {"trainer_id": trainer_id}
        try:
            return connectToMySQL('fitness_consultation_schema').query_db(query, data)
        except Exception as e:
            print(f"Error deleting data: {e}")
            return None