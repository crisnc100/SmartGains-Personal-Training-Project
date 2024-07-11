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
        'exercise_time_day',
        'self_fitness_level',
        'fitness_goals',
        'motivation',
        'progress_measurement',
        'barriers_challenges',
        'area_specifics',
        'exercise_likes',
        'exercise_dislikes',
        'warm_up_info',
        'cool_down_info',
        'stretching_mobility',
        'daily_routine',
        'stress_level',
        'smoking_alcohol_habits',
        'hobbies',
        'fitness_goals_other',
        'motivation_other'
    ]

    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing one or more required fields'}), 400

    # Convert the fitness_goals and motivation lists to a comma-separated string if they are lists or tuples
    for field in ['fitness_goals', 'motivation']:
        if isinstance(data.get(field), (list, tuple)):
            data[field] = ','.join(data[field])

    # Save the consultation data using the model
    consultation_id = Consultation.save(data)
    if consultation_id:
        return jsonify({'message': 'Consultation data added for client'}), 200
    else:
        return jsonify({'error': 'Failed to add consultation data for client'}), 500
