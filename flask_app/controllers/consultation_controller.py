from flask import request, jsonify, session, json
from flask_app import app
from flask_app.models.consultation_model import Consultation
from flask_app.models.global_form_questions_model import GlobalFormQuestions
from flask_app.models.trainer_intake_questions_model import TrainerIntakeQuestions
from flask_app.models.intake_forms_model import IntakeForms
from flask_app.models.intake_form_answers_model import IntakeFormAnswers
from flask_app.models.client_model import Client


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
@app.route('/api/add_intake_forms', methods=['POST'])
def add_intake_form():
    data = request.get_json()
    required_fields = ['form_type', 'client_id']
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    if 'trainer_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data['trainer_id'] = session['trainer_id']
    data['status'] = 'completed'

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


    
@app.route('/api/auto_save_intake_form', methods=['POST'])
def auto_save_intake_form():
    data = request.get_json()
    required_fields = ['client_id', 'form_data', 'answers']
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    if 'trainer_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data['trainer_id'] = session['trainer_id']
    form_data = data['form_data']
    form_data['status'] = 'draft'  # Ensure status is 'draft' for auto-save
    form_data['client_id'] = data['client_id']  # Ensure client_id is included in form_data
    form_data['trainer_id'] = data['trainer_id']  # Ensure trainer_id is included in form_data
    answers = data['answers']

    try:
        if 'form_id' in form_data and form_data['form_id']:
            form_id = form_data['form_id']
            # Update existing form
            IntakeForms.update(form_data)
        else:
            # Create new form
            form_id = IntakeForms.save(form_data)
            if not form_id:
                raise Exception('Failed to create form')
            form_data['form_id'] = form_id  # Ensure form_id is set in form_data

        print(f"Auto-save: form_id set to {form_id}")

        # Filter and save only non-empty answers
        for answer in answers:
            if answer['answer']:  # Only save non-empty answers
                answer['form_id'] = form_id
                print(f"Saving answer for question_id {answer['question_id']} with answer: {answer['answer']}")
                IntakeFormAnswers.save(answer)
        
        return jsonify({'form_id': form_id, 'message': 'Auto-save successful'}), 201
    except Exception as e:
        print(f"Error during auto-save: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/get_intake_form_answers/<int:form_id>', methods=['GET'])
def get_all_answers_by_form(form_id):
    try:
        answers = IntakeFormAnswers.get_all_by_form(form_id)
        return jsonify([answer.serialize() for answer in answers]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
