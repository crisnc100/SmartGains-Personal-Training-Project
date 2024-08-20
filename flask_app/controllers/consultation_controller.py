from flask import request, jsonify, session
import os
import json
from json.decoder import JSONDecodeError
from flask_app import app
from flask_app.models.client_summaries_model import ClientSummaries
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
        # Check if an initial consultation form already exists for the client
        existing_form = IntakeForms.get_by_client_and_type(data['client_id'], 'initial consultation')
        if existing_form:
            return jsonify({'form_id': existing_form['id']}), 200
        
        form_id = IntakeForms.save(data)
        if not form_id:
            raise Exception('Failed to create form')
        return jsonify({'form_id': form_id}), 201
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
        # Ensure form_id is treated as an integer
        update_data = {'id': int(form_id), 'status': status}

        # Call the update method
        IntakeForms.update(update_data)
        print("Update operation called successfully.")

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

    
@app.route('/api/final_intake_save', methods=['POST'])
def final_intake_save():
    data = request.get_json()
    form_id = data.get('form_id')
    answers = data.get('answers')

    if not form_id or not answers:
        return jsonify({'error': 'Missing form_id or answers'}), 400

    try:
        for answer in answers:
            if isinstance(answer['answer'], list):
                answer['answer'] = ','.join(answer['answer'])  # Convert list to comma-separated string
            answer['form_id'] = form_id
            IntakeFormAnswers.save(answer)

        return jsonify({'message': 'Answers saved successfully'}), 200
    except Exception as e:
        print(f"Error saving answers: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/check_intake_form/<int:client_id>', methods=['GET'])
def check_intake_form(client_id):
    form_type = 'initial consultation'
    
    try:
        # Check if an initial consultation form already exists for the client
        existing_form = IntakeForms.get_by_client_and_type(client_id, form_type)
        if existing_form:
            # Return existing form details if found
            return jsonify({
                'form_exists': True,
                'form_id': existing_form['id'],
                'form_status': existing_form['status'],
                'client_first_name': existing_form['client_first_name'],
                'client_last_name': existing_form['client_last_name']
            }), 200
        else:
            # No existing form found
            return jsonify({'form_exists': False}), 200
    except Exception as e:
        print(f"Error checking form: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_intake_form_data', methods=['GET'])
def get_intake_form_data():
    client_id = request.args.get('client_id')
    form_id = request.args.get('form_id')

    if not client_id or not form_id:
        return jsonify({'error': 'Missing required parameters'}), 400

    if 'trainer_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    try:
        # Fetch saved answers with question text
        saved_answers = IntakeFormAnswers.get_all_by_form_with_question_text(form_id)
        serialized_answers = [answer.serialize() for answer in saved_answers]

        return jsonify({
            'answers': serialized_answers,
        }), 200
    except Exception as e:
        print(f"Error fetching intake form data: {e}")
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
    

@app.route('/api/create_client_summary/<int:client_id>', methods=['POST'])
def create_client_summary(client_id):
    if not client_id:
        return jsonify({"error": "Client ID not found. Please log in again."}), 401

    data = request.get_json()
    form_id = data.get('form_id')
    summary_type = data.get('summary_type', 'Initial Consultation')  # Default to 'Initial Consultation'
    questions_answers = data.get('data')
    
    # Ensure questions and answers are provided
    if not questions_answers:
        return jsonify({'error': 'No data provided'}), 400

    # Retrieve client information to personalize the response
    client = Client.get_one(client_id)
    if not client:
        return jsonify({"success": False, "message": "Client not found."}), 404
    

    additional_instructions = f"""
    Please generate a structured client summary in JSON format based on the following responses from 
    {client.first_name} {client.last_name}. The JSON should contain the following fields:
    - "summary_text":  A detailed summary formatted in bullet points, including:
                        1. The client’s main fitness goals and any challenges or obstacles mentioned.
                        2. Medical history or physical limitations that should be considered in their fitness journey.
                        3. Exercise preferences and dislikes to guide the creation of a personalized workout plan.
                        4. Any relevant lifestyle factors that may influence their fitness plan.
                        5. The client's motivation for pursuing their fitness goals.
    - "summary_prompt": A concise and cohesive narrative summary that can be directly used to 
    generate a personalized workout plan.

    Make sure the JSON is properly formatted and that all fields are included. For example:
{{
  "summary_text": "Your detailed summary here...",
  "summary_prompt": "Your concise prompt here..."
}}
    """

    # Format the input for OpenAI
    formatted_data = "\n".join([f"Q: {qa['question']}\nA: {qa['answer']}" for qa in questions_answers])
    final_prompt = formatted_data + "\n\n" + additional_instructions

    try:
    # Making the request to the OpenAI API
        client_ai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        completion = client_ai.chat.completions.create(
            model="gpt-4o-mini",  # Model (Newest One)
            messages=[{"role": "system", "content": """AI fitness assistant. Your task is to analyze client 
                       data and generate both a detailed summary and a prompt for generating a workout plan."""}, 
                      {"role": "user", "content": final_prompt}],
            max_tokens=3000,  # Adjust as needed (how big the responses are)
            temperature=0.3  # Control the randomness?
        )
        client_summary = completion.choices[0].message.content.strip()
        print("Raw AI Response:", client_summary)

        if client_summary.startswith("```json"):
            client_summary = client_summary.replace("```json", "").replace("```", "").strip()

        summary_data = json.loads(client_summary)
        if isinstance(summary_data.get('summary_text'), list):
            summary_text = "\n".join(summary_data.get('summary_text'))
        else:
            summary_text = summary_data.get('summary_text', '')
        summary_prompt = summary_data.get('summary_prompt', '')

    # Save to the database
        client_summaries = ClientSummaries(
            summary_text=summary_text,
            summary_prompt=summary_prompt,
            client_id=client_id,
            form_id=form_id,
            summary_type=summary_type  # Set based on input or default
        )
        client_summaries.save()

        return jsonify({'message': 'Client AI summary generated and saved successfully'}), 200
    except json.JSONDecodeError as e:
        print(f"Error decoding JSON: {e}")
        return jsonify({'error': f"JSON decoding error: {e}"}), 500
    except Exception as e:
        print(f"Error generating Client AI summary: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/get_recent_client_summary/<int:client_id>', methods=['GET'])
def get_recent_client_summary(client_id):
    # Fetch the latest client summary by client ID
    client_summary = ClientSummaries.get_latest_by_client_id(client_id)
    
    if client_summary:
        # Serialize the client summary and flatten the structure
        serialized_summary = client_summary.serialize()

        # Remove unnecessary nesting and return a flat structure
        return jsonify({
            'client_summary': {
                'id': serialized_summary.get('id'),
                'client_id': serialized_summary.get('client_id'),
                'form_id': serialized_summary.get('form_id'),
                'summary_prompt': serialized_summary.get('summary_prompt'),
                'summary_text': serialized_summary.get('summary_text'),
                'summary_type': serialized_summary.get('summary_type'),
                'created_at': serialized_summary.get('created_at'),
                'updated_at': serialized_summary.get('updated_at'),
            }
        }), 200
    else:
        return jsonify({'error': 'No Client AI summary found'}), 404


@app.route('/api/get_base_prompts/<int:client_id>', methods=['GET'])
def get_base_prompts(client_id):
    client_summaries = ClientSummaries.get_all_by_client_id(client_id)
    if not client_summaries:
        return jsonify({"error": "No summaries found for this client."}), 404

    summaries = [summary.serialize() for summary in client_summaries]
    return jsonify(summaries)





