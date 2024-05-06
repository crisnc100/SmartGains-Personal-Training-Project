from flask import render_template, redirect, request, session, flash, url_for, jsonify
from flask_app import app
from flask_app.config.mysqlconnection import connectToMySQL
from flask_app.models.client_model import Client
from flask_app.models.trainer_model import Trainer
from flask_app.models.consultation_model import Consultation
from flask_app.models.history_model import History
from flask_app.models.assessment_model import AdvancedAssessment, BeginnerAssessment, FlexibilityAssessment
from flask_app.models.demo_plans_model import DemoPlan
from flask_app.models.workout_progress_model import WorkoutProgress
from flask_app.models.generated_plans_model import GeneratedPlan
from flask_app import mail
from flask_mail import Message
from flask_cors import cross_origin


# Flask route for adding a client
@app.route('/api/add_client', methods=['POST'])
def add_client():
    trainer_id = session.get('trainer_id')
    if not trainer_id:
        return jsonify({'error': 'Trainer ID not found. Unable to add new client'}), 400

    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    
    required_fields = ['first_name', 'last_name', 'age', 'gender', 'occupation', 'email', 'phone_number', 'address', 'location_gym']
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing one or more required fields'}), 400

    data['trainer_id'] = trainer_id  

   
    client_id = Client.save(data)
    if client_id:
        return jsonify({'message': 'New client added successfully', 'client_id': client_id}), 200
    else:
        return jsonify({'error': 'Failed to add new client. Please try again.'}), 500


@app.route('/api/check_client', methods=['POST'])
def check_client():
    data = request.get_json()
    email = data.get('email', '')
    first_name = data.get('first_name', '')
    last_name = data.get('last_name', '')
    phone_number = data.get('phone_number', '')

    email_exists = Client.email_exists(email) if email else False
    name_exists = Client.client_name_exists(first_name, last_name) if first_name and last_name else False
    phone_exists = Client.phone_number_exists(phone_number) if phone_number else False

    return jsonify({
        'email_exists': email_exists,
        'name_exists': name_exists,
        'phone_exists': phone_exists
    }), 200

@app.route('/api/existing_clients')
def existing_clients():
    # Retrieve the trainer ID from the session
    trainer_id = session.get('trainer_id')
    if not trainer_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    # Retrieve all clients associated with the specific trainer
    all_clients = Client.get_all_by_trainer(trainer_id)

    if all_clients:
        return jsonify({
            'all_clients': [client.serialize() for client in all_clients if isinstance(client, Client)]
        })
    else:
        return jsonify({'error': 'Data not found'}), 404

@app.route('/api/current_client/<int:client_id>')
def current_client(client_id): 
    print(f"Received request to view highlights for client_id: {client_id}")

    # Retrieve data from models based on the client_id
    client_data = Client.get_one(client_id)
    if not client_data:
        print(f"No client data found for client_id: {client_id}")
        return jsonify({'error': 'No client data found'}), 404

    
    client_data = Client.get_one(client_id)
    consultation_data = Consultation.get_by_client_id(client_id)
    flexibility_assessment_data = FlexibilityAssessment.get_by_client_id(client_id)
    advanced_assessment_data = AdvancedAssessment.get_by_client_id(client_id)
    beginner_assessment_data = BeginnerAssessment.get_by_client_id(client_id)
    history_data = History.get_by_client_id(client_id)
    client_demo_plans = [demo_plan.serialize() for demo_plan in DemoPlan.get_by_client_id(client_id)]
    client_plans = [plan.serialize() for plan in GeneratedPlan.get_by_client_id(client_id)]
    workout_progress_data = [progress.serialize() for progress in WorkoutProgress.get_by_client_id(client_id)]
    
    all_client_data = {
        "client_data": client_data.serialize() if client_data else {},
        "consultation_data": consultation_data.serialize() if consultation_data else {},
        "flexibility_assessment_data": flexibility_assessment_data.serialize() if flexibility_assessment_data else {},
        "advanced_assessment_data": advanced_assessment_data.serialize() if advanced_assessment_data else {},
        "beginner_assessment_data": beginner_assessment_data.serialize() if beginner_assessment_data else {},
        "history_data": history_data.serialize() if history_data else {},
        "client_demo_plans": client_demo_plans,
        "client_plans": client_plans,
        "workout_progress_data": workout_progress_data  # Correctly include the already serialized list
    }
    
    print(f"Successfully retrieved all data for client_id: {client_id}")
    return jsonify(all_client_data)

