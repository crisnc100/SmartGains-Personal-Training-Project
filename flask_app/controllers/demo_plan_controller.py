from flask import session, request, jsonify, json
from flask_app import app
import os
import re
from openai import OpenAI, OpenAIError
from flask_app.models.client_model import Client
from flask_app.models.client_assessments_model import ClientAssessments
from flask_app.models.global_assessments_model import GlobalAssessments
from flask_app.models.demo_plans_model import DemoPlan
from flask_app.models.workout_progress_model import WorkoutProgress
from flask import current_app
from flask_app import mail
from flask_mail import Message
from datetime import datetime
import logging
logging.basicConfig(level=logging.DEBUG)


@app.route('/api/generate_quick_plan/<int:client_id>', methods=['POST'])
def generate_quick_plan(client_id):
    if not client_id:
        return jsonify({"error": "Client ID not found. Please log in again."}), 401

    data = request.get_json()
    selected_prompt = data.get('promptContent')
    additional_comments = data.get('comments')
    
    if not selected_prompt:
        return jsonify({"error": "No prompt selected. Please select a prompt."}), 400
  
    # Retrieving data from models
    client_assessment_data = ClientAssessments.get_all_by_client_id(client_id)

    # Fetch all assessment names from global_assessments
    assessment_names = GlobalAssessments.get_all_assessment_names()

    # Map assessment IDs to names
    assessment_name_map = {assessment['id']: assessment['name'] for assessment in assessment_names}

    # Process the assessment data to create the findings string
    if client_assessment_data:
        assessment_findings = "\n".join(
            [f"- {assessment_name_map.get(assessment.assessment_id, 'Assessment')}: {', '.join(f'{k}: {v}' for k, v in json.loads(assessment.input_data).items())}"
            for assessment in client_assessment_data]
        )
    else:
        assessment_findings = "No assessment data available."

    final_prompt = f"""
    {selected_prompt}

    # [Client's Name]'s [Workout Name] Workout Plan
    ## Client Profile
    - **Assessment Data**:
    {assessment_findings}
    
    ## Trainer's Additional Comments
    {additional_comments}

    ## Day 1: [Title Day Name]
    ### Warm-Up
    - **Exercise Name**: Description (duration)

    ### Main Workout
    #### Muscle Group/Workout Focus
    1. **Exercise Name**
    - **Sets**: X
    - **Reps**: X
    - **Rest**: X seconds
    - **Intensity**: [Description]
    - **Alternative**: [Alternative exercise if equipment is not available]

    ### Cool Down
    - **Exercise Name**: Description (duration)

    ## Day 2: [Title Day Name]
    ### Warm-Up
    ...

    ## Day 3: [Title Day Name]
    ### Warm-Up
    ...

    ## Additional Notes
    ...
    """
    

    try:
    # OpenAI API
        client_ai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        completion = client_ai.chat.completions.create(
            model="gpt-4o-2024-08-06",  # Model (Newest one)
            messages=[{"role": "system", "content": "You are a fitness trainer."}, {"role": "user", "content": final_prompt}],
            max_tokens=3000, 
            temperature=0  
        )
    
        demo_plan_details = completion.choices[0].message.content.strip()

        first_line = demo_plan_details.split('\n')[0]
        plan_title = first_line.replace('# ', '').strip() if first_line.startswith('#') else "Quick Plan"
        
        # Construct the plan name
        demo_plan_name = f"{plan_title} (Quick)"
        
        # Create the plan data
        demo_plan_data = {
            'client_id': client_id,
            'name': demo_plan_name,
            'demo_plan_details': demo_plan_details
        }


        demo_plan = DemoPlan(demo_plan_data)
        demo_plan.save()
        
    
    # Return the generated plan as JSON response
        return jsonify({"success": True, "message": "Workout plan generated successfully."})

    except OpenAIError as e:
        print(f"OpenAI API error: {e}")
        return jsonify({"success": False, "error": "An error occurred while generating the workout plan."}), 500
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({"success": False, "error": "An unexpected error occurred."}), 500


