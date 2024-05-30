from flask import request, jsonify
import requests
from flask_app import app
from flask_app.config.mysqlconnection import connectToMySQL
import os
from dotenv import load_dotenv
from flask_app.models.exercise_library_model import ExerciseLibrary



@app.route('/api/load_all_exercises', methods=['GET'])
def load_all_exercises():
    # Check if the exercises have already been loaded
    if ExerciseLibrary.get_all():
        return 'Exercises already loaded into the database', 200

    url = 'https://exercisedb.p.rapidapi.com/exercises'
    headers = {
        'X-RapidAPI-Key': os.getenv('RAPIDAPI_KEY'),
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
    }
    querystring = {"limit": "1400"}
    response = requests.get(url, headers=headers, params=querystring)
    data = response.json()

    for exercise in data:
        new_exercise = {
            'name': exercise['name'],
            'body_part': exercise['bodyPart'],
            'equipment': exercise['equipment'],
            'target_muscle': exercise.get('target', ''),
            'secondary_muscles': ', '.join(exercise.get('secondaryMuscles', [])),
            'instructions': ', '.join(exercise.get('instructions', [])),
            'gif_url': exercise['gifUrl'],
            'video_url': '',  # Default value for video_url
            'fitness_level': ''  # Default value for fitness_level
        }
        ExerciseLibrary.save(new_exercise)

    return 'Exercises loaded into the database', 201


@app.route('/api/get_all_exercises', methods=['GET'])
def get_all_exercises():
    exercises = ExerciseLibrary.get_all()
    return jsonify([e.serialize() for e in exercises])

@app.route('/api/exercises_by_body_part', methods=['GET'])
def get_exercises_by_body_part():
    body_part = request.args.get('bodyPart')
    exercises = ExerciseLibrary.get_exercises_by_body_part(body_part)
    return jsonify([e.serialize() for e in exercises])


@app.route('/api/body_parts', methods=['GET'])
def get_body_parts():
    body_parts = ExerciseLibrary.get_body_parts()
    
    # Combine 'upper arms' and 'lower arms' into 'Arms'
    # Combine 'upper legs' and 'lower legs' into 'Legs'
    # Combine 'shoulders' and 'neck' into 'Shoulders'
    combined_body_parts = set()
    for part in body_parts:
        if 'arm' in part.lower():
            combined_body_parts.add('Arms')
        elif 'leg' in part.lower():
            combined_body_parts.add('Legs')
        elif 'shoulder' in part.lower() or 'neck' in part.lower():
            combined_body_parts.add('Shoulders')
        else:
            combined_body_parts.add(part.capitalize())
    
    return jsonify(list(combined_body_parts))