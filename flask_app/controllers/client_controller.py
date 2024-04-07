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

@app.route('/client_new')
def client_new():
    return render_template('clientpages/new_client.html')


# Flask route for adding a client
@app.route('/add_client', methods=['POST'])
def add_client():
    # Fetch trainer_id from the session instead of the form
    trainer_id = session.get('trainer_id')
    if not trainer_id:
        flash("Trainer ID not found. Unable to add new client", 'error')
        return redirect('/client_new')

    # Collect client data from the form
    data = {
        "first_name": request.form['first_name'],
        "last_name": request.form["last_name"],
        "age": request.form["age"],
        "gender": request.form["gender"],
        "occupation": request.form["occupation"],
        "email": request.form["email"],
        "phone_number": request.form["phone_number"],
        "address": request.form["address"],
        "location_gym": request.form["location_gym"],
        "trainer_id": trainer_id  # Set from the logged-in trainer's session
    }

    # Save the new client and get the client ID
    client_id = Client.save(data)
    if client_id:
        print("New client ID:", client_id)  
        # Redirect to a relevant route, e.g., show the client's profile or dashboard
        return redirect(f'/consultation/{client_id}')
    else:
        flash("Failed to add new client. Please try again.", 'register_error')
        return redirect('/client_new')




@app.route('/existing_client')
def existing_client():
    # Retrieve the trainer ID from the session
    trainer_id = session.get('trainer_id')
    
    # Ensure trainer_id is available in the session
    if not trainer_id:
        flash("Trainer ID not found in the session.", 'error')
        return redirect('/success')
    
    # Retrieve all clients associated with the specific trainer
    all_clients = Client.get_all_by_trainer(trainer_id)
    
    return render_template('trainerpages/existing.html', all_clients=all_clients)

@app.route('/current_client/<int:client_id>')
def current_client(client_id):  # Corrected parameter name
    if client_id is None:
        flash("Client ID not found in the URL.", 'error')
        return redirect('/')
    
    # Store the client_id in the session
    session['client_id'] = client_id

    # Retrieve data from models based on the client_id
    client_data = Client.get_one(client_id)
    consultation_data = Consultation.get_by_client_id(client_id)
    Flexibilityassessment_data = FlexibilityAssessment.get_by_client_id(client_id)
    Advancedassessment_data = AdvancedAssessment.get_by_client_id(client_id)
    Beginnerassessment_data = BeginnerAssessment.get_by_client_id(client_id)
    history_data = History.get_by_client_id(client_id)
    demo_plan_data = DemoPlan.get_by_client_id(client_id)
    workout_progress_data = WorkoutProgress.get_by_client_id(client_id)
    
    # Render the template with all assessment data
    return render_template('clientpages/current_client.html',
                           client_data=client_data, 
                           consultation_data=consultation_data,
                           Beginnerassessment_data=Beginnerassessment_data,
                           Advancedassessment_data=Advancedassessment_data,
                           Flexibilityassessment_data=Flexibilityassessment_data,
                           history_data=history_data,
                           demo_plan = demo_plan_data,
                           workout_progress_data = workout_progress_data
                          )

@app.route('/back_to_clients',methods=['POST'])
def back_to_clients():
    session.pop('client_id', None)  
    session.pop('client_first_name', None)
    session.pop('client_last_name', None)  
    return redirect('/existing_client')


@app.route('/switch_to_edit_mode', methods=['GET'])
def switch_to_edit_mode():
    client_id = session.get('client_id')
    client_data = Client.get_one(client_id)
    consultation_data = Consultation.get_by_client_id(client_id)
    flexibility_data = FlexibilityAssessment.get_by_client_id(client_id)
    beginner_assessment_data = BeginnerAssessment.get_by_client_id(client_id)
    advanced_assessment_data = AdvancedAssessment.get_by_client_id(client_id)
    history_data = History.get_by_client_id(client_id)

    success = client_data is not None
    
    editable_data = {
        "success": success,
        "client_data": client_data.__dict__,
        "consultation_data": consultation_data.__dict__,
        "flexibility_data": flexibility_data.__dict__,
        "beginner_assessment_data": beginner_assessment_data.__dict__ if beginner_assessment_data else None,
        "advanced_assessment_data": advanced_assessment_data.__dict__ if advanced_assessment_data else None,
        "history_data": history_data.__dict__,
        
    }
    
    return jsonify(editable_data)

@app.route('/switch_to_update_mode', methods=['POST'])
def switch_to_update_mode():
    client_id = session.get('client_id')
    if not client_id:
        return jsonify({"success": False, "message": "Client ID not found in session"}), 400

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

    # Update assessments, ensure each has an 'id' and the update methods use it
    if 'flexibility_data' in updated_data and 'id' in updated_data['flexibility_data']:
        FlexibilityAssessment.update({
            "id": updated_data['flexibility_data']['id'],
            **updated_data['flexibility_data']
        })

    if 'beginner_assessment_data' in updated_data:
        BeginnerAssessment.update({
            "client_id": client_id,
            **updated_data['beginner_assessment_data']
    })

    if 'advanced_assessment_data' in updated_data:
        AdvancedAssessment.update({
            "client_id": client_id,
            **updated_data['advanced_assessment_data']
        })


    return jsonify({"success": True})





