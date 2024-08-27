from flask import jsonify
from flask_app import app

from flask_app.models.client_model import Client

from flask_app.models.client_assessments_model import ClientAssessments




@app.route("/api/view_exercise_highlights/<int:client_id>", methods=['GET'])
def view_exercise_highlights(client_id):
    pass