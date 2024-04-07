from flask import render_template, redirect, request, session, flash
from flask_app import app
from flask_app.models.consultation_model import Consultation
from flask_app.models.client_model import Client




@app.route('/consultation/<int:client_id>')
def consultation(client_id):
    return render_template('intakepages/consultation.html', client_id=client_id, first_name=session.get('first_name'), last_name=session.get('last_name'))



@app.route('/save_fitness_experience', methods=['POST'])
def save_fitness_experience():
    client_id = request.form.get('client_id')
    if client_id is None:
        flash("Client ID not found. Unable to save fitness experience data.", 'error')
        return redirect(f'/consultation/{client_id}')
    data = {
        'prior_exercise_programs': request.form['prior_exercise_programs'],
        'exercise_habits': request.form['exercise_habits'],
        'fitness_goals': request.form['fitness_goals'],
        'progress_measurement': request.form['progress_measurement'],
        'area_specifics': request.form['area_specifics'],
        'exercise_likes': request.form['exercise_likes'],
        'exercise_dislikes': request.form['exercise_dislikes'],
        'diet_description': request.form['diet_description'],
        'dietary_restrictions': request.form['dietary_restrictions'],
        'processed_food_consumption': request.form['processed_food_consumption'],
        'daily_water_intake': request.form['daily_water_intake'],
        'daily_routine': request.form['daily_routine'],
        'stress_level': request.form['stress_level'],
        'smoking_alcohol_habits': request.form['smoking_alcohol_habits'],
        'hobbies': request.form['hobbies'],
        'client_id': client_id,
        'client_first_name': session.get('first_name'),
        'client_last_name': session.get('last_name')

    }

    # Create a new instance of Consultation class

    consultation_id = client_id
    
    Consultation.save(data)

    # Redirect to the next step or a confirmation page
    return redirect(f'/medical_history/{client_id}')

