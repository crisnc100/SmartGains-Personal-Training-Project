from flask import request, jsonify, session
from flask_app import app
from flask_app.models.nutrition_profile_model import NutritionProfile
from flask_app.models.client_model import Client



@app.route('/api/get_all_nutrition_profiles', methods=['GET'])
def get_all_nutrition_profiles():
    trainer_id = session.get('trainer_id')
    print('trainer ID:', trainer_id)
    if not trainer_id:
        return jsonify({'error': 'Unauthorized'}), 401

    clients = Client.get_nutrition_profiles_by_trainer(trainer_id)
    if clients:
        return jsonify(clients), 200
    else:
        return jsonify({'error': 'Data not found'}), 404
    

@app.route('/api/get_relatable_nutrition_data/<int:client_id>', methods=['GET'])
def get_relatable_nutrition_data(client_id):
    client_data = Client.get_one(client_id)
    if not client_data:
        print(f"No client data found for client_id: {client_id}")
        return jsonify({'error': 'No client data found'}), 404

    relatable_data = {
        "client_data": client_data.serialize() if client_data else {}
    }

    print(f"Successfully retrieved data for client_id: {client_id}")
    return jsonify(relatable_data)


@app.route('/api/add_nutrition_form', methods=['POST'])
def add_nutrition_form():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    client_id = data.get('client_id')
    if client_id is None:
        return jsonify({'error': 'Client ID not found. Unable to add nutrition profile for the client.'}), 400

    required_fields = [
        'height', 'weight', 'dob', 'gender', 'bodyfat_est', 'health_conditions', 'allergies', 'current_diet',
        'dietary_preferences', 'favorite_foods', 'disliked_foods', 'meal_preferences', 'meal_snack_preference',
        'meal_prep_habits', 'hydration', 'current_cheat_meals', 'common_cravings', 'specific_days_indulgence',
        'nutritional_goals', 'dieting_challenges', 'typical_work_schedule', 'activity_level_neat',
        'activity_level_eat', 'exercise_days_per_week', 'gym_duration', 'additional_notes'
    ]

    missing_fields = [field for field in required_fields if field not in data or not data[field].strip()]
    if missing_fields:
        return jsonify({'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Ensure TDEE fields are included in the data even if they are None
    data['normal_tdee'] = None
    data['average_tdee'] = None

    print("Data being saved:", data)  # Debugging line to check the data being passed to save method

    nutrition_profile_id = NutritionProfile.save(data)
    if nutrition_profile_id:
        return jsonify({'message': 'Nutrition Profile data added for client'}), 200
    else:
        return jsonify({'error': 'Failed to add Nutrition Profile data for client'}), 500
    

@app.route('/api/get_tdee_variables/<int:client_id>', methods=['GET'])
def get_tdee_variables(client_id):
    tdee_variables = NutritionProfile.get_tdee_variables(client_id)
    
    if not tdee_variables:
        return jsonify({'error': 'No data found for the provided client ID'}), 404

    return jsonify(tdee_variables), 200


@app.route('/api/update_tdee', methods=['POST'])
def update_tdee():
    data = request.get_json()
    client_id = data.get('client_id')
    normal_tdee = data.get('normal_tdee')
    average_tdee = data.get('average_tdee')

    if not all([client_id, normal_tdee, average_tdee]):
        return jsonify({'error': 'Missing required fields for TDEE update'}), 400

    update_result = NutritionProfile.update_tdee(client_id, normal_tdee, average_tdee)
    if update_result:
        return jsonify({'message': 'TDEE values updated successfully'}), 200
    else:
        return jsonify({'error': 'Failed to update TDEE values'}), 500
