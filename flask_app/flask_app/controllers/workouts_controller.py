from flask import render_template, redirect, request, session, flash, url_for, jsonify
from flask_app import app
from flask_app.config.mysqlconnection import connectToMySQL
from flask_app.models.client_model import Client
from flask_app.models.demo_plans_model import DemoPlan
from flask_app.models.workout_progress_model import WorkoutProgress
from flask_app.models.generated_plans_model import GeneratedPlan
from flask import current_app


@app.route('/api/get_demo_plan/<int:demo_plan_id>', methods=['GET'])
def get_demo_plan(demo_plan_id):
    demo_plan = DemoPlan.get_by_id(demo_plan_id)
    current_app.logger.debug(f'Demo Plan: {demo_plan}')
    if not demo_plan:
        return jsonify({"error": "No demo plan found."}), 404

    # Use dot notation to access instance variables
    return jsonify({
        "client_first_name": demo_plan.client_first_name,
        "client_last_name": demo_plan.client_last_name,
        "demo_plan_name": demo_plan.name,
        "demo_plan_date": demo_plan.date.strftime('%Y-%m-%d') if demo_plan.date else None,  # Ensure date is properly formatted or handled if None
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




@app.route('/workout_record/<int:client_id>')
def workout_record(client_id):
    session['client_id'] = client_id
    return render_template('clientpages/record_workout.html',client_id=client_id)

@app.route('/workout_create', methods=['POST'])
def workout_create():
    client_id = request.form.get('client_id')
    if client_id is None:
        flash("Client ID not found. Unable to record workout.", 'error')
        return redirect(f'/workout_record/{client_id}')
    
    
    workout_progress_data = {
        'date': request.form['date'],
        'workout_type': request.form['workout_type'],
        'duration_minutes': request.form['duration_minutes'],
        'exercises_log': request.form['exercises_log'],
        'intensity_level': request.form['intensity_level'],
        'location': request.form['location'],
        'workout_rating': request.form['workout_rating'],
        'client_id': client_id
    }

    WorkoutProgress.save(workout_progress_data)

    return redirect(f'/current_client/{client_id}')




@app.route('/api/get_generated_plan/<int:generated_plan_id>', methods=['GET'])
def get_generated_plan(generated_plan_id):
    generated_plan = GeneratedPlan.get_by_id(generated_plan_id)
    current_app.logger.debug(f'Generated Plan: {generated_plan}')
    if not generated_plan:
        return jsonify({"error": "No generated plan found."}), 404

    # Use dot notation to access instance variables
    return jsonify({
        "client_first_name": generated_plan.client_first_name,
        "client_last_name": generated_plan.client_last_name,
        "generated_plan_name": generated_plan.name,
        "generated_plan_date": generated_plan.date.strftime('%Y-%m-%d') if generated_plan.date else None,  # Ensure date is properly formatted or handled if None
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
