from flask import redirect, request, session, jsonify
from flask_app import app
from flask_app.config.mysqlconnection import connectToMySQL
from flask_app.models.client_model import Client
from flask_app.models.trainer_model import Trainer
from flask_app.models.consultation_model import Consultation
from flask_app.models.demo_plans_model import DemoPlan
from flask_app.models.workout_progress_model import WorkoutProgress
from flask_app.models.generated_plans_model import GeneratedPlan
from flask_app import mail
from flask_mail import Message
from flask_cors import cross_origin



@app.route('/api/total_clients')
def total_clients():
    trainer_id = session.get('trainer_id')
    if not trainer_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        total_clients = Client.count_by_trainer(trainer_id)
        return jsonify({'success': True, 'total_clients': total_clients})
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
