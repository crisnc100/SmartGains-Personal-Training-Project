from flask_app.config.mysqlconnection import connectToMySQL

class NutritionProfile:
    def __init__(self, data):
        self.id = data.get('id')
        self.height = data.get('height')
        self.weight = data.get('weight')
        self.dob = data.get('dob')
        self.gender = data.get('gender')
        self.bodyfat_est = data.get('bodyfat_est')
        self.health_conditions = data.get('health_conditions')
        self.allergies = data.get('allergies')
        self.current_diet = data.get('current_diet')
        self.dietary_preferences = data.get('dietary_preferences')
        self.favorite_foods = data.get('favorite_foods')
        self.disliked_foods = data.get('disliked_foods')
        self.meal_preferences = data.get('meal_preferences')
        self.meal_snack_preferences = data.get('meal_snack_preferences')
        self.meal_prep_habits = data.get('meal_prep_habits')
        self.hydration = data.get('hydration')
        self.current_cheat_meals = data.get('current_cheat_meals')
        self.common_cravings = data.get('common_cravings')
        self.specific_days_indulgence = data.get('specific_days_indulgence')
        self.nutritional_goals = data.get('nutritional_goals')
        self.dieting_challenges = data.get('dieting_challenges')
        self.typical_work_schedule = data.get('typical_work_schedule')
        self.activity_level_neat = data.get('activity_level_neat')
        self.average_daily_steps = data.get('average_daily_steps')
        self.activity_level_eat = data.get('activity_level_eat')
        self.exercise_days_per_week = data.get('exercise_days_per_week')
        self.gym_duration = data.get('gym_duration')
        self.additional_notes = data.get('additional_notes')
        self.normal_tdee = data.get('normal_tdee')
        self.average_tdee = data.get('average_tdee')
        self.created_at = data.get('created_at')
        self.updated_at = data.get('updated_at')
        self.client_id = data.get('client_id')
        self.client_first_name = data.get('client_first_name')
        self.client_last_name = data.get('client_last_name')
    
    def serialize(self):
        return {
            'id': self.id,
            'height': self.height,
            'weight': self.weight,
            'dob': self.dob,
            'gender': self.gender,
            'bodyfat_est': self.bodyfat_est,
            'health_conditions': self.health_conditions,
            'allergies': self.allergies,
            'current_diet': self.current_diet,
            'dietary_preferences': self.dietary_preferences,
            'favorite_foods': self.favorite_foods,
            'disliked_foods': self.disliked_foods,
            'meal_preferences': self.meal_preferences,
            'meal_snack_preferences': self.meal_snack_preferences,
            'meal_prep_habits': self.meal_prep_habits,
            'hydration': self.hydration,
            'current_cheat_meals': self.current_cheat_meals,
            'common_cravings': self.common_cravings,
            'specific_days_indulgence': self.specific_days_indulgence,
            'nutritional_goals': self.nutritional_goals,
            'dieting_challenges': self.dieting_challenges,
            'typical_work_schedule': self.typical_work_schedule,
            'activity_level_neat': self.activity_level_neat,
            'activity_level_eat': self.activity_level_eat,
            'exercise_days_per_week': self.exercise_days_per_week,
            'gym_duration': self.gym_duration,
            'additional_notes': self.additional_notes,
            'normal_tdee': self.normal_tdee,
            'average_tdee': self.average_tdee,
            'created_at': str(self.created_at),  
            'updated_at': str(self.updated_at),
            'client_id': self.client_id
        }

    @classmethod
    def save(cls, data):
        query = """
        INSERT INTO nutrition_profile (height, weight, dob, gender, bodyfat_est, health_conditions, allergies, dietary_preferences, 
        favorite_foods, disliked_foods, meal_preferences, meal_snack_preference, meal_prep_habits, hydration, 
        current_cheat_meals, common_cravings, specific_days_indulgence, nutritional_goals, dieting_challenges, 
        typical_work_schedule, activity_level_neat, activity_level_eat, exercise_days_per_week, 
        gym_duration, additional_notes, normal_tdee, average_tdee, created_at, updated_at, client_id)
        VALUES (%(height)s, %(weight)s, %(dob)s, %(gender)s, %(bodyfat_est)s, %(health_conditions)s, %(allergies)s, %(dietary_preferences)s, 
        %(favorite_foods)s, %(disliked_foods)s, %(meal_preferences)s, %(meal_snack_preference)s, %(meal_prep_habits)s, 
        %(hydration)s, %(current_cheat_meals)s, %(common_cravings)s, %(specific_days_indulgence)s, %(nutritional_goals)s, 
        %(dieting_challenges)s, %(typical_work_schedule)s, %(activity_level_neat)s, 
        %(activity_level_eat)s, %(exercise_days_per_week)s, %(gym_duration)s, %(additional_notes)s, %(normal_tdee)s, 
        %(average_tdee)s, NOW(), NOW(), %(client_id)s)
        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
    
    # READ
    @classmethod
    def get_by_id(cls, nutrition_profile_id):
        query = """
            SELECT np.*, cl.first_name AS client_first_name, cl.last_name AS client_last_name
            FROM nutrition_profile np
            JOIN clients cl ON np.client_id = cl.id
            WHERE np.id = %(id)s;
        """
        data = {'id': nutrition_profile_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None
    
    @classmethod
    def get_by_client_id(cls, client_id):
        query = """
        SELECT * FROM nutrition_profile
        WHERE client_id = %(client_id)s;
        """
        data = {'client_id': client_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None
        
    @classmethod
    def get_tdee_variables(cls, client_id):
        query = """
        SELECT height, weight, dob, gender, bodyfat_est, activity_level_neat, activity_level_eat, exercise_days_per_week, gym_duration
        FROM nutrition_profile
        WHERE client_id = %(client_id)s;
        """
        data = {'client_id': client_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        
        if result:
            return result[0]
        else:
            return None
    
    @classmethod
    def update_tdee(cls, client_id, normal_tdee, average_tdee):
        query = """
        UPDATE nutrition_profile
        SET normal_tdee = %(normal_tdee)s, average_tdee = %(average_tdee)s, updated_at = NOW()
        WHERE client_id = %(client_id)s;
        """
        data = {
            'client_id': client_id,
            'normal_tdee': normal_tdee,
            'average_tdee': average_tdee
        }
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)

    
    # UPDATE
    @classmethod
    def update(cls, data):
        query = """
            UPDATE nutrition_profile
            SET 
                height = %(height)s,
                weight = %(weight)s,
                dob = %(dob)s,
                gender = %(gender)s,
                bodyfat_est = %(bodyfat_est)s,
                health_conditions = %(health_conditions)s,
                allergies = %(allergies)s,
                dietary_preferences = %(dietary_preferences)s,
                favorite_foods = %(favorite_foods)s,
                disliked_foods = %(disliked_foods)s,
                meal_preferences = %(meal_preferences)s,
                meal_snack_preference = %(meal_snack_preference)s,
                meal_prep_habits = %(meal_prep_habits)s,
                hydration = %(hydration)s,
                current_cheat_meals = %(current_cheat_meals)s,
                common_cravings = %(common_cravings)s,
                specific_days_indulgence = %(specific_days_indulgence)s,
                nutritional_goals = %(nutritional_goals)s,
                dieting_challenges = %(dieting_challenges)s,
                typical_work_schedule = %(typical_work_schedule)s,
                activity_level_neat = %(activity_level_neat)s,
                activity_level_eat = %(activity_level_eat)s,
                exercise_days_per_week = %(exercise_days_per_week)s,
                gym_duration = %(gym_duration)s,
                additional_notes = %(additional_notes)s,
                normal_tdee = %(normal_tdee)s,
                average_tdee = %(average_tdee)s,
                updated_at = NOW()
            WHERE id = %(id)s;
        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)

    @classmethod
    def delete(cls, nutrition_profile_id):
        query = "DELETE FROM nutrition_profile WHERE id = %(id)s;"
        data = {"id": nutrition_profile_id}
        result =  connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return result != 0
