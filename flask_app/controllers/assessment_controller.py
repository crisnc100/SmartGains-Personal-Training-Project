from flask import render_template, redirect, request, session, flash
from flask_app import app
from flask_app.models.assessment_model import FlexibilityAssessment, BeginnerAssessment, AdvancedAssessment
from flask_app.models.client_model import Client


#Flexibility Assessment:
@app.route('/flexibility_test/<int:client_id>')
def flexibility_test(client_id):
    return render_template('intakepages/flexibility.html', client_id=client_id, first_name=session.get('first_name'), last_name = session.get('last_name'))

@app.route('/save_flexibility_assessment', methods=['POST'])
def save_flexibility_assessment():
    client_id = request.form.get('client_id')
    if client_id is None:
        flash("Client ID not found. Unable to save flexibility assessment data.", 'error')
        return redirect(f'/flexibility_test/{client_id}')
    
    data = {
        "shoulder_flexibility": request.form["shoulder_flexibility"],
        "lower_body_flexibility": request.form["lower_body_flexibility"],
        "joint_mobility": request.form["joint_mobility"],
        "client_id": client_id,
        "client_first_name": session.get("first_name"),
        "client_last_name": session.get("last_name")
    }

    flexibility_assessment_id = client_id
    
    FlexibilityAssessment.save(data)
    return redirect(f'/assessment_choice/{client_id}')


@app.route('/assessment_choice/<int:client_id>')
def assessments(client_id):
    return render_template('intakepages/assessment_choice.html', client_id=client_id, first_name=session.get('first_name'), last_name=session.get('last_name'))

@app.route('/beginner_assessment/<int:client_id>')
def beginner_assessment(client_id):
        return render_template('intakepages/beginner_assessment.html', client_id=client_id, first_name=session.get('first_name'), last_name=session.get('last_name'))

@app.route('/save_beginner_assessment', methods=['POST'])
def save_beginner_assessment():
    client_id = request.form.get('client_id')
    if client_id is None:
        flash("Client ID not found. Unable to save beginner assessment data.", 'error')
        return redirect(f'/beginner_assessment/{client_id}')
    
    balance_test_values = []
    
    balances = ['Narrow Stance', 'Tandem Stance', 'Single-Leg']
    for balance in balances:
        input_name = f'balance_test_results_{balance.lower().replace(" ", "_")}'
        balance_value = request.form.get(input_name)
        balance_test_values.append(f"{balance}: {balance_value}")

    # Concatenate balance test values into a single string
    balance_test_results = ', '.join(balance_test_values)
    
    data = {
        "basic_technique": request.form["basic_technique"],
        "chair_sit_to_stand": request.form["chair_sit_to_stand"],
        "arm_curl": request.form["arm_curl"],
        "balance_test_results": balance_test_results,
        "cardio_test": request.form["cardio_test"],
        "client_id": client_id,
        "client_first_name": session.get("first_name"),
        "client_last_name": session.get("last_name")
    }

    # Use client_id as the beginner_assessment_id
    beginner_assessment_id = client_id

    # Save the beginner assessment using the determined assessment ID
    BeginnerAssessment.save(data)
    
    return redirect(f'/view_highlights/{client_id}')



@app.route('/advanced_assessment/<int:client_id>')
def advanced_assessment(client_id):
        return render_template('intakepages/advanced_assessment.html', client_id=client_id, first_name=session.get('first_name'), last_name=session.get('last_name'))


@app.route('/save_advanced_assessment', methods=['POST'])
def save_advanced_assessment():
    client_id = request.form.get('client_id')
    if client_id is None:
        flash("Client ID not found. Unable to save advanced assessment data.", 'error')
        return redirect(f'/advanced_assessment/{client_id}')

    # Initialize an empty list to store strength_max values for each exercise
    strength_max_values = []

    # Loop through the list of exercises and extract the strength_max values from the form data
    exercises = ['Bench', 'Squat', 'Deadlift', 'Overhead Press']
    for exercise in exercises:
        input_name = f'strength_max_{exercise.lower().replace(" ", "_")}'
        strength_value = request.form.get(input_name)
        strength_max_values.append(f"{exercise}: {strength_value}")

    # Concatenate strength_max values into a single string
    strength_max = ', '.join(strength_max_values)

    # Construct the data dictionary to be passed to the AdvancedAssessment class
    data = {
        "advanced_technique": request.form["advanced_technique"],
        "strength_max": strength_max,
        "strength_endurance": request.form["strength_endurance"],
        "circuit": request.form["circuit"],
        "moderate_cardio": request.form["moderate_cardio"],
        "client_id": client_id,
        "client_first_name": session.get("first_name"),
        "client_last_name": session.get("last_name")
    }

    # Save the advanced assessment data
    advanced_assessment_id = client_id
    
    AdvancedAssessment.save(data)

    # Redirect to the view highlights page
    return redirect(f'/view_highlights/{client_id}')
