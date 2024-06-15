from flask import request, jsonify, session
import requests
from flask_app import app
from flask_app.config.mysqlconnection import connectToMySQL
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
from flask import send_from_directory
from flask_app.models.exercise_library_model import ExerciseLibrary
from flask_app.models.custom_library_model import CustomExercises
from flask_app.models.favorite_exercises_model import FavoriteExercise
import os
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', '..', 'client', 'public', 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'mp4', 'avi', 'mov'}


#Exercise Library Component Sections:
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

@app.route('/api/update_gif_urls', methods=['GET'])
def update_gif_urls():
    url = 'https://exercisedb.p.rapidapi.com/exercises'
    headers = {
        'X-RapidAPI-Key': os.getenv('RAPIDAPI_KEY'),
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
    }

    querystring = {"limit": "1400"}  # Adjust the limit as needed
    response = requests.get(url, headers=headers, params=querystring)
    data = response.json()

    # Log the response for debugging
    print(f"API Response: {data}")

    for exercise in data:
        exercise_name = exercise['name']
        new_gif_url = exercise['gifUrl']

        existing_exercise = ExerciseLibrary.get_by_name(exercise_name)
        if existing_exercise:
            updated_exercise = existing_exercise.serialize()
            updated_exercise['gif_url'] = new_gif_url
            ExerciseLibrary.update(updated_exercise)

    return 'GIF URLs updated', 200





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



def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads/<path:filename>')
def uploaded_workout(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/add_custom_exercise', methods=['POST'])
def add_new_exercise():
    if 'name' not in request.form:
        return jsonify({'error': 'No input data provided'}), 400
    
    try:
        # Ensure trainer_id is in session
        if 'trainer_id' not in session:
            return jsonify({'error': 'Trainer not authenticated'}), 401
        
        trainer_id = session['trainer_id']
        
        new_exercise = {
            'name': request.form.get('name'),
            'body_part': request.form.get('body_part'),
            'equipment': request.form.get('equipment'),
            'target_muscle': request.form.get('target_muscle'),
            'secondary_muscles': request.form.get('secondary_muscles', ''),
            'instructions': request.form.get('instructions', ''),
            'gif_url': request.form.get('gif_url', ''),
            'video_url': request.form.get('video_url', ''),
            'fitness_level': request.form.get('fitness_level'),
            'trainer_id': trainer_id
        }

        # Handle gif file upload
        if 'gif_file' in request.files and request.files['gif_file'].filename != '':
            gif_file = request.files['gif_file']
            if allowed_file(gif_file.filename):
                filename = secure_filename(gif_file.filename)
                gif_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                gif_file.save(gif_file_path)
                new_exercise['gif_url'] = f'/uploads/{filename}'
        
        # Handle video file upload
        if 'video_file' in request.files and request.files['video_file'].filename != '':
            video_file = request.files['video_file']
            if allowed_file(video_file.filename):
                filename = secure_filename(video_file.filename)
                video_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                video_file.save(video_file_path)
                new_exercise['video_url'] = f'/uploads/{filename}'

        # Assuming CustomExercises.save(new_exercise) is your method to save the exercise
        exercise_id = CustomExercises.save(new_exercise)
        return jsonify({'message': 'Exercise added successfully', 'exercise_id': exercise_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
    
@app.route('/api/update_custom_exercise/<int:exercise_id>', methods=['PUT'])
def update_custom_exercise(exercise_id):
    if not request.form:
        return jsonify({'error': 'No input data provided'}), 400
    
    try:
        if 'trainer_id' not in session:
            return jsonify({'error': 'Trainer not authenticated'}), 401
        
        trainer_id = session['trainer_id']
        
        updated_exercise = {
            'id': exercise_id,
            'name': request.form.get('name'),
            'body_part': request.form.get('body_part'),
            'equipment': request.form.get('equipment'),
            'target_muscle': request.form.get('target_muscle'),
            'secondary_muscles': request.form.get('secondary_muscles', ''),
            'instructions': request.form.get('instructions', ''),
            'gif_url': request.form.get('gif_url', ''),
            'video_url': request.form.get('video_url', ''),
            'fitness_level': request.form.get('fitness_level')
        }

        if 'gif_file' in request.files and request.files['gif_file'].filename != '':
            gif_file = request.files['gif_file']
            if allowed_file(gif_file.filename):
                filename = secure_filename(gif_file.filename)
                gif_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                gif_file.save(gif_file_path)
                updated_exercise['gif_url'] = f'/uploads/{filename}'
        
        if 'video_file' in request.files and request.files['video_file'].filename != '':
            video_file = request.files['video_file']
            if allowed_file(video_file.filename):
                filename = secure_filename(video_file.filename)
                video_file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                video_file.save(video_file_path)
                updated_exercise['video_url'] = f'/uploads/{filename}'

        CustomExercises.update(updated_exercise)
        return jsonify({'message': 'Exercise updated successfully', 'updatedExercise': updated_exercise}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/get_custom_by_body_part', methods=['GET'])
def get_custom_by_body_part():
    body_part = request.args.get('bodyPart')
    if not body_part:
        return jsonify({'error': 'No body part provided'}), 400
    
    try:
        exercises = CustomExercises.get_exercises_by_body_part(body_part)
        return jsonify([exercise.serialize() for exercise in exercises]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/get_custom_exercises', methods=['GET'])
def get_custom_exercises():
    trainer_id = session.get('trainer_id')
    if not trainer_id:
        return jsonify({'error': 'Unauthorized'}), 401
    
    try:
        exercises = CustomExercises.get_all_by_trainer_id(trainer_id)
        return jsonify([exercise.serialize() for exercise in exercises]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/custom_exercises', methods=['POST'])
def add_custom_exercise():
    data = request.get_json()
    data['exercise_type'] = 'custom'
    
    try:
        custom_exercise_id = FavoriteExercise.save(data)
        return jsonify({"status": "success", "id": custom_exercise_id}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route('/api/edit_custom_exercise', methods=['POST'])
def edit_custom_exercise():
    pass





@app.route('/api/remove_custom_exercise/<int:id>', methods=['DELETE'])
def remove_custom_exercise(id):
    try:
        result = CustomExercises.delete(id)
        if result:
            return jsonify({"status": "success", "message": "Custom exercise removed"}), 200
        else:
            return jsonify({"status": "error", "message": "Exercise not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    


@app.route('/api/add_favorite_exercise', methods=['POST'])
def add_favorite_exercise():
    data = request.get_json()

    if 'trainer_id' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401

    data['trainer_id'] = session['trainer_id']

    # Check if all required fields are present
    required_fields = ['exercise_type', 'trainer_id', 'exercise_id', 'custom_exercise_id']
    for field in required_fields:
        if field not in data:
            return jsonify({"status": "error", "message": f"'{field}' is required"}), 400

    try:
        favorite_exercise_id = FavoriteExercise.save(data)
        return jsonify({"status": "success", "id": favorite_exercise_id}), 201
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
    


@app.route('/api/get_favorite_exercises', methods=['GET'])
def get_favorite_exercises():
    trainer_id = session.get('trainer_id')
    if not trainer_id:
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        exercises = FavoriteExercise.get_all_by_trainer_id(trainer_id)
        return jsonify([exercise.serialize() for exercise in exercises]), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500





@app.route('/api/remove_favorite_exercise/<int:id>', methods=['DELETE'])
def remove_favorite_exercise(id):
    try:
        result = FavoriteExercise.delete(id)
        if result:
            return jsonify({"status": "success", "message": "Favorite exercise removed"}), 200
        else:
            return jsonify({"status": "error", "message": "Exercise not found"}), 404
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    



