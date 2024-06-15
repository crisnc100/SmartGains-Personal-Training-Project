from flask import request, jsonify, json
from flask_app import app
from flask_app.config.mysqlconnection import connectToMySQL
from flask_app.models.client_model import Client
from flask_app.models.demo_plans_model import DemoPlan
from flask_app.models.workout_progress_model import WorkoutProgress
from flask_app.models.generated_plans_model import GeneratedPlan
from flask import current_app
from flask_app import mail
from flask_mail import Message
from datetime import datetime




#Quick Plan Logic:

@app.route('/api/get_demo_plan/<int:demo_plan_id>', methods=['GET'])
def get_demo_plan(demo_plan_id):
    demo_plan = DemoPlan.get_by_id(demo_plan_id)
    current_app.logger.debug(f'Demo Plan: {demo_plan}')
    if not demo_plan:
        return jsonify({"error": "No demo plan found."}), 404

    return jsonify({
        "client_first_name": demo_plan.client_first_name,
        "client_last_name": demo_plan.client_last_name,
        "demo_plan_name": demo_plan.name,
        "demo_plan_date": demo_plan.created_at,  
        "demo_plan_details": demo_plan.demo_plan_details
    })



@app.route('/api/update_client_demo_plan/<int:demo_plan_id>', methods=['POST'])
def update_client_demo_plan(demo_plan_id):
    data = request.get_json()
    name = data.get('name')
    demo_plan_details = data.get('demo_plan_details')

    if not name or not demo_plan_details:
        return jsonify({"success": False, "message": "Missing or incorrect data: name or demo_plan_details missing"}), 400

    update_result = DemoPlan.update(demo_plan_id, {'name': name, 'demo_plan_details': demo_plan_details})


    if update_result:
        return jsonify({"success": True, "message": "Update successful"})
    else:
        return jsonify({"success": False, "message": "Failed to update the workout plan"})
    

@app.route('/api/delete_demo_plan/<int:plan_id>', methods=['DELETE'])
def delete_demo_plan(plan_id):
    try:
        success = DemoPlan.delete(plan_id)
        if success:
            print(f"Demo plan with ID {plan_id} deleted successfully.")
            return jsonify({"success": True, "message": "Demo Plan deleted successfully."}), 200
        else:
            print(f"No demo plan found with ID {plan_id}.")
            return jsonify({"success": False, "message": "Failed to delete Demo Plan. No such plan exists."}), 404
    except Exception as e:
        print(f"An error occurred while deleting the Demo Plan with ID {plan_id}: {str(e)}")
        return jsonify({"success": False, "message": f"An error occurred while deleting the Demo Plan: {str(e)}"}), 500


#Custom Plan Logic: 

@app.route('/api/get_generated_plan/<int:generated_plan_id>', methods=['GET'])
def get_generated_plan(generated_plan_id):
    generated_plan = GeneratedPlan.get_by_id(generated_plan_id)
    current_app.logger.debug(f'Generated Plan: {generated_plan}')
    if not generated_plan:
        return jsonify({"error": "No generated plan found."}), 404

    return jsonify({
        "client_first_name": generated_plan.client_first_name,
        "client_last_name": generated_plan.client_last_name,
        "generated_plan_name": generated_plan.name,
        "generated_plan_date": generated_plan.created_at if generated_plan.date else None,
        "generated_plan_details": generated_plan.generated_plan_details
    })


@app.route('/api/update_client_generated_plan/<int:generated_plan_id>', methods=['POST'])
def update_client_generated_plan(generated_plan_id):
    data = request.get_json()
    name = data.get('name')
    generated_plan_details = data.get('generated_plan_details')

    if not name or not generated_plan_details:
        return jsonify({"success": False, "message": "Missing or incorrect data: name or generated_plan_details missing"}), 400

    update_result = GeneratedPlan.update(generated_plan_id, {'name': name, 'generated_plan_details': generated_plan_details})


    if update_result:
        return jsonify({"success": True, "message": "Update successful"})
    else:
        return jsonify({"success": False, "message": "Failed to update the workout plan"})
    

