from flask import request, jsonify, session
from flask_app import app
from flask_app.models.nutrition_profile_model import NutritionProfile
from flask_app.models.client_model import Client
from flask_app.models.consultation_model import Consultation
from flask_app.models.history_model import History


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

    consultation_data = Consultation.get_by_client_id(client_id)
    history_data = History.get_by_client_id(client_id)

    relatable_data = {
        "client_data": client_data.serialize() if client_data else {},
        "consultation_data": consultation_data.serialize() if consultation_data else {},
        "history_data": history_data.serialize() if history_data else {},
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
        'height',
        'weight',
        'age',
        'gender',
        'bodyfat_est',
        'health_conditions',
        'allergies',
        'current_diet',
        'dietary_preferences',
        'favorite_foods',
        'disliked_foods',
        'meal_preferences',
        'meal_snack_preferences',
        'meal_prep_habits',
        'hydration',
        'current_cheat_meals',
        'common_cravings',
        'specific_days_indulgence',
        'nutritional_goals',
        'dieting_challenges',
        'typical_work_schedule',
        'activity_level_neat',
        'average_daily_steps',
        'activity_level_eat',
        'exercise_days_per_week',
        'gym_duration',
        'additional_notes'
    ]

    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing one or more required fields'}), 400
    
    data['normal_tdee'] = None
    data['average_tdee'] = None

   
    nutrition_profile_id = NutritionProfile.save(data)
    if nutrition_profile_id:
        return jsonify({'message': 'Nutrition Profile data added for client'}), 200
    else:
        return jsonify({'error': 'Failed to add Nutrition Proifle data for client'}), 500

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
