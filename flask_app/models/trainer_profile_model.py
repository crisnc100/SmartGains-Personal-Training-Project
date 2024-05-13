from flask_app.config.mysqlconnection import connectToMySQL

class TrainerProfile:
    def __init__(self, data):
        self.id = data['id']
        self.photo1 = data['photo1']
        self.quote1 = data['quote1']
        self.quote2 = data['quote2']
        self.created_at = data['created_at']
        self.updated_at = data['updated_at']
        self.trainer_id = data['trainer_id']

    def serialize(self):
        return {
            "id": self.id,
            "photo1": self.photo1,
            "quote1": self.quote1,
            "quote2": self.quote2,
            "created_at": str(self.created_at),  
            "updated_at": str(self.updated_at),
            "trainer_id": self.trainer_id
        }

    @classmethod
    def save(cls, data):
        query = """
            INSERT INTO trainer_profile (photo1, quote1, quote2, created_at, updated_at, trainer_id) 
            VALUES (%(photo1)s, %(quote1)s, %(quote2)s, NOW(), NOW(), %(trainer_id)s);
        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)

    @classmethod
    def get_by_trainer_id(cls, trainer_id):
        query = "SELECT * FROM trainer_profile WHERE trainer_id = %(trainer_id)s;"
        data = {'trainer_id': trainer_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        if result:
            return cls(result[0])
        return None

    @classmethod
    def update(cls, data):

        query = """
            UPDATE trainer_profile
            SET updated_at = NOW()
        """

        
        set_parts = []
        if 'photo1' in data:
            set_parts.append("photo1 = %(photo1)s")
        if 'quote1' in data:
            set_parts.append("quote1 = %(quote1)s")
        if 'quote2' in data:
            set_parts.append("quote2 = %(quote2)s")


        if set_parts:
            query += ", " + ", ".join(set_parts)

    # Add the condition
        query += " WHERE trainer_id = %(trainer_id)s;"

        return connectToMySQL('fitness_consultation_schema').query_db(query, data)

