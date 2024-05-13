from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash

class DemoPlan:
    def __init__(self, data):
        self.id = data.get('id')
        self.name = data.get('name')
        self.demo_plan_details = data.get('demo_plan_details')
        self.date = data.get('date', None)  
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)
        self.client_id = data.get('client_id')
        self.client_first_name = data.get('client_first_name', None)
        self.client_last_name = data.get('client_last_name', None)
    
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'demo_plan_details': self.demo_plan_details,
            'date': self.date,
            'created_at': str(self.created_at),  
            'updated_at': str(self.updated_at),
            'client_id': self.client_id
        }
        
    def save(self):
        data = {
            'client_id': self.client_id,
            'name': self.name if self.name else "Quick 3-Day Plan",  # Provide a default name if none provided
            'demo_plan_details': self.demo_plan_details
        }
        query = """
        INSERT INTO demo_plans (client_id, name, demo_plan_details, date, created_at, updated_at) 
        VALUES (%(client_id)s, %(name)s, %(demo_plan_details)s, NOW(), NOW(), NOW());
        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)



    
    #READ
    @classmethod
    def get_by_id(cls, demo_id):
        query = """
            SELECT dp.*, c.first_name AS client_first_name, c.last_name AS client_last_name
            FROM demo_plans dp
            JOIN clients c ON dp.client_id = c.id
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
            SELECT * FROM demo_plans WHERE client_id = %(client_id)s;
    """
        data = {'client_id': client_id}
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return [cls(result) for result in results] if results else []
    
    @classmethod
    def get_latest_by_client_id(cls, client_id):
        query = """
            SELECT demo_plans.*, clients.first_name, clients.last_name 
            FROM demo_plans
            JOIN clients ON demo_plans.client_id = clients.id
            WHERE demo_plans.client_id = %(client_id)s
            ORDER BY demo_plans.created_at DESC
            LIMIT 1;
            """
        data = {'client_id': client_id}
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        if results:
            result = results[0]
            demo_plan = cls(result)
            demo_plan.client_first_name = result.get('first_name')
            demo_plan.client_last_name = result.get('last_name')
            return demo_plan
        return None

        
    @classmethod
    def update(cls, demo_plan_id, data):
        try:
            query = """
                UPDATE demo_plans
                SET name = %(name)s, demo_plan_details = %(demo_plan_details)s
                WHERE id = %(demo_plan_id)s;
            """
            params = {'demo_plan_id': demo_plan_id, **data}
            result = connectToMySQL('fitness_consultation_schema').query_db(query, params)
            if result is not None and result > 0:  
                return True  
            else:
                return False  
        except Exception as e:
            print(f"An error occurred while updating: {e}")
            return False
    
    @classmethod
    def update_by_client_id(cls, client_id, data):
        try:
            query = """
            UPDATE demo_plans
            SET name = %(name)s, demo_plan_details = %(demo_plan_details)s
            WHERE client_id = %(client_id)s
            ORDER BY id DESC
            LIMIT 1;
            """
            result = connectToMySQL('fitness_consultation_schema').query_db(query, {
                'client_id': client_id,
                'name': data['name'],
                'demo_plan_details': data['demo_plan_details']
            })
            return True
        except Exception as e:
            print(f"An error occurred while updating: {e}")
            return False


    
    @classmethod
    def delete(cls, demo_id):
        query = "DELETE FROM demo_plans WHERE id = %(id)s;"
        data = {"id": demo_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return result != 0  
