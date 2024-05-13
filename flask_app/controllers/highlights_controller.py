from flask import jsonify
from flask_app import app
from flask_app.models.consultation_model import Consultation
from flask_app.models.client_model import Client
from flask_app.models.history_model import History
from flask_app.models.assessment_model import FlexibilityAssessment, BeginnerAssessment, AdvancedAssessment




@app.route("/api/view_exercise_highlights/<int:client_id>", methods=['GET'])
def view_exercise_highlights(client_id):
    print(f"Received request to view highlights for client_id: {client_id}")

    
    client_data = Client.get_one(client_id)
    if not client_data:
        print(f"No client data found for client_id: {client_id}")
        return jsonify({'error': 'No client data found'}), 404

    consultation_data = Consultation.get_by_client_id(client_id)
    flexibility_assessment_data = FlexibilityAssessment.get_by_client_id(client_id)
    advanced_assessment_data = AdvancedAssessment.get_by_client_id(client_id)
    beginner_assessment_data = BeginnerAssessment.get_by_client_id(client_id)
    history_data = History.get_by_client_id(client_id)


    if not any([consultation_data, flexibility_assessment_data, advanced_assessment_data, beginner_assessment_data, history_data]):
        print(f"Incomplete data for client_id: {client_id}")
        return jsonify({'error': 'Incomplete client data'}), 404


    all_intake_data = {
        "client_data": client_data.serialize() if client_data else {},
        "consultation_data": consultation_data.serialize() if consultation_data else {},
        "flexibility_assessment_data": flexibility_assessment_data.serialize() if flexibility_assessment_data else {},
        "advanced_assessment_data": advanced_assessment_data.serialize() if advanced_assessment_data else {},
        "beginner_assessment_data": beginner_assessment_data.serialize() if beginner_assessment_data else {},
        "history_data": history_data.serialize() if history_data else {},
    }
    
    print(f"Successfully retrieved all data for client_id: {client_id}")
    return jsonify(all_intake_data)

