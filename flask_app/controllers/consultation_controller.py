from flask import request, jsonify, session, json
import os
from flask_app import app
from flask_app.models.consultation_model import Consultation
from flask_app.models.global_form_questions_model import GlobalFormQuestions
from flask_app.models.trainer_intake_questions_model import TrainerIntakeQuestions
from flask_app.models.intake_forms_model import IntakeForms
from flask_app.models.intake_form_answers_model import IntakeFormAnswers
from flask_app.models.client_model import Client
from openai import OpenAI, OpenAIError



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
@app.route('/api/add_intake_form', methods=['POST'])
def add_intake_form():
    data = request.get_json()
    required_fields = ['client_id', 'form_type']
    
    for field in required_fields:
        if field not in data:
            return jsonify({'error': f'Missing required field: {field}'}), 400

    if 'trainer_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data['trainer_id'] = session['trainer_id']
    data['status'] = 'draft'  # Ensure status is 'draft' for new forms

    try:
        form_id = IntakeForms.save(data)
        if not form_id:
            raise Exception('Failed to create form')
        print(f"Form created successfully with ID: {form_id}")
        return jsonify({'id': form_id}), 201  # Ensure 'id' matches the frontend's expected key
    except Exception as e:
        print(f"Error creating form: {e}")
        return jsonify({'error': str(e)}), 500

    

@app.route('/api/update_intake_form_status', methods=['POST'])
def update_intake_form_status():
    data = request.get_json()
    form_id = data.get('form_id')
    status = data.get('status')

    if not form_id or not status:
        return jsonify({'error': 'Missing form_id or status'}), 400

    try:
        updated = IntakeForms.update({'id': form_id, 'status': status})
        if not updated:
            raise Exception('Failed to update form status')
        return jsonify({'message': 'Form status updated successfully'}), 200
    except Exception as e:
        print(f"Error updating form status: {e}")
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

        # Filter and save only non-empty answers
        for answer in answers:
            if 'answer' in answer:
                if isinstance(answer['answer'], list):
                    answer['answer'] = ','.join(answer['answer'])  # Convert list to comma-separated string
                
                if answer['answer']:  # Only save non-empty answers
                    answer['form_id'] = form_id
                    IntakeFormAnswers.save(answer)
        
        return jsonify({'form_id': form_id, 'message': 'Auto-save successful'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500




@app.route('/api/get_saved_answers', methods=['GET'])
def get_saved_answers():
    client_id = request.args.get('client_id')
    form_id = request.args.get('form_id')

    if not client_id or not form_id:
        return jsonify({'error': 'Missing required parameters'}), 400

    if 'trainer_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        saved_answers = IntakeFormAnswers.get_all_by_form(form_id)
        # Convert the answers to a JSON-serializable format
        serialized_answers = [answer.serialize() for answer in saved_answers]
        return jsonify({'answers': serialized_answers}), 200
    except Exception as e:
        print(f"Error fetching saved answers: {e}")
        return jsonify({'error': str(e)}), 500
    

@app.route('/api/generate_ai_insights/<int:client_id>', methods=['POST'])
def generate_ai_insights(client_id):
    if not client_id:
        return jsonify({"error": "Client ID not found. Please log in again."}), 401

    data = request.get_json()
    questions_answers = data.get('data')
    
    # Ensure questions and answers are provided
    if not questions_answers:
        return jsonify({'error': 'No data provided'}), 400

    # Retrieve client information to personalize the response
    client = Client.get_one(client_id)
    if not client:
        return jsonify({"success": False, "message": "Client not found."}), 404
    

    additional_instructions = f"""
    Based on the following responses from the client, {client.name}, please provide insights. Analyze the data to highlight potential issues, suggest appropriate workout plans, recommend assessments to perform, and identify any noticeable trends. Your insights should be personalized, actionable, and relevant to the client's goals and responses.
    """

    # Format the input for OpenAI
    formatted_data = "\n".join([f"Q: {qa['question']}\nA: {qa['answer']}" for qa in questions_answers])
    final_prompt = formatted_data + additional_instructions

    try:
    # Making the request to the OpenAI API
        client_ai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        completion = client_ai.chat.completions.create(
            model="gpt-4o-2024-05-13",  # Model (Newest One)
            messages=[{"role": "system", "content": "You are an AI providing fitness insights."}, {"role": "user", "content": final_prompt}],
            max_tokens=3000,  # Adjust as needed (how big the responses are)
            temperature=0  # Control the randomness?
        )
        insights = completion.choices[0].message.content.strip()

        # Store insights in session
        session['ai_insights'] = insights

        return jsonify({'message': 'AI insights generated successfully'}), 200
    except Exception as e:
        print(f"Error generating AI insights: {e}")
        return jsonify({'error': str(e)}), 500

