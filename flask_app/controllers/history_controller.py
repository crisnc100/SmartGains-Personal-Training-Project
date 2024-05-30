from flask import request, jsonify, json
from flask_app import app
from flask_app.models.history_model import History
from flask_app.models.client_model import Client



@app.route('/api/add_medical_history', methods=['POST'])
def add_medical_history():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    client_id = data.get('client_id')
    if client_id is None:
        return jsonify({'error': 'Client ID not found. Unable to add medical history for the client.'}), 400

    required_fields = [
        'existing_conditions',
        'medications',
        'surgeries_or_injuries',
        'allergies',
        'family_history'
    ]

    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing one or more required fields'}), 400

    # Convert dictionary fields to JSON strings
    for field in required_fields:
        if isinstance(data[field], dict):
            answer = data[field].get('answer', 'no').lower()
            details = data[field].get('details', '')
            data[field] = details if answer == 'yes' else 'no'

    # Save the medical history data using the model
    history_id = History.save(data)
    if history_id:
        return jsonify({'message': 'Medical history data added for client'}), 200
    else:
        return jsonify({'error': 'Failed to add medical history data for client'}), 500

