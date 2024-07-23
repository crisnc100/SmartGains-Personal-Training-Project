from flask import request, jsonify, session, json
from flask_app import app
from flask_app.models.consultation_model import Consultation
from flask_app.models.global_form_questions_model import GlobalFormQuestions
from flask_app.models.trainer_intake_questions_model import TrainerIntakeQuestions
from flask_app.models.intake_forms_model import IntakeForms
from flask_app.models.intake_form_answers_model import IntakeFormAnswers
from flask_app.models.client_model import Client

@app.route('/api/add_consultation', methods=['POST'])
def add_consultation():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400

    client_id = data.get('client_id')
    if client_id is None:
        return jsonify({'error': 'Client ID not found. Unable to add consultation for the client.'}), 400

    required_fields = [
        'prior_exercise_programs',
        'exercise_habits',
        'exercise_time_day',
        'self_fitness_level',
        'fitness_goals',
        'motivation',
        'progress_measurement',
        'barriers_challenges',
        'area_specifics',
        'exercise_likes',
        'exercise_dislikes',
        'warm_up_info',
        'cool_down_info',
        'stretching_mobility',
        'daily_routine',
        'stress_level',
        'smoking_alcohol_habits',
        'hobbies',
        'fitness_goals_other',
        'motivation_other'
    ]

    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing one or more required fields'}), 400

    # Convert the fitness_goals and motivation lists to a comma-separated string if they are lists or tuples
    for field in ['fitness_goals', 'motivation']:
        if isinstance(data.get(field), (list, tuple)):
            data[field] = ','.join(data[field])

    # Save the consultation data using the model
    consultation_id = Consultation.save(data)
    if consultation_id:
        return jsonify({'message': 'Consultation data added for client'}), 200
    else:
        return jsonify({'error': 'Failed to add consultation data for client'}), 500


# Global Questions Endpoints
@app.route('/api/get_global_questions', methods=['GET'])
def get_global_questions():
    try:
        questions = GlobalFormQuestions.get_all()
        return jsonify([question.serialize() for question in questions]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/global_questions_category/<category>', methods=['GET'])
def get_global_questions_by_category(category):
    try:
        questions = GlobalFormQuestions.get_by_category(category)
        return jsonify([question.serialize() for question in questions]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Trainer (User) Specific Questions Endpoints
@app.route('/api/get_user_questions', methods=['GET'])
def get_user_questions():
    try:
        if 'trainer_id' not in session:
            return jsonify({"status": "error", "message": "Unauthorized"}), 401

        trainer_id = session['trainer_id']
        user_questions = TrainerIntakeQuestions.get_all_by_trainer(trainer_id)
        global_questions = GlobalFormQuestions.get_all()

        # Combine global questions with user-specific questions
        combined_questions = {q.id: q for q in global_questions}
        for uq in user_questions:
            combined_questions[uq.id] = uq

        return jsonify([question.serialize() for question in combined_questions.values()]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/get_user_default_questions', methods=['GET'])
def get_user_default_questions():
    try:
        if 'trainer_id' not in session:
            return jsonify({"status": "error", "message": "Unauthorized"}), 401

        trainer_id = session['trainer_id']
        user_questions = TrainerIntakeQuestions.get_all_by_trainer(trainer_id)
        global_default_questions = GlobalFormQuestions.get_all_defaults()

        # Merge global default questions with user-specific questions
        combined_questions = {q.id: q for q in global_default_questions}
        for uq in user_questions:
            combined_questions[uq.id] = uq

        return jsonify([question.serialize() for question in combined_questions.values()]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/add_user_questions', methods=['POST'])
def add_user_question():
    data = request.get_json()
    try:
        new_question_id = TrainerIntakeQuestions.save(data)
        return jsonify({'id': new_question_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/update_user_questions/<int:question_id>', methods=['PUT'])
def update_user_question(question_id):
    data = request.get_json()
    data['id'] = question_id
    try:
        TrainerIntakeQuestions.update(data)
        return jsonify({'message': 'Question updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete_user_questions/<int:question_id>', methods=['DELETE'])
def delete_user_question(question_id):
    trainer_id = request.args.get('trainer_id')
    try:
        TrainerIntakeQuestions.delete(question_id, trainer_id)
        return jsonify({'message': 'Question deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Intake Forms and Answers Endpoints
@app.route('/api/create_intake_forms', methods=['POST'])
def create_intake_form():
    data = request.get_json()
    try:
        form_id = IntakeForms.save(data)
        return jsonify({'id': form_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_intake_forms/<int:client_id>', methods=['GET'])
def get_intake_form_by_client(client_id):
    try:
        forms = IntakeForms.get_by_client_id(client_id)
        return jsonify([form.serialize() for form in forms]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/save_intake_form_answers', methods=['POST'])
def save_intake_form_answers():
    data = request.get_json()
    try:
        for answer in data['answers']:
            IntakeFormAnswers.save(answer)
        return jsonify({'message': 'Answers saved successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_intake_form_answers/<int:form_id>', methods=['GET'])
def get_all_answers_by_form(form_id):
    try:
        answers = IntakeFormAnswers.get_all_by_form(form_id)
        return jsonify([answer.serialize() for answer in answers]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# New Endpoint to Get Merged Questions
@app.route('/api/get_merged_questions/<int:trainer_id>', methods=['GET'])
def get_merged_questions(trainer_id):
    try:
        user_questions = TrainerIntakeQuestions.get_all_by_trainer(trainer_id)
        global_questions = GlobalFormQuestions.get_all()

        # Combine global questions with user-specific questions
        combined_questions = []
        user_question_ids = {uq.id for uq in user_questions}
        for gq in global_questions:
            if gq.id not in user_question_ids:
                combined_questions.append(gq)
        combined_questions.extend(user_questions)

        return jsonify([question.serialize() for question in combined_questions]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
