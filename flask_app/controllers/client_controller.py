from flask import redirect, request, session, jsonify
from flask_app import app
from flask_app.config.mysqlconnection import connectToMySQL
from flask_app.models.client_model import Client
from flask_app.models.trainer_model import Trainer
from flask_app.models.consultation_model import Consultation
from flask_app.models.intake_forms_model import IntakeForms
from flask_app.models.intake_form_answers_model import IntakeFormAnswers
from flask_app.models.history_model import History
from flask_app.models.client_assessments_model import ClientAssessments
from flask_app.models.global_assessments_model import GlobalAssessments
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

    
    required_fields = ['first_name', 'last_name', 'dob', 'gender', 'occupation', 'email', 'phone_number', 'address', 'location_gym']
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

    client_data = Client.get_one(client_id)
    if not client_data:
        print(f"No client data found for client_id: {client_id}")
        return jsonify({'error': 'No client data found'}), 404
    
    intake_forms = IntakeForms.get_by_client_id(client_id)
    intake_forms_with_answers = []
    for form in intake_forms:
        answers = IntakeFormAnswers.get_all_by_form_with_question_text(form.id)
        form_data = form.serialize()
        form_data['answers'] = [answer.serialize() for answer in answers]
        intake_forms_with_answers.append(form_data)

    client_assessment_data = ClientAssessments.get_all_by_client_id(client_id)
    client_demo_plans = [demo_plan.serialize() for demo_plan in DemoPlan.get_by_client_id(client_id)]
    client_plans = [plan.serialize() for plan in GeneratedPlan.get_by_client_id(client_id)]
    workout_progress_data = [progress.serialize() for progress in WorkoutProgress.get_by_client_id(client_id)]
    
    all_client_data = {
        "client_data": client_data.serialize() if client_data else {},
        "intake_forms": intake_forms_with_answers,
        "client_assessment_data": [assessment.serialize() for assessment in client_assessment_data] if client_assessment_data else [],
        "client_demo_plans": client_demo_plans,
        "client_plans": client_plans,
        "workout_progress_data": workout_progress_data  
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
    try:
        client_data = Client.get_one(client_id)
        intake_forms = IntakeForms.get_by_client_id(client_id)
        intake_forms_with_answers = []
        for form in intake_forms:
            answers = IntakeFormAnswers.get_all_by_form(form.id)
            form_data = form.__dict__
            form_data['answers'] = [answer.__dict__ for answer in answers]
            intake_forms_with_answers.append(form_data)
        client_assessment_data = ClientAssessments.get_all_by_client_id(client_id)

        # Created a dictionary only if data exists, else set to None or a default value
        client_dict = client_data.__dict__ if client_data else None
        client_assessment_dict = client_assessment_data.__dict__ if client_assessment_data else None

        editable_data = {
            "success": client_data is not None,
            "client_data": client_dict,
            "intake_forms": intake_forms_with_answers,
            "client_assessment_data": client_assessment_dict,
        }
        
        return jsonify(editable_data), 200 if client_data else 404
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
    


@app.route('/api/update_client_data/<int:client_id>', methods=['POST'])
def update_client_data(client_id):
    updated_data = request.get_json()  # Ensures that you're working with a JSON payload

    # Update Client information
    if 'client_data' in updated_data and updated_data['client_data'] is not None:
        Client.update({
            "id": client_id,
            **updated_data['client_data']
        })

    # Update Intake Forms and their Answers
    intake_forms_data = updated_data.get('intake_forms', [])
    for form_data in intake_forms_data:
        if form_data and 'id' in form_data:
            IntakeForms.update({
                "id": form_data['id'],
                **form_data
            })
            # Update answers for this form
            answers_data = form_data.get('answers', [])
            for answer_data in answers_data:
                if answer_data and 'id' in answer_data:
                    IntakeFormAnswers.save({
                        "id": answer_data['id'],
                        **answer_data
                    })

    client_assessment_data = updated_data.get('client_assessment_data', {})
    if client_assessment_data and 'id' in client_assessment_data:
        ClientAssessments.update({
            "id": client_assessment_data['id'],
            **client_assessment_data
        })

    return jsonify({"success": True})

def send_plan_email(client_email, client_name, plan_details, client_trainer_first_name, client_trainer_last_name):
    trainer_name = f"{client_trainer_first_name} {client_trainer_last_name}"  # Combining first and last name for use in the email
    subject = f"Workout Plan for {client_name}"
    formatted_plan_details = plan_details.replace('\n', '<br>').replace('*Bold*', '<strong>').replace('*/Bold*', '</strong>')

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
            <p>Here is your personalized workout plan crafted by {trainer_name}:</p>
            <div class="content">
                {formatted_plan_details}
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


@app.route('/api/email_plan_to_client', methods=['POST'])
def email_plan_to_client():
    data = request.get_json()
    print("Full received data:", data)  # Logging the complete data received for debugging

    client_id = data.get('client_id')
    plan_details = data.get('generated_plan_details') or data.get('demo_plan_details')

    if not plan_details:
        return jsonify({"success": False, "message": "No plan details provided."}), 400

    client = Client.get_one(client_id)
    if not client:
        return jsonify({"success": False, "message": "Client not found."}), 404
    
    try:
        send_plan_email(
            client_email=client.email,
            client_name=f"{client.first_name} {client.last_name}",
            plan_details=plan_details,
            client_trainer_first_name=client.trainer_first_name,  
            client_trainer_last_name=client.trainer_last_name    
        )
        return jsonify({"success": True})
    except Exception as e:
        print(f"Error sending email: {e}")
        return jsonify({"success": False, "message": "Failed to send email."}), 500


@app.route('/api/delete_client/<int:client_id>', methods=['DELETE'])
def delete_client(client_id):
    print(f"Received DELETE request for client ID {client_id}")
    try:
        
        success = Client.delete(client_id)  
        if success:
            print(f"Successfully deleted client {client_id}")
            return jsonify({"success": True}), 200
        else:
            print(f"No client found with ID {client_id}")
            return jsonify({"success": False, "message": "Client not found"}), 404
    except Exception as e:
        print(f"Exception during delete: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500

