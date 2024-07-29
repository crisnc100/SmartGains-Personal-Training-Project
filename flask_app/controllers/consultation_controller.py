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

        # Filter out global questions that are marked as deleted by the trainer
        user_deleted_question_ids = {uq.global_question_id for uq in user_questions if uq.action == 'delete'}
        global_questions = [q for q in global_questions if q.id not in user_deleted_question_ids]

        # Combine global questions with user-specific edits and additions
        combined_questions = {q.id: q for q in global_questions}
        for uq in user_questions:
            if uq.action == 'edit' or uq.action == 'add':
                combined_questions[uq.global_question_id or uq.id] = uq

        return jsonify([question.serialize() for question in combined_questions.values()]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/get_user_question/<int:question_id>', methods=['GET'])
def get_user_question(question_id):
    try:
        trainer_id = session.get('trainer_id')
        question = TrainerIntakeQuestions.get_by_global_question_id(trainer_id, question_id)
        if question:
            return jsonify(question.serialize()), 200
        else:
            return jsonify({'error': 'Question not found'}), 404
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

@app.route('/api/get_questions_by_template/<template>', methods=['GET'])
def get_questions_by_template(template):
    try:
        questions = GlobalFormQuestions.get_by_template(template)
        return jsonify([question.serialize() for question in questions]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/add_user_question', methods=['POST'])
def add_user_question():
    data = request.get_json()
    data['trainer_id'] = session.get('trainer_id')
    data['action'] = 'add'
    data['global_question_id'] = None  # New question, so no global question ID

    try:
        new_question_id = TrainerIntakeQuestions.update_or_create(data)
        return jsonify({'id': new_question_id}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/update_user_question/<int:question_id>', methods=['PUT'])
def update_user_question(question_id):
    data = request.get_json()
    data['trainer_id'] = session.get('trainer_id')
    data['global_question_id'] = question_id
    data['action'] = 'edit'

    try:
        TrainerIntakeQuestions.update_or_create(data)
        return jsonify({'message': 'Question updated successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/delete_user_question/<int:question_id>', methods=['DELETE'])
def delete_user_question(question_id):
    if 'trainer_id' not in session:
        return jsonify({"status": "error", "message": "Unauthorized"}), 401

    trainer_id = session['trainer_id']
    data = {
        'trainer_id': trainer_id,
        'global_question_id': question_id,
        'action': 'delete'
    }

    try:
        TrainerIntakeQuestions.update_or_create(data)
        return jsonify({'message': 'Question deleted successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/restore_user_questions', methods=['GET'])
def restore_user_questions():
    try:
        if 'trainer_id' not in session:
            return jsonify({"status": "error", "message": "Unauthorized"}), 401

        trainer_id = session['trainer_id']
        TrainerIntakeQuestions.delete_all_by_trainer(trainer_id)
        return jsonify({'message': 'All questions restored successfully'}), 200
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