@app.route('/api/get_recent_quick_plan/<int:client_id>', methods=['GET'])
def get_recent_quick_plan(client_id):
    if not client_id:
        return jsonify({"error": "Client ID is required."}), 400

    demo_plan = DemoPlan.get_latest_by_client_id(client_id)  

    if not demo_plan:
        return jsonify({"error": "No demo plan found for the specified client."}), 404

   
    return jsonify({
        "success": True,
        "demo_plan": {
            "client_first_name": demo_plan.client_first_name,
            "client_last_name": demo_plan.client_last_name,
            "demo_plan_id": demo_plan.id,
            "demo_plan_name": demo_plan.name,  
            "demo_plan_date": demo_plan.created_at,  
            "demo_plan_details": demo_plan.demo_plan_details
        }
    })



@app.route('/api/update_recent_demo/<int:client_id>', methods=['POST'])
def update_recent_demo(client_id):
    data = request.get_json()
    name = data.get('name')
    demo_plan_details = data.get('demo_plan_details')

    if not client_id or not demo_plan_details:
        print("Missing or incorrect data")
        return jsonify({"success": False, "message": "Missing or incorrect data"}), 400

    update_result = DemoPlan.update_by_client_id(client_id, {'name': name, 'demo_plan_details': demo_plan_details})
    
   
    if update_result:
        print("Update successful")
        return jsonify({"success": True})
    else:
        print("Failed to update the workout plan")
        return jsonify({"success": False, "message": "Failed to update the workout plan"})


#View Section: 

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

@app.route('/api/pin_demo_plan_for_today/<int:plan_id>', methods=['POST'])
def pin_demo_plan_for_today(plan_id):
    try:
        result = DemoPlan.pin_for_today(plan_id)
        if result:
            return jsonify({"success": True, "message": "Plan pinned for today."})
        else:
            print("Failed to pin the plan.")
            return jsonify({"success": False, "message": "Failed to pin the plan."}), 500
    except Exception as e:
        print(f"Error in pin_plan_for_today endpoint: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

    
@app.route('/api/check_demo_pin_status/<int:plan_id>', methods=['GET'])
def check_demo_pin_status(plan_id):
    try:
        is_pinned = DemoPlan.check_pin_status(plan_id)
        return jsonify({"success": True, "is_pinned": is_pinned})
    except Exception as e:
        print(f"Error in check_pin_status endpoint: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/get_demo_plan_completion_status/<int:plan_id>', methods=['GET'])
def get_demo_plan_completion_status(plan_id):
    try:
        plan = DemoPlan.get_by_id(plan_id)
        if not plan:
            return jsonify({'error': 'Plan not found'}), 404

        completion_status_and_date = DemoPlan.get_completion_status_and_date(plan_id)
        day_completion_status = json.loads(plan.day_completion_status) if plan.day_completion_status else {}

        return jsonify({
            'completion_status': completion_status_and_date['completed_marked'],
            'completion_dates': completion_status_and_date['completion_dates'],
            'day_completion_status': day_completion_status
        })
    except Exception as e:
        logging.error(f'An error occurred: {str(e)}')
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500



@app.route('/api/update_demo_plan_day_completion/<int:plan_id>/<int:day_index>', methods=['POST'])
def update_demo_plan_day_completion(plan_id, day_index):
    try:
        result = DemoPlan.update_day_completion(plan_id, day_index)
        if result:
            return jsonify({"success": True, "message": "Day completion status updated."})
        else:
            return jsonify({"success": False, "message": "Failed to update day completion status."}), 500
    except Exception as e:
        logging.error(f'An error occurred while updating day completion status: {str(e)}')
        return jsonify({'error': f'An error occurred while updating day completion status: {str(e)}'}), 500

@app.route('/api/get_all_demo_plans_completion_status/<int:client_id>', methods=['GET'])
def get_all_demo_plans_completion_status(client_id):
    try:
        plans = DemoPlan.get_all_with_completion_status(client_id)
        return jsonify(plans)
    except Exception as e:
        logging.error(f'An error occurred: {str(e)}')
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500