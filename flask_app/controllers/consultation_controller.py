from flask import request, jsonify
from flask_app import app
from flask_app.models.consultation_model import Consultation
from flask_app.models.client_model import Client

@app.route('/api/add_consultation', methods=['POST'])
def add_consultation():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    client_id = data.get('client_id')
    if client_id is None:
        return jsonify({'error': 'Client ID not found. Unable to add consultation for the client.'}), 400

    required_fields = [
        'prior_exercise_programs',
        'exercise_habits',
        'fitness_goals',
        'progress_measurement',
        'area_specifics',
        'exercise_likes',
        'exercise_dislikes',
        'diet_description',
        'dietary_restrictions',
        'processed_food_consumption',
        'daily_water_intake',
        'daily_routine',
        'stress_level',
        'smoking_alcohol_habits',
        'hobbies'
    ]

    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing one or more required fields'}), 400

    # Convert the fitness_goals list to a comma-separated string if it's a list or tuple
    fitness_goals = data.get('fitness_goals', [])
    if isinstance(fitness_goals, (list, tuple)):
        data['fitness_goals'] = ','.join(fitness_goals)

    # Save the consultation data using the model
    consultation_id = Consultation.save(data)
    if consultation_id:
        return jsonify({'message': 'Consultation data added for client'}), 200
    else:
        return jsonify({'error': 'Failed to add consultation data for client'}), 500
