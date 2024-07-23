from flask_app.config.mysqlconnection import connectToMySQL

class TrainerIntakeQuestions:
    def __init__(self, data):
        self.id = data.get('id')
        self.question_text = data.get('question_text')
        self.question_type = data.get('question_type')
        self.options = data.get('options')
        self.category = data.get('category')
        self.visual_aid_url = data.get('visual_aid_url')
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')
        self.trainer_id = data.get('trainer_id')
    
    def serialize(self):
        return {
            'id': self.id,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'options': self.options,
            'category': self.category,
            'visual_aid_url': self.visual_aid_url,
            'created_at': str(self.created_at),
            'updated_at': str(self.updated_at),
            'trainer_id': self.trainer_id,
        }

    # CREATE
    @classmethod
    def save(cls, data):
        query = """
            INSERT INTO trainer_intake_questions
            (question_text, question_type, options, category, visual_aid_url, created_at, updated_at, trainer_id) 
            VALUES 
            (%(question_text)s, %(question_type)s, %(options)s, %(category)s, %(visual_aid_url)s, NOW(), NOW(), %(trainer_id)s);
        """
        try:
            return connectToMySQL('fitness_consultation_schema').query_db(query, data)
        except Exception as e:
            print(f"Error inserting data: {e}")
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

    # UPDATE
    @classmethod
    def update(cls, data):
        query = """
            UPDATE trainer_intake_questions 
            SET question_text = %(question_text)s, question_type = %(question_type)s, options = %(options)s, 
                category = %(category)s, visual_aid_url = %(visual_aid_url)s, updated_at = NOW()
            WHERE id = %(id)s AND trainer_id = %(trainer_id)s
        """
        try:
            return connectToMySQL('fitness_consultation_schema').query_db(query, data)
        except Exception as e:
            print(f"Error updating data: {e}")
            return None

    # DELETE (Soft Delete)
    @classmethod
    def delete(cls, trainer_question_id):
        query = "DELETE FROM trainer_intake_questions WHERE id = %(id)s;"
        data = {"id": trainer_question_id}
        try:
            result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return result != 0
        except Exception as e:
            print(f"Error deleting data: {e}")
            return False