@app.route('/back_to_clients',methods=['POST'])
def back_to_clients():
    session.pop('client_id', None)  
    session.pop('client_first_name', None)
    session.pop('client_last_name', None)  
    return redirect('/existing_clients')


@app.route('/api/get_editable_data/<int:client_id>', methods=['GET'])
def get_editable_data(client_id):
    client_data = Client.get_one(client_id)
    consultation_data = Consultation.get_by_client_id(client_id)

    history_data = History.get_by_client_id(client_id)

    success = client_data is not None
    
    editable_data = {
        "success": success,
        "client_data": client_data.__dict__,
        "consultation_data": consultation_data.__dict__,
        "history_data": history_data.__dict__,
        
    }
    
    return jsonify(editable_data)

@app.route('/api/update_client_data/<int:client_id>', methods=['POST'])
def update_client_data(client_id):
  
    updated_data = request.json

    # Update Client information
    if 'client_data' in updated_data:
        Client.update({
            "id": client_id,
            **updated_data['client_data']
        })

    # Update Consultation information
    if 'consultation_data' in updated_data and 'id' in updated_data['consultation_data']:
        Consultation.update({
            "id": updated_data['consultation_data']['id'],
            **updated_data['consultation_data']
        })

    # Update Medical History
    if 'history_data' in updated_data and 'id' in updated_data['history_data']:
        History.update({
            "id": updated_data['history_data']['id'],
            **updated_data['history_data']
        })

    return jsonify({"success": True})

def send_plan_email(client_email, client_name, plan_details):
    subject = f"Workout Plan for {client_name}"

    
    formatted_plan_details = plan_details.replace('\n', '<br>')

    # Using CSS for better formatting and HTML for content structure
    body = f"""
    <html>
        <head>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                }}
                .content {{
                    margin-left: 20px;
                    margin-right: 20px;
                }}
                ul {{
                    margin-top: 10px;
                }}
                li {{
                    margin-bottom: 10px;
                }}
            </style>
        </head>
        <body>
            <p>Hello {client_name},</p>
            <p>Here is your personalized workout plan:</p>
            <div class="content">
                {formatted_plan_details}
            </div>
            <p>Best regards,</p>
            <p>Your Fitness Team</p>
        </body>
    </html>
    """
    message = Message(subject, recipients=[client_email], html=body)  # Use the html parameter for HTML content
    mail.send(message)


@app.route('/email_plan_to_client', methods=['POST'])
def email_plan_to_client():
    data = request.get_json()
    print("Full received data:", data)  # Log the complete data received

    client_id = data.get('client_id')
    plan_details = data.get('generated_plan_details') or data.get('demo_plan_details')

    if not plan_details:
        return jsonify({"success": False, "message": "No plan details provided."}), 400

    client = Client.get_one(client_id)
    if not client:
        return jsonify({"success": False, "message": "Client not found."}), 404

    try:
        send_plan_email(client.email, f"{client.first_name} {client.last_name}", plan_details)
        return jsonify({"success": True})
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({"success": False, "message": "Failed to send email."}), 500


@app.route('/api/delete_client/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    print(f"Received DELETE request for client ID {client_id}")
    try:
        
        success = Client.delete(client_id)  # Assume this is a method that returns True if successful
        if success:
            print(f"Successfully deleted client {client_id}")
            return jsonify({"success": True}), 200
        else:
            print(f"No client found with ID {client_id}")
            return jsonify({"success": False, "message": "Client not found"}), 404
    except Exception as e:
        print(f"Exception during delete: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

