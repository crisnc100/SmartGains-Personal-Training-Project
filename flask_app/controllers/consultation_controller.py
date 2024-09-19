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

        combined_questions = {}

        for gq in global_questions:
            gq_data = gq.serialize()
            gq_data['question_source'] = 'global'
            combined_questions[f'global_{gq.id}'] = gq_data  # Ensure unique key for global questions

        for tq in user_questions:
            tq_data = tq.serialize()
            tq_data['question_source'] = 'trainer'
            if tq.action == 'edit' and tq.global_question_id:
                combined_questions[f'global_{tq.global_question_id}'] = tq_data  # Replace global question with edited trainer question
            elif tq.action == 'add':
                combined_questions[f'trainer_{tq.id}'] = tq_data  # Ensure unique key for trainer questions
            elif tq.action == 'delete' and f'global_{tq.global_question_id}' in combined_questions:
                del combined_questions[f'global_{tq.global_question_id}']  # Remove the global question if trainer deleted it

        return jsonify(list(combined_questions.values())), 200

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



@app.route('/api/get_questions_by_template/<template>', methods=['GET'])
def get_questions_by_template(template):
    try:
        if 'trainer_id' not in session:
            return jsonify({"status": "error", "message": "Unauthorized"}), 401

        trainer_id = session['trainer_id']
        global_questions = GlobalFormQuestions.get_by_template(template)
        user_questions = TrainerIntakeQuestions.get_all_by_trainer(trainer_id)

        # Filter out global questions that are marked as deleted by the trainer
        user_deleted_question_ids = {uq.global_question_id for uq in user_questions if uq.action == 'delete'}
        global_questions = [q for q in global_questions if q.id not in user_deleted_question_ids]

        combined_questions = {}

        # Process global questions without worrying about uniqueId here
        for gq in global_questions:
            gq_data = gq.serialize()
            gq_data['question_source'] = 'global'
            combined_questions[f'global_{gq.id}'] = gq_data

        # Process trainer questions
        for tq in user_questions:
            tq_data = tq.serialize()
            tq_data['question_source'] = 'trainer'

            if tq.action == 'edit' and tq.global_question_id is not None:
                combined_questions[f'global_{tq.global_question_id}'] = tq_data  # Replace global question with trainer edit
            elif tq.action == 'add' and tq.templates == template:
                combined_questions[f'trainer_{tq.id}'] = tq_data
            elif tq.action == 'delete' and f'global_{tq.global_question_id}' in combined_questions:
                del combined_questions[f'global_{tq.global_question_id}']

        return jsonify(list(combined_questions.values())), 200
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


