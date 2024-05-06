from flask import render_template, redirect, request, session, flash, jsonify
from flask_app import app
from flask_app.models.assessment_model import FlexibilityAssessment, BeginnerAssessment, AdvancedAssessment
from flask_app.models.client_model import Client


#Flexibility Assessment:

@app.route('/api/add_flexibility_assessment', methods=['POST'])
def add_flexibility_assessment():
    data = request.get_json()  
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    client_id = data.get('client_id') 
    if client_id is None:
        return jsonify({'error': 'Client ID not found. Unable to add flexibility assessment data for the client'}), 400
    

    required_fields = ["shoulder_flexibility", "lower_body_flexibility", "joint_mobility"]
    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing one or more required fields'}), 400

    
    flexibility_assessment_id = FlexibilityAssessment.save(data)
    if flexibility_assessment_id:
        return jsonify({'message': 'Flexibility Assessment data added for client', 'assessment_id': flexibility_assessment_id}), 200
    else:
        return jsonify({'error': 'Failed to add flexibility assessment data for client'}), 500

#Beginner Assessment:

@app.route('/api/add_beginner_assessment', methods=['POST'])
def add_beginner_assessment():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    client_id = data.get('client_id')
    if client_id is None:
        return jsonify({'error': 'Client ID not found'}), 400

 
    balance_test_string = data.get('balance_tests', 'No balance tests')

    required_fields = {
        "basic_technique": data.get("basic_technique"),
        "chair_sit_to_stand": data.get("chair_sit_to_stand"),
        "arm_curl": data.get("arm_curl"),
        "balance_test_results": balance_test_string,
        "cardio_test": data.get("cardio_test"),
        "client_id": client_id
    }

    beginner_assessment_id = BeginnerAssessment.save(required_fields)
    if beginner_assessment_id:
        return jsonify({'message': 'Assessment data successfully added', 'id': beginner_assessment_id}), 200
    else:
        return jsonify({'error': 'Failed to save assessment data'}), 500



#Advanced Assessment:

@app.route('/api/add_advanced_assessment', methods=['POST'])
def add_advanced_assessment():
    data = request.get_json()  
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    client_id = data.get('client_id')
    if client_id is None:
        return jsonify({'error': 'Client ID not found. Unable to add advanced assessment data for the client'}), 400

    strength_max_string = data.get('strength_max', 'No strength max results')

    required_fields = {
        "advanced_technique": data.get("advanced_technique"),
        "strength_max": strength_max_string,
        "strength_endurance": data.get("strength_endurance"),
        "circuit": data.get("circuit"),
        "moderate_cardio": data.get("moderate_cardio"),
        "client_id": client_id
    }

    advanced_assessment_id = AdvancedAssessment.save(required_fields)
    if advanced_assessment_id:
        return jsonify({'message': 'Assessment data successfully added', 'id': advanced_assessment_id}), 200
    else:
        return jsonify({'error': 'Failed to save assessment data'}), 500