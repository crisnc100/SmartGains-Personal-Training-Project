from flask import request, session, url_for
from flask_app import app
from flask_bcrypt import Bcrypt
from flask import current_app
from flask_app.models.trainer_model import Trainer
from flask_app.models.client_model import Client
from flask_app.models.trainer_profile_model import TrainerProfile
from werkzeug.utils import secure_filename
from flask import send_from_directory
from flask import jsonify
from datetime import datetime
from werkzeug.exceptions import BadRequest
import logging
import re
import os
#from flask_wtf.csrf import generate_csrf
#from flask_wtf.csrf import validate_csrf
bcrypt = Bcrypt(app)
import os
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), '..', '..', 'client', 'public', 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+$')

"""@app.route('/api/csrf_token', methods=['GET'])
def csrf_token():
    token = generate_csrf()
    session['csrf_token'] = token
    logging.info(f"CSRF Token generated and stored in session: {token}")
    return jsonify({'csrf_token': token})"""


@app.route('/api/register_trainer', methods=['POST'])
def register_trainer():
    data = request.get_json()

    required_fields = ['first_name', 'last_name', 'email', 'password']
    if not all(field in data for field in required_fields):
        missing = ', '.join([field for field in required_fields if field not in data])
        return jsonify({'error': f'Missing data for required field(s): {missing}'}), 400

    # Password hashing
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')

    # Creating trainer data dictionary
    trainer_data = {
        'first_name': data['first_name'],
        'last_name': data['last_name'],
        'email': data['email'],
        'password_hash': hashed_password,
        'created_at': None,  
        'updated_at': None
    }

    try:
       
        trainer_id = Trainer.save(trainer_data)  
        print("Generated trainer_id:", trainer_id)  # Debugging print
        if trainer_id:
            session['trainer_id'] = trainer_id
            print("Session after setting trainer_id:", session)
            session['first_name'] = data['first_name']
            session['last_name'] = data['last_name']
            
            return jsonify({'message': 'New trainer registered successfully', 'trainer_id': trainer_id}), 200
        else:
            return jsonify({'error': 'Failed to register new trainer'}), 500
    except Exception as e:
        app.logger.error(f"Error registering trainer: {e}")
        return jsonify({'error': str(e)}), 500




