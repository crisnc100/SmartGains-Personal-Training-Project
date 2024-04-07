from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash

#Flexibility:
class FlexibilityAssessment:
    def __init__(self, data):
        self.id = data['id']
        self.shoulder_flexibility = data['shoulder_flexibility']
        self.lower_body_flexibility = data['lower_body_flexibility']
        self.joint_mobility = data['joint_mobility']
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)
        self.client_id = data['client_id']

    #CREATE
    @classmethod
    def save(cls, data):
        query = """
            INSERT INTO flexibility_mobility_assessment
            (shoulder_flexibility, lower_body_flexibility, joint_mobility, created_at, updated_at, client_id) 
            VALUES 
            (%(shoulder_flexibility)s, %(lower_body_flexibility)s, %(joint_mobility)s, NOW(), NOW(), %(client_id)s);
        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
    
    #READ
    @classmethod
    def get_by_id(cls, flexibility_assessment_id):
        query = """
            SELECT fa.*, c.first_name AS client_first_name, c.last_name AS client_last_name
            FROM flexibility_mobility_assessment fa
            JOIN clients c ON fa.client_id = c.id
            WHERE fa.id = %(id)s;
        """
        data = {'id': flexibility_assessment_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None
    
    @classmethod
    def get_by_client_id(cls, client_id):
        query = """
        SELECT * FROM flexibility_mobility_assessment
        WHERE client_id = %(client_id)s;
    """
        data = {'client_id': client_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None
    
    #UPDATE
    @classmethod
    def update(cls, data):
        query = """
                UPDATE flexibility_mobility_assessment
                SET shoulder_flexibility = %(shoulder_flexibility)s,lower_body_flexibility = %(lower_body_flexibility)s, joint_mobility = %(joint_mobility)s, updated_at = NOW()
                WHERE id = %(id)s;"""
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return results
    
    #DELETE
    @classmethod
    def delete(cls, flexibility_assessment_id):
        query = "DELETE FROM flexibility_mobility_assessment WHERE id = %(id)s;"
        data = {"id": flexibility_assessment_id}
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)


#Beginner Assessment:
class BeginnerAssessment:
    def __init__(self, data):
        self.id = data['id']
        self.basic_technique = data['basic_technique']
        self.chair_sit_to_stand = data['chair_sit_to_stand']
        self.arm_curl = data['arm_curl']
        self.balance_test_results = data['balance_test_results']
        self.cardio_test = data['cardio_test']
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)
        self.client_id = data['client_id']
        
    
    #CREATE
    @classmethod
    def save(cls, data):
        basic_technique = data.get("basic_technique")
        chair_sit_to_stand = data.get("chair_sit_to_stand")
        arm_curl = data.get("arm_curl")
        balance_test_results = data.get("balance_test_results")
        cardio_test = data.get("cardio_test")
        client_id = data.get("client_id")
        query = """
            INSERT INTO beginner_assessment
            (basic_technique, chair_sit_to_stand, arm_curl, balance_test_results, cardio_test, created_at, updated_at, client_id) 
            VALUES 
            (%(basic_technique)s, %(chair_sit_to_stand)s, %(arm_curl)s, %(balance_test_results)s, %(cardio_test)s, NOW(), NOW(), %(client_id)s);
        """

        data = {
            "basic_technique": basic_technique,
            "chair_sit_to_stand": chair_sit_to_stand,
            "arm_curl": arm_curl,
            "balance_test_results": balance_test_results,
            "cardio_test": cardio_test,
            "client_id": client_id
        }
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
    
    #READ
    @classmethod
    def get_by_client_id(cls, client_id):
        query = """
        SELECT * FROM beginner_assessment
        WHERE client_id = %(client_id)s;
    """
        data = {'client_id': client_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None

    
    #UPDATE
    @classmethod
    def update(cls, data):
        query = """
                UPDATE beginner_assessment
                SET basic_technique = %(basic_technique)s, chair_sit_to_stand = %(chair_sit_to_stand)s,arm_curl = %(arm_curl)s, balance_test_results = %(balance_test_results)s, cardio_test = %(cardio_test)s, updated_at = NOW()
                WHERE client_id = %(client_id)s;"""
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return results
    
    #DELETE
    @classmethod
    def delete(cls, beginner_assessment_id):
        query = "DELETE FROM beginner_assessment WHERE id = %(id)s;"
        data = {"id": beginner_assessment_id}
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)


#Experience Assessment:
class AdvancedAssessment:
    def __init__(self, data):
        self.id = data['id']
        self.advanced_technique = data['advanced_technique']
        self.strength_max = data['strength_max']
        self.strength_endurance = data['strength_endurance']
        self.circuit = data['circuit']
        self.moderate_cardio = data['moderate_cardio']
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)
        self.client_id = data['client_id']

    
    @classmethod
    def save(cls, data):
        # Extract data from the dictionary
        advanced_technique = data.get("advanced_technique")
        strength_max = data.get("strength_max")
        strength_endurance = data.get("strength_endurance")
        circuit = data.get("circuit")
        moderate_cardio = data.get("moderate_cardio")
        client_id = data.get("client_id")

        # Insert data into the database
        query = """
            INSERT INTO advanced_assessment
            (advanced_technique, strength_max, strength_endurance, circuit, moderate_cardio, created_at, updated_at, client_id) 
            VALUES 
            (%(advanced_technique)s, %(strength_max)s, %(strength_endurance)s, %(circuit)s, %(moderate_cardio)s, NOW(), NOW(), %(client_id)s);
        """
        data = {
            "advanced_technique": advanced_technique,
            "strength_max": strength_max,
            "strength_endurance": strength_endurance,
            "circuit": circuit,
            "moderate_cardio": moderate_cardio,
            "client_id": client_id
        }
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)


    
    #READ
    @classmethod
    def get_by_client_id(cls, client_id):
        try:
            query = """
                SELECT * FROM advanced_assessment
                WHERE client_id = %(client_id)s;
                    """
            data = {'client_id': client_id}
            result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

            if result:
                return cls(result[0])
            else:
                return None
        except Exception as e:
            # Handle the exception (e.g., log the error, return a default value, etc.)
            print(f"An error occurred: {str(e)}")
            return None


    
    #UPDATE
    @classmethod
    def update(cls, data):
        query = """
                UPDATE advanced_assessment
                SET advanced_technique = %(advanced_technique)s, strength_max = %(strength_max)s, strength_endurance = %(strength_endurance)s, circuit = %(circuit)s, moderate_cardio = %(moderate_cardio)s, updated_at = NOW()
                WHERE client_id = %(client_id)s;"""
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return results
    
    #DELETE
    @classmethod
    def delete(cls, advanced_assessment_id):
        query = "DELETE FROM advanced_assessment WHERE id = %(id)s;"
        data = {"id": advanced_assessment_id}
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
    
