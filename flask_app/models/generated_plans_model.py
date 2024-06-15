from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash
from datetime import datetime, timedelta

class GeneratedPlan:
    def __init__(self, data):
        self.id = data.get('id')
        self.name = data.get('name')
        self.generated_plan_details = data.get('generated_plan_details')
        self.parameters = data.get('parameters')
        self.date = data.get('date', None)
        self.completed_marked = data.get('completed_marked', 0)
        self.pinned_until = data.get('pinned_until', None)
        self.created_at = data.get('created_at', None)
        self.updated_at = data.get('updated_at', None)
        self.client_id = data.get('client_id')
        self.client_first_name = data.get('client_first_name', None)
        self.client_last_name = data.get('client_last_name', None)
    
    def serialize(self):
        return {
            'id': self.id,
            'name': self.name,
            'generated_plan_details': self.generated_plan_details,
            'parameters': self.parameters,
            'date': self.date,
            'completed_marked': self.completed_marked,
            'pinned_until': str(self.pinned_until) if self.pinned_until else None,
            'created_at': str(self.created_at),  
            'updated_at': str(self.updated_at),
            'client_id': self.client_id
        }
        
    def save(self):
        data = {
            'client_id': self.client_id,
            'name': self.name if self.name else "Custom Plan",  # Provided a default name if none provided
            'generated_plan_details': self.generated_plan_details,
            'parameters': self.parameters
        }
        query = """
        INSERT INTO generated_plans (client_id, name, generated_plan_details, parameters, completed_marked, date, created_at, updated_at) 
        VALUES (%(client_id)s, %(name)s, %(generated_plan_details)s, %(parameters)s, NOW(), NOW(), NOW());
        """
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)



    
    #READ
    @classmethod
    def get_by_id(cls, generated_id):
        query = """
            SELECT gp.*, c.first_name AS client_first_name, c.last_name AS client_last_name
            FROM generated_plans gp
            JOIN clients c ON gp.client_id = c.id
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
            WHERE client_id = %(client_id)s 
            ORDER BY created_at DESC;  
            """
        data = {'client_id': client_id}
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return [cls(result) for result in results] if results else []
    
    @classmethod
    def get_latest_by_client_id(cls, client_id):
        query = """
            SELECT generated_plans.*, clients.first_name, clients.last_name
            FROM generated_plans
            JOIN clients on generated_plans.client_id = clients.id  
            WHERE generated_plans.client_id = %(client_id)s 
            ORDER BY generated_plans.created_at DESC
            LIMIT 1;  
            """
        data = {'client_id': client_id}
        results = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        if results:
            result = results[0]
            generated_plan = cls(result)
            generated_plan.client_first_name = result.get('first_name')
            generated_plan.client_last_name = result.get('last_name')
            return generated_plan
        return None

        
    @classmethod
    def update(cls, generated_plan_id,data):
        try:
            query = """
                UPDATE generated_plans
                SET name = %(name)s, generated_plan_details = %(generated_plan_details)s,
                updated_at = NOW()
                WHERE id = %(generated_plan_id)s;"""
            params = {'generated_plan_id': generated_plan_id, **data}
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
            UPDATE generated_plans
            SET name = %(name)s, generated_plan_details = %(generated_plan_details)s
            WHERE client_id = %(client_id)s
            ORDER BY id DESC
            LIMIT 1;
            """
            result = connectToMySQL('fitness_consultation_schema').query_db(query, {
                'client_id': client_id,
                'name': data['name'],
                'generated_plan_details': data['generated_plan_details']
            })
            return True
        except Exception as e:
            print(f"An error occurred while updating: {e}")
            return False

    @classmethod
    def mark_as_completed(cls, plan_id):
        query = """
            UPDATE generated_plans
            SET completed_marked = 1, updated_at = NOW()
            WHERE id = %(plan_id)s;
        """
        data = {'plan_id': plan_id}
        return connectToMySQL('fitness_consultation_schema').query_db(query, data)
    

    @classmethod
    def pin_for_today(cls, plan_id):
        current_time = datetime.now()
        pinned_until = current_time + timedelta(hours=24)
        formatted_pinned_until = pinned_until.strftime('%Y-%m-%d %H:%M:%S')  # Ensure correct format

        # First, check if the plan is already pinned and the pin has not expired
        check_query = "SELECT pinned_until FROM generated_plans WHERE id = %s"
        try:
            result = connectToMySQL('fitness_consultation_schema').query_db(check_query, (plan_id,))
            if result:
                existing_pinned_until = result[0]['pinned_until']
                if existing_pinned_until and existing_pinned_until > current_time:
                    print(f"Plan is already pinned until {existing_pinned_until}")
                    return False  # Plan is already pinned and the pin has not expired

            # If the plan is not pinned or the pin has expired, update the pinned_until field
            update_query = "UPDATE generated_plans SET pinned_until = %s WHERE id = %s"
            data = (formatted_pinned_until, plan_id)
            connectToMySQL('fitness_consultation_schema').query_db(update_query, data)
            print(f"Plan successfully pinned until {formatted_pinned_until} for plan_id {plan_id}")
            return True
        except Exception as e:
            print(f"Error updating pinned_until for plan_id {plan_id}: {e}")
            return False
        

    @classmethod
    def check_pin_status(cls, plan_id):
        current_time = datetime.now()
        query = "SELECT pinned_until FROM generated_plans WHERE id = %s"
        try:
            result = connectToMySQL('fitness_consultation_schema').query_db(query, (plan_id,))
            if result:
                pinned_until = result[0]['pinned_until']
                if pinned_until and pinned_until > current_time:
                    return True  # Plan is pinned and the pin has not expired
            return False  # Plan is not pinned or the pin has expired
        except Exception as e:
            print(f"Error checking pin status for plan_id {plan_id}: {e}")
            return False


    @classmethod
    def unpin_plan(cls, plan_id):
        query = "UPDATE generated_plans SET pinned_until = NULL WHERE id = %s"
        data = (plan_id,)
        try:
            connectToMySQL('fitness_consultation_schema').query_db(query, data)
            return True
        except Exception as e:
            print(f"Error unpinning plan_id {plan_id}: {e}")
            return False

    
    @classmethod
    def get_pinned_plans(cls):
        query = """
            SELECT * FROM generated_plans
            WHERE pinned_until IS NOT NULL AND pinned_until > NOW()
            ORDER BY pinned_until DESC;
        """
        try:
            results = connectToMySQL('fitness_consultation_schema').query_db(query)
            return [cls(result) for result in results] if results else []
        except Exception as e:
            print(f"Error fetching pinned plans: {e}")
            return []


    
    
    @classmethod
    def delete(cls, generated_id):
        query = "DELETE FROM generated_plans WHERE id = %(id)s;"
        data = {"id": generated_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return result != 0
