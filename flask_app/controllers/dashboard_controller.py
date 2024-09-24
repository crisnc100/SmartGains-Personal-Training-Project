from flask import redirect, request, session, jsonify
from flask_app import app
from flask_app.config.mysqlconnection import connectToMySQL
from flask_app.models.client_model import Client
from flask_app.models.trainer_model import Trainer
from flask_app.models.demo_plans_model import DemoPlan
from flask_app.models.workout_progress_model import WorkoutProgress
from flask_app.models.generated_plans_model import GeneratedPlan
from flask_app.models.intake_forms_model import IntakeForms
from flask_app import mail
from flask_mail import Message
from flask_cors import cross_origin



@app.route('/api/total_clients')
def total_clients():
    trainer_id = session.get('trainer_id')
    if not trainer_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        total_clients = Client.count_by_trainer(trainer_id)
        return jsonify({'success': True, 'total_clients': total_clients})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    


@app.route('/api/get_all_pinned_plans', methods=['GET'])
def get_all_pinned_plans():
    trainer_id = session.get('trainer_id')
    if not trainer_id:
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        pinned_generated_plans = GeneratedPlan.get_pinned_plans(trainer_id)
        pinned_demo_plans = DemoPlan.get_pinned_plans(trainer_id)
        
        combined_pinned_plans = pinned_generated_plans + pinned_demo_plans
        
        return jsonify({"success": True, "pinned_plans": [plan.serialize() for plan in combined_pinned_plans]})
    except Exception as e:
        print(f"Error in get_all_pinned_plans endpoint: {e}")
        return jsonify({"success": False, "message": str(e)}), 500



@app.route('/api/unpin_plan/<int:plan_id>', methods=['POST'])
def unpin_any_plan(plan_id):
    try:
        result_generated = GeneratedPlan.unpin_plan(plan_id)
        result_demo = DemoPlan.unpin_plan(plan_id)

        if result_generated or result_demo:
            return jsonify({"success": True, "message": "Plan unpinned."})
        else:
            return jsonify({"success": False, "message": "Failed to unpin the plan."}), 500
    except Exception as e:
        print(f"Error in unpin_any_plan endpoint: {e}")
        return jsonify({"success": False, "message": str(e)}), 500

    
@app.route('/api/client_draft_forms', methods=['GET'])
def client_draft_forms():
    # Get the trainer ID from the session
    trainer_id = session.get('trainer_id')
    
    # Check if the trainer is authorized
    if not trainer_id:
        return jsonify({'error': 'Unauthorized'}), 401

    # Fetch the draft forms for the trainer
    draft_forms = IntakeForms.get_draft_forms_by_trainer(trainer_id)
    
    # Serialize the draft forms to JSON format
    draft_forms_serialized = [form.serialize() for form in draft_forms]
    
    # Return the JSON response
    return jsonify(draft_forms_serialized), 200

