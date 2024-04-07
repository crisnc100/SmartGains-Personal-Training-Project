from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash

class GeneratedPlan:
    def __init__(self, data):
        self.id = data.get('id')
        self.name = data.get('name')
        self.generated_plan_details = data.get('generated_plan_details')
        self.date = data.get('date', None)  # Use the current date if not provided
        self.updated_at = data.get('updated_at', None)
        self.client_id = data.get('client_id')
        
    def save(self):
        data = {
            'client_id': self.client_id,
            'name': self.name,
            'generated_plan_details': self.generated_plan_details
        }
        query = """
        INSERT INTO generated_plans (client_id, name, generated_plan_details, date, updated_at) 
        VALUES (%(client_id)s, %(name)s, %(generated_plan_details)s, NOW(), NOW());
        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)


    
    #READ
    @classmethod
    def get_by_id(cls, generated_id):
        query = """
            SELECT gp.*, c.first_name AS client_first_name, c.last_name AS client_last_name
            FROM generated_plans gp
            JOIN clients c ON pl.client_id = c.id
            WHERE gp.id = %(id)s;
        """
        data = {'id': generated_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None
    
    @classmethod
    def get_by_client_id(cls, client_id):
        query = """
        SELECT * FROM generated_plans
        WHERE client_id = %(client_id)s;
    """
        data = {'client_id': client_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None
        
    @classmethod
    def update(cls, data):
        query = """
                UPDATE generated_plans
                SET name = %(name)s, generated_plan_details = %(generated_plan_details)s, date = %(date)s,  updated_at = NOW()
                WHERE client_id = %(client_id)s;"""
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return results
    
    @classmethod
    def update_by_client_id(cls, client_id, data):
        try:
            query = "UPDATE generated_plans SET generated_plan_details = %(generated_plan_details)s WHERE client_id = %(client_id)s;"
            result = connectToMySQL('fitness_consultation_schema').query_db(query, {'client_id': client_id, 'generated_plan_details': data['generated_plan_details']})
            return True  # Assuming query_db doesn't throw an exception and updates the row successfully
        except Exception as e:
            print(f"An error occurred while updating: {e}")
            return False




    
    @classmethod
    def delete(cls, generated_id):
        query = "DELETE FROM generated_plans WHERE id = %(id)s;"
        data = {"id": generated_id}
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)