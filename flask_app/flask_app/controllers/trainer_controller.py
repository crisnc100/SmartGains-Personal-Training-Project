from flask import render_template, redirect, request, session, flash, url_for
from flask_app import app
from flask_bcrypt import Bcrypt
from flask_app.models.trainer_model import Trainer
from flask_app.models.client_model import Client
from flask_app.models.trainer_profile_model import TrainerProfile
from werkzeug.utils import secure_filename
from flask import send_from_directory
from flask import jsonify
from werkzeug.exceptions import BadRequest
import logging
import re
import os
#from flask_wtf.csrf import generate_csrf
#from flask_wtf.csrf import validate_csrf
bcrypt = Bcrypt(app)
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')

UPLOAD_FOLDER = 'uploads'
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
    pass



@app.route('/api/login_trainer', methods=['POST'])
def login_trainer():
    try:
        # Validate CSRF token
        #received_token = request.cookies.get('csrf_token')
        #logging.info(f"CSRF Token received from cookies: {received_token}")
        #validate_csrf(received_token)
        
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



def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/uploads/<path:filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/save_trainer_profile', methods=['POST'])
def save_trainer_profile():
    if 'trainer_id' not in session:
        flash("Please log in first.", 'error')
        return redirect('/login_page')

    trainer_id = session['trainer_id']

    # Check if the POST request has the file part for photo1
    if 'photo1' not in request.files:
        flash('Please upload a profile picture!', 'error')
        return redirect(request.url)

    # Get the file for photo1 from the POST request
    file1 = request.files['photo1']

    # Check if the user does not select a file for photo1
    if file1.filename == '':
        flash('No selected file', 'error')
        return redirect(request.url)

  
    if file1 and allowed_file(file1.filename):
  
        filename1 = secure_filename(file1.filename)
        # Save the file to the uploads folder for photo1
        file1.save(os.path.join(app.config['UPLOAD_FOLDER'], filename1))

        # Extract other form data
        data = {'photo1': filename1}

        data.update({
            'quote1': request.form.get('quote1'),
            'quote2': request.form.get('quote2'),
            'trainer_id': trainer_id
        })

        
        TrainerProfile.save(data)

        flash("Trainer profile saved successfully.", 'success')
        return redirect('/success')
    else:
        flash('Invalid file format', 'error')
        return redirect(request.url)


@app.route('/api/check_login')
def check_login():
    trainer_id = session.get('trainer_id')
    if trainer_id:
        return jsonify({'success': True}), 200
    else:
        return jsonify({'error': 'Unauthorized'}), 401

    

@app.route('/api/trainer_data')
def trainer_data():
    trainer_id = session.get('trainer_id')
    if not trainer_id:
        return jsonify({'error': 'Unauthorized'}), 401

    trainer = Trainer.get_by_id(trainer_id)
    trainer_profile = TrainerProfile.get_by_trainer_id(trainer_id)
    trainer_clients = Client.get_all_by_trainer(trainer_id)

    if trainer and trainer_profile and trainer_clients:
        return jsonify({
            'trainer': trainer.serialize(),  
            'profile': trainer_profile.serialize(),  
            'clients': [client.serialize() for client in trainer_clients if isinstance(client, Client)]

        })
    else:
        return jsonify({'error': 'Data not found'}), 404


@app.route('/api/logout_trainer', methods=['POST'])
def logout_trainer():
  
    session.pop('trainer_id', None)
    session.pop('first_name', None)
    session.pop('last_name', None)
    session.pop('client_id', None)
    session.pop('client_first_name', None)
    session.pop('client_last_name', None)

    
    return jsonify({'message': 'Successfully logged out'}), 200

@app.route('/skip_profile')
def skip_profile():
    if 'trainer_id' not in session:
        flash("Please log in first.", 'error')
        return redirect(url_for('login_page'))

    trainer_id = session['trainer_id']

  
    photo1_path = os.path.join(app.config['UPLOAD_FOLDER'], f"photo1_{trainer_id}.jpg")
    if os.path.exists(photo1_path):
        flash("You already have a profile picture.", 'info')
        return redirect(url_for('success'))

    
    flash('Please upload a profile picture!', 'error')
    return redirect(url_for('create_profile'))