@app.route('/api/delete_custom_plan/<int:plan_id>', methods=['DELETE'])
def delete_custom_plan(plan_id):
    try:
        success = GeneratedPlan.delete(plan_id)
        if success:
            print(f"Custom plan with ID {plan_id} deleted successfully.")
            return jsonify({"success": True, "message": "Custom Plan deleted successfully."}), 200
        else:
            print(f"No custom plan found with ID {plan_id}.")
            return jsonify({"success": False, "message": "Failed to delete Custom Plan. No such plan exists."}), 404
    except Exception as e:
        print(f"An error occurred while deleting Custom Plan with ID {plan_id}: {str(e)}")
        return jsonify({"success": False, "message": f"An error occurred while deleting the Custom Plan: {str(e)}"}), 500


@app.route('/api/pin_plan_for_today/<int:plan_id>', methods=['POST'])
def pin_plan_for_today(plan_id):
    try:
        result = GeneratedPlan.pin_for_today(plan_id)
        if result:
            return jsonify({"success": True, "message": "Plan pinned for today."})
        else:
            print("Failed to pin the plan.")
            return jsonify({"success": False, "message": "Failed to pin the plan."}), 500
    except Exception as e:
        print(f"Error in pin_plan_for_today endpoint: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/get_pinned_plans', methods=['GET'])
def get_pinned_plans():
    try:
        pinned_plans = GeneratedPlan.get_pinned_plans()
        return jsonify({"success": True, "pinned_plans": [plan.serialize() for plan in pinned_plans]})
    except Exception as e:
        print(f"Error in get_pinned_plans endpoint: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/unpin_plan/<int:plan_id>', methods=['POST'])
def unpin_plan(plan_id):
    try:
        result = GeneratedPlan.unpin_plan(plan_id)
        if result:
            return jsonify({"success": True, "message": "Plan unpinned."})
        else:
            return jsonify({"success": False, "message": "Failed to unpin the plan."}), 500
    except Exception as e:
        print(f"Error in unpin_plan endpoint: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    
@app.route('/api/check_pin_status/<int:plan_id>', methods=['GET'])
def check_pin_status(plan_id):
    try:
        is_pinned = GeneratedPlan.check_pin_status(plan_id)
        return jsonify({"success": True, "is_pinned": is_pinned})
    except Exception as e:
        print(f"Error in check_pin_status endpoint: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


#Session Progress Logic: 

@app.route('/api/add_workout_session', methods=['POST'])
def add_workout_session():
    data = request.get_json()
    print('Recieved data:', data)
    if not data:
        return jsonify({'error': 'No data provided'}), 400

  
    client_id = data.get('client_id')
    if client_id is None:
        return jsonify({'error': 'Client ID not found. Unable to add workout session for the client.'}), 400
    
    
    required_fields = [
        'date',
        'workout_type',
        'duration_minutes',
        'exercises_log',
        'intensity_level',
        'location',
        'workout_rating',
    ]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'error': 'Missing one or more required fields'}), 400

    progress_id = WorkoutProgress.save(data)
    if progress_id:
        return jsonify({'message': 'Workout session data added for client'}), 200
    else:
        return jsonify({'error': 'Failed to add workout session data for client'}), 500
    

@app.route('/api/get_progress_session/<int:progress_id>', methods=['GET'])
def get_progress_session(progress_id):
    workout_progress = WorkoutProgress.get_by_id(progress_id)
    current_app.logger.debug(f'Progress Plan: {progress_id}')
    if not workout_progress:
        return jsonify({"error": "No workout progress found."}), 404

    return jsonify({
        "client_first_name": workout_progress.client_first_name,
        "client_last_name": workout_progress.client_last_name,
        "workout_progress_name": workout_progress.name,
        "workout_progress_date": workout_progress.date,
        "workout_progress_workout_type": workout_progress.workout_type,
        "workout_progress_duration_minutes": workout_progress.duration_minutes,
        "workout_progress_exercises_log": workout_progress.exercises_log,
        "workout_progress_intensity_level": workout_progress.intensity_level,
        "workout_progress_location": workout_progress.location,
        "workout_progress_workout_rating": workout_progress.workout_rating,
        "workout_progress_trainer_notes": workout_progress.trainer_notes
    })



@app.route('/api/update_progress_session/<int:progress_id>', methods=['POST'])
def update_progress_session(progress_id):
    try:
        data = request.get_json()
        print("Received data for update:", data)  # Debug statement

       
        data['id'] = progress_id

      
        update_data = {
            'id': progress_id,
            'name': data.get('workout_progress_name'),
            'date': data.get('workout_progress_date'),
            'workout_type': data.get('workout_progress_workout_type'),
            'duration_minutes': data.get('workout_progress_duration_minutes'),
            'exercises_log': data.get('workout_progress_exercises_log'),
            'intensity_level': data.get('workout_progress_intensity_level'),
            'location': data.get('workout_progress_location'),
            'workout_rating': data.get('workout_progress_workout_rating'),
            'trainer_notes': data.get('workout_progress_trainer_notes')
        }

        print("Data prepared for update:", update_data)  

        update_result = WorkoutProgress.update(update_data)

        print("Update result (rows affected):", update_result)  # Debug 

        if update_result is None or update_result >= 0:
            print("Update successful")  # Debug
            return jsonify({"success": True, "message": "Update successful"}), 200
        else:
            print("Failed to update the workout session in the database")  # Debug
            return jsonify({"success": False, "message": "Failed to update the workout session"}), 400

    except ValueError as ve:
        print(f"Validation error: {ve}")
        return jsonify({"success": False, "message": str(ve)}), 400
    except Exception as e:
        print(f"An error occurred: {e}")
        return jsonify({"success": False, "message": "An error occurred"}), 500
    


@app.route('/api/delete_progress_session/<int:plan_id>', methods=['DELETE'])
def delete_progress_session(plan_id):
    try:
        success = WorkoutProgress.delete(plan_id)
        if success:
            print(f"Progress session with ID {plan_id} deleted successfully.")
            return jsonify({"success": True, "message": "Progress session deleted successfully."}), 200
        else:
            print(f"No progress session found with ID {plan_id}.")
            return jsonify({"success": False, "message": "Failed to delete progress session Plan. No such plan exists."}), 404
    except Exception as e:
        print(f"An error occurred while deleting Progress Session Plan with ID {plan_id}: {str(e)}")
        return jsonify({"success": False, "message": f"An error occurred while deleting the Progress Session Plan: {str(e)}"}), 500


def send_session_email(client_email, client_name, session_details, client_trainer_first_name, client_trainer_last_name):
    trainer_name = f"{client_trainer_first_name} {client_trainer_last_name}"  # Combine first and last name for use in the email
    subject = f"Documented Workout Session for {client_name}"

    workout_description = f"""
    You completed a {session_details['workout_type']} workout lasting {session_details['duration_minutes']} minutes at {session_details['location']}. 
    The session focused on the following exercises:
    """

    date = session_details['date']
    exercises_log = session_details['exercises_log']
    exercises_list = exercises_log.split('\n')  
    exercises_bullet_points = "".join([f"<li>{exercise.strip()}</li>" for exercise in exercises_list])

    workout_description += f"""
    <ul>
        {exercises_bullet_points}
    </ul>
    You worked out at an intensity level of {session_details['intensity_level']}, and you rated the session a {session_details['workout_rating']} out of 10. 
    Additional notes from {trainer_name} include: {session_details['trainer_notes']}.
    """

    # Using CSS for better formatting and HTML for content structure
    body = f"""
    <html>
        <head>
            <style>
                body {{
                    font-family: 'Helvetica', 'Arial', sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .content {{
                    margin: 20px;
                }}
                ul, ol {{
                    margin-top: 10px;
                    padding-left: 20px;
                }}
                li {{
                    margin-bottom: 10px;
                }}
                .header {{
                    background-color: #004aad; /* SmartGains brand color */
                    color: white;
                    padding: 10px;
                    text-align: center;
                    font-size: 24px;
                }}
                .brand {{
                    font-family: Arial, sans-serif;
                    font-size: 18px;
                    font-weight: bold;
                    color: #a8ff04;
                    text-shadow: 2px 2px 3px rgba(0, 0, 0, 0.7);
                    text-align: center;
                    background-color: #00dffc;
                    padding: 10px;
                    border-radius: 5px;
                    box-shadow: 0 0 8px #00dffc;
                }}
            </style>
        </head>
        <body>
            <div class="brand">SmartGains Fitness Plan</div>
            <p>Hello {client_name},</p>
            <p>Here is a recap of your workout session with {trainer_name} completed on {date}:</p>
            <div class="content">
                {workout_description}
            </div>
            <div class="brand">
                <p>Best regards,</p>
                <p>{trainer_name} at SmartGains</p>
            </div>
        </body>
    </html>
    """
    message = Message(subject, recipients=[client_email], html=body)
    mail.send(message)

@app.route('/api/email_session_to_client', methods=['POST'])
def email_session_to_client():
    data = request.get_json()
    print("Full received data:", data)  # Log the complete data received

    # Extracting individual fields from the JSON data for the email
    client_id = data.get('client_id')
    name = data.get('workout_progress_name')
    date = data.get('workout_progress_date')
    workout_type = data.get('workout_progress_workout_type')
    duration_minutes = data.get('workout_progress_duration_minutes')
    exercises_log = data.get('workout_progress_exercises_log')
    intensity_level = data.get('workout_progress_intensity_level')
    location = data.get('workout_progress_location')
    workout_rating = data.get('workout_progress_workout_rating')
    trainer_notes = data.get('workout_progress_trainer_notes')


    if not client_id:
        return jsonify({"success": False, "message": "Client ID is required."}), 400

    
    client = Client.get_one(client_id)
    if not client:
        return jsonify({"success": False, "message": "Client not found."}), 404

    session_details = {
        "name": name,
        "date": date,
        "workout_type": workout_type,
        "duration_minutes": duration_minutes,
        "exercises_log": exercises_log,
        "intensity_level": intensity_level,
        "location": location,
        "workout_rating": workout_rating,
        "trainer_notes": trainer_notes
    }

    try:
       
        send_session_email(
            client_email=client.email,
            client_name=f"{client.first_name} {client.last_name}",
            session_details=session_details,
            client_trainer_first_name=client.trainer_first_name, 
            client_trainer_last_name=client.trainer_last_name
        )
        return jsonify({"success": True})
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({"success": False, "message": "Failed to send email."}), 500


@app.route('/api/mark_plan_completed/<int:client_id>/<int:plan_id>', methods=['POST'])
def mark_plan_completed(client_id, plan_id):
    data = request.get_json()
    progress = data.get('progress', {})
    
    review_data = {
        'name': data.get('name', 'Workout Plan'),
        'date': data.get('date', datetime.now().strftime('%Y-%m-%d')),
        'workout_type': data.get('workout_type', 'Strength Training'),  # Default to 'Strength Training'
        'duration_minutes': data.get('duration_minutes', 60),
        'exercises_log': json.dumps(progress),
        'intensity_level': data.get('intensity_level', 'moderate'),
        'location': data.get('location', 'Local Gym'),
        'workout_rating': data.get('workout_rating', 5),
        'trainer_notes': data.get('trainer_notes', ''),  # Empty for the trainer to fill out
        'workout_source': 'AI',  # Default to 'AI' for generated plans
        'client_id': client_id
    }

    # Mark the plan as completed
    success = GeneratedPlan.mark_as_completed(plan_id)

    if not success:
        return jsonify({'error': 'Failed to mark the plan as completed'}), 500

    # Log the workout session
    workout_log_id = WorkoutProgress.save(review_data)
    if not workout_log_id:
        return jsonify({'error': 'Failed to log the workout session'}), 500

    return jsonify({'message': 'Plan marked as completed and logged as workout', 'workout_log_id': workout_log_id}), 200
