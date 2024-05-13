from flask import request, session,jsonify
from flask_app import app
from flask_app.config.mysqlconnection import connectToMySQL
from flask_app.models.workout_rating_model import WorkoutRating


@app.route('/api/submit_feedback', methods=['POST'])
def submit_feedback():
    # Retrieve the JSON data sent with the request
    data = request.get_json()
    
    client_id = data.get('client_id')
    if client_id is None:
        return jsonify({'error': 'Client ID not found.'}), 400
    plan_id = data.get('plan_id')
    if plan_id is None:
        return jsonify({'error': 'Plan ID not found.'}), 400
    trainer_id = session.get('trainer_id')
    if trainer_id is None:
        return jsonify({'error': 'Trainer ID not found. Please log in again.'}), 401
    
    rating = data.get('rating')
    if rating is None:
        return jsonify({'error': 'Rating not found.'}), 400

    comments = data.get('comments')  

    # Instantiate the WorkoutRating model with received data
    feedback = WorkoutRating({
        'client_id': client_id,
        'trainer_id': trainer_id,
        'plan_id': plan_id,
        'rating': rating,
        'comments': comments
    })

    if feedback.save():
        return jsonify({'success': 'Feedback submitted successfully'}), 200
    else:
        return jsonify({'error': 'Failed to submit feedback'}), 500