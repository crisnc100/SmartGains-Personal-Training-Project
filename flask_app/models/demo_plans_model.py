from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash

class DemoPlan:
    def __init__(self, data):
        self.id = data.get('id')
        self.demo_plan_details = data.get('demo_plan_details')
        self.date = data.get('date', None)  # Use the current date if not provided
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)
        self.client_id = data.get('client_id')
        
    def save(self):
        data = {
            'client_id': self.client_id,
            'demo_plan_details': self.demo_plan_details
        }
        query = """
        INSERT INTO demo_plans (client_id, demo_plan_details, date, created_at, updated_at) 
        VALUES (%(client_id)s, %(demo_plan_details)s, NOW(), NOW(), NOW());
        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)


    
    #READ
    @classmethod
    def get_by_id(cls, demo_id):
        query = """
            SELECT dp.*, c.first_name AS client_first_name, c.last_name AS client_last_name
            FROM demo_plans dp
            JOIN clients c ON pl.client_id = c.id
            WHERE dp.id = %(id)s;
        """
        data = {'id': demo_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)

        if result:
            return cls(result[0])
        else:
            return None
    
    @classmethod
    def get_by_client_id(cls, client_id):
        query = """
        SELECT * FROM demo_plans
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
                UPDATE demo_plans
                SET date = %(date)s, demo_plan_details = %(demo_plan_details)s, updated_at = NOW()
                WHERE client_id = %(client_id)s;"""
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return results
    
    @classmethod
    def update_by_client_id(cls, client_id, data):
        try:
            query = "UPDATE demo_plans SET demo_plan_details = %(demo_plan_details)s WHERE client_id = %(client_id)s;"
            result = connectToMySQL('fitness_consultation_schema').query_db(query, {'client_id': client_id, 'demo_plan_details': data['demo_plan_details']})
            return True  # Assuming query_db doesn't throw an exception and updates the row successfully
        except Exception as e:
            print(f"An error occurred while updating: {e}")
            return False




    
    @classmethod
    def delete(cls, demo_id):
        query = "DELETE FROM demo_plans WHERE id = %(id)s;"
        data = {"id": demo_id}
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)