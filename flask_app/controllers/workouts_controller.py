from flask import render_template, redirect, request, session, flash, url_for, jsonify
from flask_app import app
from flask_app.config.mysqlconnection import connectToMySQL
from flask_app.models.client_model import Client
from flask_app.models.demo_plans_model import DemoPlan
from flask_app.models.workout_progress_model import WorkoutProgress

@app.route('/view_demo_plan/<int:client_id>')
def view_demo_plan():
    pass

@app.route('/edit_demo_plan/<int:client_id>')
def edit_demo_plan():
    pass

@app.route('/workout_record/<int:client_id>')
def workout_record(client_id):
    session['client_id'] = client_id
    return render_template('clientpages/record_workout.html',client_id=client_id)

@app.route('/workout_create', methods=['POST'])
def workout_create():
    client_id = request.form.get('client_id')
    if client_id is None:
        flash("Client ID not found. Unable to record workout.", 'error')
        return redirect(f'/workout_record/{client_id}')
    
    
    workout_progress_data = {
        'date': request.form['date'],
        'workout_type': request.form['workout_type'],
        'duration_minutes': request.form['duration_minutes'],
        'exercises_log': request.form['exercises_log'],
        'intensity_level': request.form['intensity_level'],
        'location': request.form['location'],
        'workout_rating': request.form['workout_rating'],
        'client_id': client_id
    }

    WorkoutProgress.save(workout_progress_data)

    return redirect(f'/current_client/{client_id}')



