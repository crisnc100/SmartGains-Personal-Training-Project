from flask_app.config.mysqlconnection import connectToMySQL

class Consultation:
    def __init__(self, data):
        self.id = data['id']
        self.prior_exercise_programs = data['prior_exercise_programs']
        self.exercise_habits = data['exercise_habits']
        self.fitness_goals = data['fitness_goals']
        self.progress_measurement = data['progress_measurement']
        self.area_specifics = data['area_specifics']
        self.exercise_likes = data['exercise_likes']
        self.exercise_dislikes = data['exercise_dislikes']
        self.diet_description = data['diet_description']
        self.dietary_restrictions = data['dietary_restrictions']
        self.processed_food_consumption = data['processed_food_consumption']
        self.daily_water_intake = data['daily_water_intake']
        self.daily_routine = data['daily_routine']
        self.stress_level = data['stress_level']
        self.smoking_alcohol_habits = data['smoking_alcohol_habits']
        self.hobbies = data['hobbies']
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)
        self.client_id = data['client_id']

    #CREATE
    @classmethod
    def save(cls, data):
        query = """
            INSERT INTO consultation
            (prior_exercise_programs, exercise_habits, fitness_goals, progress_measurement, area_specifics, exercise_likes, exercise_dislikes, diet_description, dietary_restrictions, processed_food_consumption, daily_water_intake, daily_routine, stress_level, smoking_alcohol_habits, hobbies, created_at, updated_at, client_id) 
            VALUES 
            (%(prior_exercise_programs)s, %(exercise_habits)s, %(fitness_goals)s, %(progress_measurement)s, %(area_specifics)s, %(exercise_likes)s, %(exercise_dislikes)s, %(diet_description)s, %(dietary_restrictions)s, %(processed_food_consumption)s, %(daily_water_intake)s, %(daily_routine)s, %(stress_level)s, %(smoking_alcohol_habits)s, %(hobbies)s, NOW(), NOW(), %(client_id)s);
        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
    

    #READ
    @classmethod
    def get_by_id(cls, consultation_id):
        query = """
            SELECT c.*, cl.first_name AS client_first_name, cl.last_name AS client_last_name
            FROM consultation c
            JOIN clients cl ON c.client_id = cl.id
            WHERE c.id = %(id)s;
        """
        data = {'id': consultation_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None
    
    @classmethod
    def get_by_client_id(cls, client_id):
        query = """
        SELECT * FROM consultation
        WHERE client_id = %(client_id)s;
    """
        data = {'client_id': client_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None

    @classmethod
    def get_all(cls):
        query = """
            SELECT c.*, cl.first_name AS client_first_name, cl.last_name AS client_last_name
            FROM consultation c
            JOIN clients cl ON c.client_id = cl.id;
        """
        results = connectToMySQL('fitness_consultation_schema').query_db(query)
        consultations = []
        for consultation in results:
            consultations.append(cls(consultation))
        return consultations
    
    #UPDATE
    @classmethod
    def update(cls, data):
        query = """
                UPDATE consultation
                SET prior_exercise_programs = %(prior_exercise_programs)s,
                    exercise_habits = %(exercise_habits)s,
                    fitness_goals = %(fitness_goals)s,
                    progress_measurement = %(progress_measurement)s,
                    area_specifics = %(area_specifics)s,
                    exercise_likes = %(exercise_likes)s,
                    exercise_dislikes = %(exercise_dislikes)s,
                    diet_description = %(diet_description)s,
                    dietary_restrictions = %(dietary_restrictions)s,
                    processed_food_consumption = %(processed_food_consumption)s,
                    daily_water_intake = %(daily_water_intake)s,
                    daily_routine = %(daily_routine)s,
                    stress_level = %(stress_level)s,
                    smoking_alcohol_habits = %(smoking_alcohol_habits)s,
                    hobbies = %(hobbies)s,
                    updated_at = NOW()
                WHERE id = %(id)s;
        """
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return results
    #DELETE
    @classmethod
    def delete(cls, consultation_id):
        query = "DELETE FROM consultation WHERE id = %(id)s;"
        data = {"id": consultation_id}
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)