@app.route('/api/update_user_question/<int:question_id>', methods=['POST'])
def update_user_question(question_id):
    data = request.get_json()
    print(f"Received data for update: {data}")
    
    # Ensure that the 'question_type' is included and properly handled
    if 'question_type' not in data or not data['question_type']:
        return jsonify({'error': 'Question type is required'}), 400

    # Check if options are present for 'select' or 'checkbox' question types
    if data['question_type'] in ['select', 'checkbox'] and not data.get('options'):
        return jsonify({'error': 'Options are required for select and checkbox question types'}), 400
    
    if data['question_type'] == 'select':
        print(f"Received select question options: {data['options']}")

    # Check if it's a trainer or global question
    if data['question_source'] == 'trainer':
        # For trainer-specific questions, use the update_trainer_question method
        data['trainer_id'] = session.get('trainer_id')
        data['id'] = question_id
        
        try:
            # Call the trainer update method
            TrainerIntakeQuestions.update_trainer_question(data)
            return jsonify({'message': 'Trainer question updated successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

    else:
        # For global questions, ensure global_question_id is present
        data['global_question_id'] = question_id
        data['trainer_id'] = session.get('trainer_id')
        
        try:
            # Call the global question update or create method
            TrainerIntakeQuestions.update_or_create(data)
            return jsonify({'message': 'Global question updated successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500



@app.route('/api/delete_user_question/<int:question_id>', methods=['DELETE'])
def delete_user_question(question_id):
    data = request.get_json()
    question_source = data.get('question_source')

    if question_source == 'trainer':
        # Handle trainer-specific questions
        question = TrainerIntakeQuestions.get_by_id(question_id)
        if question and question.action == 'add':
            # Trainer added this question, so just delete it
            TrainerIntakeQuestions.delete(question_id)
            return jsonify({'message': 'Trainer question deleted successfully'}), 200
        elif question and question.global_question_id:
            # Edited global question, set action to 'delete'
            TrainerIntakeQuestions.mark_trainer_question_deleted({
                'id': question.id,
                'action': 'delete'
            })
            return jsonify({'message': 'Edited global question hidden'}), 200
        else:
            return jsonify({'error': 'Question not found or invalid action'}), 404

    elif question_source == 'global':
        # Handle global question
        global_question = GlobalFormQuestions.get_by_id(question_id)
        if global_question:
            # Add entry to trainer questions with all required fields
            TrainerIntakeQuestions.mark_global_question_deleted({
                'global_question_id': question_id,
                'trainer_id': session.get('trainer_id'),
                'question_text': global_question.question_text,  # Ensure question_text is passed
                'question_type': global_question.question_type,  # Ensure question_type is passed
                'options': global_question.options,              # Ensure options are passed
                'category': global_question.category,            # Ensure category is passed
                'action': 'delete'
            })
            return jsonify({'message': 'Global question hidden'}), 200
        else:
            return jsonify({'error': 'Global question not found'}), 404

    return jsonify({'error': 'Invalid question source'}), 400


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
                
                if answer['answer']:
                    # Determine the question_source based on the question_id and its presence in either table
                    if TrainerIntakeQuestions.get_by_id(answer['question_id']):
                        answer['question_source'] = 'trainer'
                    elif GlobalFormQuestions.get_by_id(answer['question_id']):
                        answer['question_source'] = 'global'
                    else:
                        return jsonify({'error': f'Invalid question_id: {answer["question_id"]}'}), 400

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
    # Check if the client_id is provided
    if not client_id:
        return jsonify({"error": "Client ID not found. Please log in again."}), 401

    # Retrieve data from the request
    data = request.get_json()
    form_id = data.get('form_id')
    summary_type = data.get('summary_type', 'Initial Consultation')  # Default to 'Initial Consultation'
    questions_answers = data.get('data')  # Assuming you get a list of question/answer pairs

    # Ensure questions and answers are provided
    if not questions_answers:
        return jsonify({'error': 'No data provided'}), 400
    # Retrieve client information to personalize the response
    client = Client.get_one(client_id)
    if not client:
        return jsonify({"success": False, "message": "Client not found."}), 404

    # Format additional instructions for AI
    additional_instructions = f"""
    Please generate a structured client summary in JSON format based on the following responses from {client.first_name} {client.last_name}. The JSON should contain the following fields:
    - "summary_text": A detailed summary formatted in bullet points, including:
        1. The client’s main fitness goals and any challenges or obstacles mentioned.
        2. Medical history or physical limitations that should be considered in their fitness journey.
        3. Exercise preferences and dislikes to guide the creation of a personalized workout plan.
        4. Any relevant lifestyle factors that may influence their fitness plan.
        5. The client's motivation for pursuing their fitness goals.
        6. The client's current exercise routine, if any.
        7. Any challenges the client faces in maintaining their fitness routine.
    - "summary_prompt": A concise and cohesive narrative summary that can be directly used to generate a personalized workout plan.
    - "goals": The client's specific goals and challenges.
    - "medical_history": Any medical history or physical limitations.
    - "physical_limitations": Specific physical limitations that might affect the workout plan.
    - "exercise_preferences": The client's preferences and dislikes regarding exercises.
    - "lifestyle_factors": Any lifestyle factors (like daily routines) that could affect the workout plan.
    - "motivation": What motivates the client to pursue their fitness goals.
    - "current_exercise_routine": The client's current exercise routine, if any.
    - "challenges": Any challenges the client is facing in maintaining their fitness routine.

    Ensure the JSON is properly formatted, and all fields are included. For example:
    {{
        "summary_text": "Detailed summary here...",
        "summary_prompt": "Concise prompt here...",
        "goals": "Client goals here...",
        "medical_history": "Client medical history here...",
        "physical_limitations": "Client physical limitations here...",
        "exercise_preferences": "Client exercise preferences here...",
        "lifestyle_factors": "Client lifestyle factors here...",
        "motivation": "Client motivation here...",
        "current_exercise_routine": "Client's current exercise routine here...",
        "challenges": "Client's challenges here..."
    }}
    """

    # Format the input for OpenAI
    formatted_data = "\n".join([f"Q: {qa['question']}\nA: {qa['answer']}" for qa in questions_answers])
    final_prompt = formatted_data + "\n\n" + additional_instructions

    try:
        # Making the request to OpenAI API
        client_ai = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        completion = client_ai.chat.completions.create(
            model="gpt-4o-mini-2024-07-18",
            messages=[{"role": "system", "content": "AI fitness assistant. Your task is to analyze client data."},
                      {"role": "user", "content": final_prompt}],
            max_tokens=3000,
            temperature=0.3
        )
        
        client_summary = completion.choices[0].message.content.strip()

        # Parsing the JSON response from AI
        if client_summary.startswith("```json"):
            client_summary = client_summary.replace("```json", "").replace("```", "").strip()

        summary_data = json.loads(client_summary)

        # Creating a new ClientSummaries instance with extracted data
        client_summary_instance = ClientSummaries(
            summary_text=summary_data.get('summary_text'),
            summary_prompt=summary_data.get('summary_prompt'),
            summary_type=summary_type,
            goals=summary_data.get('goals'),
            medical_history=summary_data.get('medical_history'),
            physical_limitations=summary_data.get('physical_limitations'),
            exercise_preferences=summary_data.get('exercise_preferences'),
            lifestyle_factors=summary_data.get('lifestyle_factors'),
            motivation=summary_data.get('motivation'),
            current_exercise_routine=summary_data.get('current_exercise_routine'),
            challenges=summary_data.get('challenges'),
            client_id=client_id,
            form_id=form_id
        )

        # Save the client summary to the database
        result = client_summary_instance.save()
        if result:
            return jsonify({"success": True, "message": "Client summary saved successfully.", "summary_id": result}), 201
        else:
            return jsonify({"error": "Failed to save client summary."}), 500

    except Exception as e:
        print(f"Error generating or saving client summary: {e}")
        return jsonify({"error": "An error occurred while generating or saving the client summary."}), 500


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
                'goals': serialized_summary.get('goals'),
                'medical_history': serialized_summary.get('medical_history'),
                'physical_limitations': serialized_summary.get('physical_limitations'),
                'exercise_preferences': serialized_summary.get('exercise_preferences'),
                'lifestyle_factors': serialized_summary.get('lifestyle_factors'),
                'motivation': serialized_summary.get('motivation'),
                'current_exercise_routine': serialized_summary.get('current_exercise_routine'),
                'challenges': serialized_summary.get('challenges'),
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



@app.route('/api/get_simple_client_data/<int:client_id>', methods=['GET'])
def get_simple_client_data(client_id):
    client_data = Client.get_one(client_id)
    if not client_data:
        return jsonify({"error": "No client data found for this client"}), 404
    
    return jsonify(client_data.serialize())

@app.route('/api/delete_intake_form/<int:form_id>', methods=['DELETE'])
def delete_intake_form(form_id):
    try:
        success = IntakeForms.delete(form_id)
        if success:
            print(f"Intake form with ID {form_id} deleted successfully.")
            return jsonify({"success": True, "message": "Intake form deleted successfully."}), 200
        else:
            print(f"No intake form found with ID {form_id}.")
            return jsonify({"success": False, "message": "Failed to delete intake form. No such form exists."}), 404
    except Exception as e:
        print(f"An error occurred while deleting intake plan with ID {form_id}: {str(e)}")
        return jsonify({"success": False, "message": f"An error occurred while deleting the intake form: {str(e)}"}), 500