@app.route('/edit_profile', methods=['GET', 'POST'])
def edit_profile():
    if 'trainer_id' not in session:
        flash("Please log in first.", 'error')
        return redirect('/login_page')
    
    trainer_id = session['trainer_id']
    
    current_trainer = Trainer.get_by_id(trainer_id)  
    
    if request.method == 'GET':
        existing_profile = TrainerProfile.get_by_trainer_id(trainer_id)
        return render_template('trainerpages/edit_profile.html', current_trainer=current_trainer, existing_profile=existing_profile)




@app.route('/update_profile', methods=['POST'])
def update_profile():
    if 'trainer_id' not in session:
        flash("Please log in first.", 'error')
        return redirect('/login_page')

    trainer_id = session['trainer_id']
    photo1 = request.files.get('photo1')
    quote1 = request.form.get('quote1', '')  # Default to empty if not provided
    quote2 = request.form.get('quote2', '')  # Default to empty if not provided

    data = {'trainer_id': trainer_id, 'quote1': quote1, 'quote2': quote2}

    if photo1 and allowed_file(photo1.filename):
        filename1 = secure_filename(photo1.filename)
        photo1_path = os.path.join(app.config['UPLOAD_FOLDER'], filename1)
        photo1.save(photo1_path)
        data['photo1'] = filename1  

    try:
        TrainerProfile.update(data)  
        flash("Profile updated successfully.", 'success')
        return redirect('/success')
    except Exception as e:
        flash(f"Error updating profile: {e}", 'error')
        return redirect('/edit_profile')


@app.route('/trainer_settings')
def trainer_settings():
    if 'trainer_id' not in session:
        flash("Please log in first.", 'error')
        return redirect('/login_page')
    trainer_id = session['trainer_id']

    trainer = Trainer.get_by_id(trainer_id)

    return render_template('trainerpages/trainer_settings.html', trainer=trainer, trainer_id=trainer_id)


@app.route('/update_trainer', methods=['POST'])
def update_trainer():
    trainer_id = session['trainer_id']
    email = request.form['email']

    # Validate the email format
    if not EMAIL_REGEX.match(email):
        flash('Invalid email format', 'error')  
        return redirect('/trainer_settings')  

    data = {
        'id': trainer_id,
        'first_name': request.form['first_name'],
        'last_name': request.form['last_name'],
        'email': email
    }

  
    Trainer.update(data)
    flash('Trainer updated successfully!', 'success')
    return redirect('/success')


@app.route('/update_password/<int:trainer_id>', methods=['POST'])
def update_password(trainer_id):
    print(f"Route triggered with trainer_id: {trainer_id}")  

    current_password = request.form['current_password']
    new_password = request.form['new_password']
    confirm_password = request.form['confirm_password']

    
    trainer = Trainer.get_by_id(trainer_id)
    if not trainer:
        print("No trainer found with the given ID")  
        flash('Trainer not found.', 'error')
        return redirect('/trainer_settings')  
    
    print(f"Trainer found: {trainer.id}")  


   
    print("Trainer password hash:", trainer.password_hash)
    if not bcrypt.check_password_hash(trainer.password_hash, current_password):
        flash('Current password is incorrect.', 'error')
        return redirect('/trainer_settings')  

   
    if new_password != confirm_password:
        flash('New passwords do not match.', 'error')
        return redirect('/trainer_settings')

    hashed_password = bcrypt.generate_password_hash(new_password)
    print("Generated hashed password:", hashed_password)  
    Trainer.update_password_hash(trainer_id, hashed_password)



    flash('Password successfully updated.', 'success')
    return redirect('/success')



@app.route('/delete_trainer/<int:trainer_id>')
def delete_trainer(trainer_id):
    Trainer.delete(trainer_id)

    return redirect('/')





