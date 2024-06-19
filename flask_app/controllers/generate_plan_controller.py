from flask import session, request, jsonify
from flask_app import app
import json
import os
from openai import OpenAI, OpenAIError
from flask_app.models.client_model import Client
from flask_app.models.assessment_model import BeginnerAssessment, AdvancedAssessment
from flask_app.models.demo_plans_model import DemoPlan
from flask_app.models.generated_plans_model import GeneratedPlan
from flask_app.models.workout_progress_model import WorkoutProgress



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
    beginner_assessment_data = BeginnerAssessment.get_by_client_id(client_id)
    advanced_assessment_data = AdvancedAssessment.get_by_client_id(client_id)
  
    
    # Check which assessment data is available, clients will only have one of each!
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

    

    final_prompt = f"{selected_prompt}\n\nAssessment Type: {assessment_type}\n{assessment_findings}\n\nTrainer's Additional Comments:\n{additional_comments}"
    

    try:
    # OpenAI API
        client_ai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        completion = client_ai.chat.completions.create(
            model="gpt-4o-2024-05-13",  # Model (Newest one)
            messages=[{"role": "system", "content": "You are a fitness trainer."}, {"role": "user", "content": final_prompt}],
            max_tokens=3000, 
            temperature=0  
        )
    
        demo_plan_details = completion.choices[0].message.content.strip()
        session['demo_plan_details'] = demo_plan_details 
        demo_plan_data = {
            'client_id': client_id,
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
        ## Warm-Up
        - **Exercise Name**: Description (duration)
        - **Exercise Name**: Description (duration)
        - ...

        ## Main Workout
        ### [Muscle Group/Workout Focus]
        1. **Exercise Name**
            - **Sets**: X
            - **Reps**: X
            - **Rest**: X seconds
            - **Intensity**: [Description]
            - **Alternative**: [Alternative exercise if equipment is not available]
        2. **Exercise Name**
            - **Sets**: X
            - **Reps**: X
            - **Rest**: X seconds
            - **Intensity**: [Description]
            - **Alternative**: [Alternative exercise if equipment is not available]
        3. ...

        ## Cool Down
        - **Exercise Name**: Description (duration)
        - ...

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






