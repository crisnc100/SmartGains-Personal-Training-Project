from flask import request, jsonify, session, json
from flask_app import app
from flask_app.models.global_assessments_model import GlobalAssessments
from flask_app.models.client_assessments_model import ClientAssessments
from flask_app.models.client_model import Client


@app.route('/api/get_all_assessments', methods=['GET'])
def get_all_assessments():
    assessments = GlobalAssessments.get_all()
    return jsonify([a.serialize() for a in assessments])

@app.route('/api/add_assessment_for_client', methods=['POST'])
def add_assessment_for_client():
    data = request.get_json()
    if 'trainer_id' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401

    trainer_id = session['trainer_id']
    assessments = data.get('assessments')

    if not assessments:
        return jsonify({'error': 'Missing required fields'}), 400

    for assessment in assessments:
        if 'client_id' not in assessment or 'assessment_id' not in assessment or 'input_data' not in assessment:
            return jsonify({'error': 'Missing required fields'}), 400
        assessment['trainer_id'] = trainer_id
        assessment['input_data'] = json.dumps(assessment['input_data'])  # Ensure input_data is serialized as JSON
        result = ClientAssessments.save(assessment)
        if not result:
            return jsonify({'error': 'Failed to add assessment'}), 500

    return jsonify({'message': 'Assessment added to client successfully'}), 201






@app.route('/api/client_assessments/<int:client_id>', methods=['GET'])
def get_all_assessments_for_client(client_id):
    assessments = ClientAssessments.get_all_by_client_id(client_id)
    return jsonify([assessment.serialize() for assessment in assessments])


# Endpoint to get data from a specific client assessment
@app.route('/api/client_assessment/<int:assessment_id>', methods=['GET'])
def get_client_assessment_data(assessment_id):
    assessment = ClientAssessments.get_by_id(assessment_id)
    if assessment:
        return jsonify(assessment.serialize())
    else:
        return jsonify({'error': 'Assessment not found'}), 404


@app.route('/api/update_client_assessment/<int:assessment_id>', methods=['PUT'])
def update_client_assessment_data(assessment_id):
    data = request.get_json()
    data['id'] = assessment_id
    result = ClientAssessments.update(data)
    if result:
        return jsonify({'message': 'Assessment data updated successfully'}), 200
    else:
        return jsonify({'error': 'Failed to update assessment data'}), 500

# Endpoint to delete a specific client assessment
@app.route('/api/delete_client_assessment/<int:assessment_id>', methods=['DELETE'])
def delete_client_assessment(assessment_id):
    result = ClientAssessments.delete(assessment_id)
    if result:
        return jsonify({'message': 'Assessment deleted successfully'}), 200
    else:
        return jsonify({'error': 'Failed to delete assessment'}), 500