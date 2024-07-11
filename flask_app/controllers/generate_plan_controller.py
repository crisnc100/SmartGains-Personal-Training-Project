from flask import session, request, jsonify
from flask_app import app
import json
import os
from openai import OpenAI, OpenAIError
from flask_app.models.client_model import Client
from flask_app.models.generated_plans_model import GeneratedPlan
from flask_app.models.workout_progress_model import WorkoutProgress
from flask import current_app
from flask_app import mail
from flask_mail import Message
from datetime import datetime
import logging
logging.basicConfig(level=logging.DEBUG)


    


@app.route('/api/generate_custom_plan/<int:client_id>', methods=['POST'])
def generate_custom_plan(client_id):
    if not client_id:
        return jsonify({"error": "Client ID not found. Please log in again."}), 401

    data = request.get_json()
    trainers_prompt = data.get('trainers_prompt')
    parameters = data.get('parameters')  

    if not trainers_prompt:
        return jsonify({"success": False, "message": "Prompt data is missing."}), 400

    print("Received trainers prompt:", trainers_prompt)

    # Instructions for how the AI should structure the workout plan
    additional_instructions = """
    \n\nPlease format the workout plan with clear headers for each part of the workout. The format should include 
    the following sections:
        
    # [Client's Name]'s [Workout Name] Workout Plan

    ## Day 1: [Title Day Name]
    ### Warm-Up
    - **Exercise Name**: Description (duration)
    - **Exercise Name**: Description (duration)
    ...

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
    - **Exercise Name**: Description (duration)
    ...

    ## Day 2: [Title Day Name]
    ### Warm-Up
    ...

    ## Day 3: [Title Day Name]
    ### Warm-Up
    ...

    ## Additional Notes
    ...

    Ensure the language is clear and concise, suitable for both beginners and experienced individuals, focusing on safety and effective progression. Use bullet points for each attribute (Sets, Reps, Rest, etc.) and maintain consistent formatting throughout the plan.
    """

    final_prompt = trainers_prompt + additional_instructions

    
    try:
    # Making the request to the OpenAI API
        client_ai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        completion = client_ai.chat.completions.create(
            model="gpt-4o-2024-05-13",  # Model (Newest One)
            messages=[{"role": "system", "content": "You are a fitness trainer."}, {"role": "user", "content": final_prompt}],
            max_tokens=3000,  # Adjust as needed (how big the responses are)
            temperature=0  # Control the randomness?
        )

        generated_plan_details = completion.choices[0].message.content.strip()

       
        session['generated_plan_details'] = generated_plan_details
        
        generated_plan_data = {
            'client_id': client_id,
            'generated_plan_details': generated_plan_details,
            'parameters': json.dumps(parameters)  
        }

        generated_plan = GeneratedPlan(generated_plan_data)
        generated_plan.save()

        return jsonify({"success": True, "message": "Workout plan generated successfully."})

    except OpenAIError as e:
        print(f"OpenAI API error: {e}")
        return jsonify({"success": False, "error": "An error occurred while generating the workout plan."}), 500
    except Exception as e:
        print(f"Unexpected error: {e}")
        return jsonify({"success": False, "error": "An unexpected error occurred."}), 500
    

@app.route('/api/get_recent_custom_plan/<int:client_id>')
def get_recent_custom_plan(client_id):
    if not client_id:
        return jsonify({"error": "Client ID is required."}), 400

    generated_plan = GeneratedPlan.get_latest_by_client_id(client_id)  

    if not generated_plan:
        return jsonify({"error": "No custom plan found for the specified client."}), 404

    return jsonify({
        "success": True,
        "generated_plan": {
            "client_first_name": generated_plan.client_first_name,
            "client_last_name": generated_plan.client_last_name,
            "generated_plan_id": generated_plan.id,
            "generated_plan_name": generated_plan.name,  
            "generated_plan_date": generated_plan.created_at,  
            "generated_plan_details": generated_plan.generated_plan_details
        }
    })




@app.route('/api/update_recent_custom/<int:client_id>', methods=['POST'])
def update_recent_custom(client_id):
    data = request.get_json()
    name = data.get('name')
    generated_plan_details = data.get('generated_plan_details')

    if not client_id or not generated_plan_details:
        print("Missing or incorrect data")
        return jsonify({"success": False, "message": "Missing or incorrect data"}), 400

    update_result = GeneratedPlan.update_by_client_id(client_id, {'name': name, 'generated_plan_details': generated_plan_details})
   
    if update_result:
        print("Update successful")
        return jsonify({"success": True})
    else:
        print("Failed to update the workout plan")
        return jsonify({"success": False, "message": "Failed to update the workout plan"})

# View Section: 

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

    
@app.route('/api/check_pin_status/<int:plan_id>', methods=['GET'])
def check_pin_status(plan_id):
    try:
        is_pinned = GeneratedPlan.check_pin_status(plan_id)
        return jsonify({"success": True, "is_pinned": is_pinned})
    except Exception as e:
        print(f"Error in check_pin_status endpoint: {e}")
        return jsonify({"success": False, "message": str(e)}), 500


@app.route('/api/get_plan_completion_status/<int:plan_id>', methods=['GET'])
def get_plan_completion_status(plan_id):
    try:
        plan = GeneratedPlan.get_by_id(plan_id)
        if not plan:
            return jsonify({"error": "Plan not found"}), 404

        completion_status_and_dates = GeneratedPlan.get_completion_status_and_date(plan_id)
        day_completion_status = json.loads(plan.day_completion_status) if plan.day_completion_status else {}

        return jsonify({
            "completion_status": completion_status_and_dates['completed_marked'],
            "completion_dates": completion_status_and_dates['completion_dates'],
            "day_completion_status": day_completion_status
        })
    except Exception as e:
        logging.error(f'An error occurred: {str(e)}')
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500
    

@app.route('/api/get_all_generated_plans_completion_status/<int:client_id>', methods=['GET'])
def get_all_generated_plans_completion_status(client_id):
    try:
        plans = GeneratedPlan.get_all_with_completion_status(client_id)
        return jsonify(plans)
    except Exception as e:
        logging.error(f'An error occurred: {str(e)}')
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500