@app.route('/api/check_trainer', methods=['POST'])
def check_trainer():
    data = request.get_json()
    email = data.get('email', '').strip()
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()

    try:
        email_exists = Trainer.email_exists(email) if email else False
        name_exists = Trainer.trainer_name_exists(first_name, last_name) if first_name and last_name else False
        return jsonify({
            'email_exists': email_exists,
            'name_exists': name_exists
        }), 200
    except Exception as e:
        
        return jsonify({'error': 'Internal server error', 'message': str(e)}), 500


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/create_trainer_profile', methods=['POST'])
def create_trainer_profile():
 
    trainer_id = request.form.get('trainer_id')
    if trainer_id is None:
        return jsonify({'error': 'Trainer ID not found'}), 400

    # Accessing the uploaded file
    if 'photo1' not in request.files:
        return jsonify({'error': 'Profile picture is required'}), 400

    file1 = request.files['photo1']
    if file1.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file1 and allowed_file(file1.filename):
        filename1 = secure_filename(file1.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename1)
        file1.save(file_path)

        quote1 = request.form.get('quote1', '').strip()
        quote2 = request.form.get('quote2', '').strip()

        # Saves the data
        data = {
            'photo1': filename1,
            'quote1': quote1,
            'quote2': quote2,
            'trainer_id': trainer_id
        }
        try:
            TrainerProfile.save(data)
            return jsonify({'message': 'Trainer profile saved successfully'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Invalid file format'}), 400

    


@app.route('/api/login_trainer', methods=['POST'])
def login_trainer():
    try:
        email = request.json.get('email')
        password = request.json.get('password')
        trainer = Trainer.get_by_email(email)
        logging.info(f"Login attempt with email: {email}")
        
        if not trainer:
            return jsonify({'success': False, 'error_message': 'Email is incorrect.'}), 401
        
        if not bcrypt.check_password_hash(trainer.password_hash, password):
            return jsonify({'success': False, 'error_message': 'Password is incorrect.'}), 401

        # If both checks pass
        session['trainer_id'] = trainer.id
        session['first_name'] = trainer.first_name
        session['last_name'] = trainer.last_name
        
        return jsonify({'success': True, 'redirect_url': '/check_login'})
    
    except BadRequest:
        logging.error("Bad Request: CSRF token is missing or invalid.")
        return jsonify({'success': False, 'error_message': 'CSRF token is missing or invalid.'}), 400



@app.route('/api/check_login')
def check_login():
    trainer_id = session.get('trainer_id')
    if trainer_id:
        return jsonify({'success': True}), 200
    else:
        return jsonify({'error': 'Unauthorized'}), 401

    
@app.route('/api/get_trainer_id')
def get_trainer_id():
    trainer_id = trainer_id = session.get('trainer_id')
    if not trainer_id:
        return jsonify({'error': 'Unauthorized'}), 401
    trainer = Trainer.get_by_id(trainer_id)

    if trainer:
        return jsonify({
            'trainer': trainer.serialize()
        })
    else:
        return jsonify({'error': 'Data not found'}), 404

@app.route('/api/trainer_data')
def trainer_data():
    trainer_id = session.get('trainer_id')
    if not trainer_id:
        return jsonify({'error': 'Unauthorized'}), 401

    trainer = Trainer.get_by_id(trainer_id)
    trainer_profile = TrainerProfile.get_by_trainer_id(trainer_id)

    if trainer and trainer_profile:
        trainer_clients = Client.get_all_by_trainer(trainer_id)
        if trainer_clients:
            clients_data = [client.serialize() for client in trainer_clients if isinstance(client, Client)]
        else:
            clients_data = []
        
        return jsonify({
            'trainer': trainer.serialize(),  
            'profile': trainer_profile.serialize(),
            'clients': clients_data
        })
    else:
        return jsonify({'error': 'Data not found'}), 404
    


@app.route('/api/get_trainer_profile')
def get_trainer_profile():
    trainer_id = session.get('trainer_id')
    if not trainer_id:
        return jsonify({'error': 'Unauthorized'}), 401

    trainer_profile = TrainerProfile.get_by_trainer_id(trainer_id)

    if trainer_profile:
        profile_data = trainer_profile.serialize()
        if trainer_profile.photo1:
            profile_data['photo1'] = url_for('uploaded_file', filename=trainer_profile.photo1, _external=True)

        return jsonify({'profile': profile_data})
    else:
        return jsonify({'error': 'Data not found'}), 404






@app.route('/api/update_profile', methods=['POST'])
def update_profile():
    trainer_id = session.get('trainer_id')
    if not trainer_id:
        return jsonify({'error': 'Trainer ID not found. Please log in again.'}), 401

    photo1 = request.files.get('photo1')
    quote1 = request.form.get('quote1', '')
    quote2 = request.form.get('quote2', '')

    data = {'trainer_id': trainer_id, 'quote1': quote1, 'quote2': quote2}

    if photo1 and allowed_file(photo1.filename):
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')  # Unique timestamp
        filename1 = secure_filename(f"{timestamp}_{photo1.filename}")
        photo1_path = os.path.join(app.config['UPLOAD_FOLDER'], filename1)
        photo1.save(photo1_path)
        data['photo1'] = filename1

    try:
        updated_profile = TrainerProfile.update(data)  
        return jsonify({'success': 'Trainer profile updated successfully', 'profile': updated_profile}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred while updating profile: {str(e)}"}), 500





@app.route('/api/update_trainer', methods=['POST'])
def update_trainer():
    trainer_id = session.get('trainer_id')
    if trainer_id is None:
        return jsonify({'error': 'Trainer ID not found. Please log in again.'}), 401

    data = request.get_json()
    email = data.get('email')
    if email and not EMAIL_REGEX.match(email):
        return jsonify({'error': 'Email format is incorrect'}), 400

    updated_data = {
        'id': trainer_id,  
        'first_name': data.get('first_name'),
        'last_name': data.get('last_name'),
        'email': email
    }

    try:
        Trainer.update(updated_data)
        return jsonify({'success': 'Trainer data updated successfully'}), 200
    except Exception as e:
        return jsonify({"success": False, "message": f"An error occurred while updating trainer: {str(e)}"}), 500


@app.route('/api/update_password', methods=['POST'])
def update_password():
    trainer_id = session.get('trainer_id')
    if not trainer_id:
        return jsonify({'error': 'Trainer ID not found. Please log in again.'}), 401 

    data = request.get_json()
    current_password = data.get('current')
    new_password = data.get('new')
    confirm_password = data.get('confirm')
    
    if new_password != confirm_password:
        return jsonify({'error': 'Passwords do not match!'}), 400

    trainer = Trainer.get_by_id(trainer_id)
    if not trainer:
        return jsonify({'error': 'Trainer not found'}), 404

    if not bcrypt.check_password_hash(trainer.password_hash, current_password):
        return jsonify({'error': 'Current password is incorrect'}), 400

    hashed_password = bcrypt.generate_password_hash(new_password)
    Trainer.update_password_hash(trainer_id, hashed_password)
    return jsonify({'success': 'Trainer password updated successfully'}), 200





@app.route('/api/logout_trainer', methods=['POST'])
def logout_trainer():
  
    session.pop('trainer_id', None)
    session.pop('first_name', None)
    session.pop('last_name', None)
    session.pop('client_id', None)
    session.pop('client_first_name', None)
    session.pop('client_last_name', None)

    
    return jsonify({'message': 'Successfully logged out'}), 200



@app.route('/api/delete_trainer/<int:trainer_id>', methods=['DELETE'])
def delete_trainer(trainer_id):
    print(f"Received DELETE request for trainer ID {trainer_id}")
    try:
        success = Trainer.delete(trainer_id)
        if success:
            print(f"Successfully deleted trainer {trainer_id}")
            return jsonify({"success": True}), 200
        else:
            print(f"No trainer found with ID {trainer_id}")
            return jsonify({"success": False, "message": "Trainer not found"}), 400
    except Exception as e:
        print(f"Exception during delete: {str(e)}")
        return jsonify({"success": False, "error": str(e)}), 500





