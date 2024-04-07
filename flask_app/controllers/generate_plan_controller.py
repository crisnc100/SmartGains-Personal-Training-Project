from flask import render_template, redirect, session, flash, request, url_for
from flask_app import app
import os
from openai import OpenAI
from flask import jsonify
from flask_app.models.client_model import Client
from flask_app.models.consultation_model import Consultation
from flask_app.models.assessment_model import BeginnerAssessment, AdvancedAssessment
from flask_app.models.history_model import History
from flask_app.models.demo_plans_model import DemoPlan
from flask_app.models.workout_prompts_model import WorkoutPrompts


@app.route('/create_prompt')
def create_prompt():
    client_id = session.get('client_id')
    if not client_id:
        flash("Client ID not found. Please log in again.", 'error')
        return redirect(f'/view_highlights/{client_id}')
    
    client_data = Client.get_one(client_id)  # Fetch client details
    consultation_data = Consultation.get_by_client_id(client_id)  # Fetch consultation details
    history_data = History.get_by_client_id(client_id)  # Fetch medical history details

    if client_data is None or consultation_data is None or history_data is None:
        flash('Client data not found.', 'error')
        return redirect(f'/view_highlights/{client_id}')  # Redirect if data is missing

    # Pass all the data to the template
    return render_template('intakepages/initial_prompt.html', client_data=client_data, consultation_data=consultation_data, history_data=history_data)


@app.route('/generate_example_plan', methods=['POST'])
def generate_example_plan():
    client_id = session.get('client_id')
    if not client_id:
        flash("Client ID not found. Please log in again.", 'error')
        return redirect(f'/create_prompt/{client_id}')
    
    data = request.get_json()  # Get JSON data sent by AJAX
    selected_prompt = data.get('selected_prompt')
    additional_comments = data.get('additional_comments')

    prompt_data = {
        'level': 'Determined from the UI or elsewhere',  # This needs to be determined based on your UI logic
        'prompt_template': selected_prompt,  # This could be the full final prompt you constructed
        'additional_comments': additional_comments,
        'client_id': client_id
    }
    
    WorkoutPrompts.save(prompt_data)
    # Retrieve data from models
    beginner_assessment_data = BeginnerAssessment.get_by_client_id(client_id)
    advanced_assessment_data = AdvancedAssessment.get_by_client_id(client_id)
  
    
    # Check which assessment data is available
    if beginner_assessment_data:
        assessment_type = 'Beginner'
        assessment_findings = f"""
        - Basic Technique: {beginner_assessment_data.basic_technique}
        - Chair Sit-to-Stand Test: {beginner_assessment_data.chair_sit_to_stand} repetitions
        - Arm Curl Test: {beginner_assessment_data.arm_curl} repetitions
        - Balance Test Results: {beginner_assessment_data.balance_test_results}
        - Cardio Test: {beginner_assessment_data.cardio_test}
        """
    elif advanced_assessment_data:
        assessment_type = 'Advanced'
        assessment_findings = f"""
        - Advanced Technique: {advanced_assessment_data.advanced_technique}
        - Max Strength Test: {advanced_assessment_data.strength_max}
        - Strength Endurance Test: {advanced_assessment_data.strength_endurance}
        - Circuit Test Results: {advanced_assessment_data.circuit}
        - Moderate Cardio Test: {advanced_assessment_data.moderate_cardio}
        """
    else:
        assessment_type = 'N/A'
        assessment_findings = "No detailed assessment findings are available."

    
    #Needs to include the prompt_template choosen from the trainer and additional comments
    final_prompt = f"{selected_prompt}\n\nAssessment Type: {assessment_type}\n{assessment_findings}\n\nTrainer's Additional Comments:\n{additional_comments}"
    

    try:
    # Make a request to the OpenAI API
        client_ai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        completion = client_ai.completions.create(
            model="gpt-3.5-turbo-instruct",  # Choose the appropriate model
            prompt=final_prompt,
            max_tokens=1000,  # Adjust as needed
            temperature=0  # Number of completions to generate
        )
    
    # Extract the generated plan from the response
        demo_plan_details = completion.choices[0].text.strip()
        session['demo_plan_details'] = demo_plan_details  # Correct the variable name here
        demo_plan_data = {
            'client_id': client_id,
            'demo_plan_details': demo_plan_details  # Use the correct variable here
        }   

    # Now, create the WorkoutPlan instance (ensure your class constructor matches this expectation)
        demo_plan = DemoPlan(demo_plan_data)
        demo_plan.save()
        
    
    # Return the generated plan as JSON response
        return jsonify({"success": True, "redirect": url_for('display_example_plan', client_id=client_id)})

    except Exception as e:
        return jsonify({"success": False, "error": str(e), "redirect": url_for('create_prompt')})
    

@app.route('/display_example_plan')
def display_example_plan():
    client_id = request.args.get('client_id')
    if not client_id:
        flash('Client ID is required.', 'error')
        return redirect('/')

    demo_plan = DemoPlan.get_by_client_id(client_id)  # Assuming this returns a single demo_plan instance

    if not demo_plan:
        flash('No demo plan found.', 'error')
        return redirect(url_for('create_prompt'))

    # Ensure you pass demo_plan.demo_plan_details if demo_plan is the object containing the details
    return render_template('intakepages/example_plan.html', demo_plan_details=demo_plan.demo_plan_details, client_id=client_id)






@app.route('/update_demo_plan', methods=['POST'])
def update_demo_plan():
    data = request.get_json()
    client_id = data.get('client_id')
    demo_plan_details = data.get('demo_plan_details')

    if not client_id or not demo_plan_details:
        print("Missing or incorrect data")
        return jsonify({"success": False, "message": "Missing or incorrect data"}), 400

    update_result = DemoPlan.update_by_client_id(client_id, {'demo_plan_details': demo_plan_details})
    
    # Assuming update_by_client_id returns True for a successful update, False otherwise
    if update_result:
        print("Update successful")
        return jsonify({"success": True})
    else:
        print("Failed to update the workout plan")
        return jsonify({"success": False, "message": "Failed to update the workout plan"})








