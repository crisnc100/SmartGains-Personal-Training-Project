from flask_app.config.mysqlconnection import connectToMySQL
from flask import flash, json
from datetime import datetime, timedelta
import logging

class DemoPlan:
    def __init__(self, data):
        self.id = data.get('id')
        self.name = data.get('name')
        self.demo_plan_details = data.get('demo_plan_details')
        self.date = data.get('date', None)  
        self.completed_marked = data.get('completed_marked', 0)
        self.day_completion_status = data.get('day_completion_status') or '{}'
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
            'demo_plan_details': self.demo_plan_details,
            'date': self.date,
            'completed_marked': self.completed_marked,
            'day_completion_status': self.day_completion_status,
            'pinned_until': str(self.pinned_until) if self.pinned_until else None,
            'created_at': str(self.created_at),  
            'updated_at': str(self.updated_at),
            'client_id': self.client_id
        }
        
    def save(self):
        data = {
            'client_id': self.client_id,
            'name': self.name if self.name else "Quick 3-Day Plan",  # Provided a default name if none provided
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
            if result is not None and result > 0:  # Checking if result is not None and greater than zero
                return True  # True if the update was successful (i.e., affected at least one row)
            else:
                return False  # False if no rows were affected or result was None
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
    def update_day_completion(cls, plan_id, day_index):
        try:
            plan = cls.get_by_id(plan_id)
            if not plan:
                logging.error(f'Plan with id {plan_id} not found')
                return False

            day_completion_status = json.loads(plan.day_completion_status)
            day_completion_status[f'day_{day_index}'] = True

            # Check if all days are completed
            all_completed = all(day_completion_status.get(f'day_{i}', False) for i in range(1, 4))
            completed_marked = 1 if all_completed else 0

            plan.day_completion_status = json.dumps(day_completion_status)
            plan.completed_marked = completed_marked
            plan.updated_at = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            update_query = """
                UPDATE demo_plans
                SET day_completion_status = %(day_completion_status)s,
                    completed_marked = %(completed_marked)s,
                    updated_at = NOW()
                WHERE id = %(id)s
            """
            params = {
                'day_completion_status': plan.day_completion_status,
                'completed_marked': plan.completed_marked,
                'id': plan.id
            }

            result = connectToMySQL('fitness_consultation_schema').query_db(update_query, params)
            if result == 0:
                logging.error(f'No rows affected when updating plan_id {plan_id}')
                return False

            logging.debug(f'Plan with id {plan_id} successfully updated')
            return True
        except Exception as e:
            logging.error(f'An error occurred while updating day completion: {str(e)}')
            return False
    
    @classmethod
    def pin_for_today(cls, plan_id):
        current_time = datetime.now()
        pinned_until = current_time + timedelta(hours=24)
        formatted_pinned_until = pinned_until.strftime('%Y-%m-%d %H:%M:%S')  # Ensure correct format

        # First, check if the plan is already pinned and the pin has not expired
        check_query = "SELECT pinned_until FROM demo_plans WHERE id = %s"
        try:
            result = connectToMySQL('fitness_consultation_schema').query_db(check_query, (plan_id,))
            if result:
                existing_pinned_until = result[0]['pinned_until']
                if existing_pinned_until and existing_pinned_until > current_time:
                    print(f"Plan is already pinned until {existing_pinned_until}")
                    return False  # Plan is already pinned and the pin has not expired

            # If the plan is not pinned or the pin has expired, update the pinned_until field
            update_query = "UPDATE demo_plans SET pinned_until = %s WHERE id = %s"
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
        query = "SELECT pinned_until FROM demo_plans WHERE id = %s"
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
        query = "UPDATE demo_plans SET pinned_until = NULL WHERE id = %s"
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
            SELECT * FROM demo_plans
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
    def get_completion_status_and_date(cls, plan_id):
        query = """
            SELECT dp.completed_marked, wp.date as completion_date
            FROM demo_plans dp
            LEFT JOIN workout_progress wp ON dp.id = wp.demo_plan_id
            WHERE dp.id = %(plan_id)s
            ORDER BY wp.date DESC
            LIMIT 1;
        """
        data = {'plan_id': plan_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
    
        logging.debug(f"Query result for plan_id {plan_id}: {result}")

        if result:
            completion_status_and_date = {
                'completed_marked': result[0]['completed_marked'],
                'completion_date': result[0]['completion_date']
            }
            logging.debug(f"Completion status and date for plan_id {plan_id}: {completion_status_and_date}")
            return completion_status_and_date
        else:
            return None

    
    @classmethod
    def delete(cls, demo_id):
        query = "DELETE FROM demo_plans WHERE id = %(id)s;"
        data = {"id": demo_id}
        result = connectToMySQL('fitness_consultation_schema').query_db(query, data)
        return result != 0  
