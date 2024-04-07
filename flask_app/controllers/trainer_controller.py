from flask import render_template, redirect, request, session, flash, url_for
from flask_app import app
from flask_bcrypt import Bcrypt
from flask_app.models.trainer_model import Trainer
from flask_app.models.client_model import Client
from flask_app.models.trainer_profile_model import TrainerProfile
from werkzeug.utils import secure_filename
from flask import send_from_directory
import os
bcrypt = Bcrypt(app)
app.config['UPLOAD_FOLDER'] = os.path.join(app.root_path, 'uploads')

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}


@app.route('/')
def home():
    return render_template('trainerpages/home.html')

@app.route('/new_trainer')
def new_trainer():
    return render_template('trainerpages/new_trainer.html')


@app.route('/register_trainer', methods=['POST'])
def register_trainer():
    validation_errors = []

    if len(request.form['first_name']) < 2:
        validation_errors.append("First name must be at least 2 characters.")
    if len(request.form['last_name']) < 2:
        validation_errors.append("Last name must be at least 2 characters.")
    if len(request.form['password_hash']) < 8:
        validation_errors.append("Password must be at least 8 characters.")
    if request.form['password_hash'] != request.form['password_confirm']:
        validation_errors.append("Passwords do not match.")

    if validation_errors:
        for error in validation_errors:
            flash(error, 'register_error')
        return redirect('/new_trainer')

    pw_hash = bcrypt.generate_password_hash(request.form['password_hash'])

    data = {
        "first_name": request.form['first_name'],
        "last_name": request.form["last_name"],
        "email": request.form["email"],
        "password_hash": pw_hash
    }

    trainer_id = Trainer.save(data)

    if trainer_id:
        session['trainer_id'] = trainer_id
        session['first_name'] = request.form['first_name']
        session['last_name'] = request.form['last_name']
        return redirect('/create_profile')
    else:
        flash("Failed to register trainer. Please try again.", 'register_error')
        return redirect('/')
    
@app.route('/login_page')
def login_page():
    return render_template('trainerpages/login_page.html')

@app.route('/login_trainer', methods=['POST'])
def login_trainer():
    trainer = Trainer.get_by_email(request.form['email'])
    if trainer and bcrypt.check_password_hash(trainer.password_hash, request.form['password_hash']):
        session['trainer_id'] = trainer.id
        session['first_name'] = trainer.first_name
        session['last_name'] = trainer.last_name  
        return redirect('/success')
    else:
        flash("Invalid email or password.", 'login_error')
        return redirect('/login_page')

@app.route('/create_profile')
def create_profile():
    return render_template('/trainerpages/create_profile.html')

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

    # Check if the file has an allowed extension for photo1
    if file1 and allowed_file(file1.filename):
        # Secure the filename to prevent any malicious filenames
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

        # Assuming you have a TrainerProfile model with a save method
        # Create a new TrainerProfile object and save it to the database
        TrainerProfile.save(data)

        flash("Trainer profile saved successfully.", 'success')
        return redirect('/success')
    else:
        flash('Invalid file format', 'error')
        return redirect(request.url)



@app.route('/success')
def success():
    trainer_id = session.get('trainer_id')
    if trainer_id:
        trainer = Trainer.get_by_id(trainer_id)
        if trainer:
            trainer_profile = TrainerProfile.get_by_trainer_id(trainer_id)  # Fetch trainer profile data
            # Fetch only clients related to the logged-in trainer
            trainer_clients = Client.get_all_by_trainer(trainer_id)
            return render_template('trainerpages/trainer_dashboard.html', trainer=trainer, trainer_profile=trainer_profile, clients=trainer_clients)

    return redirect('/')



@app.route('/back_to_dashboard', methods=['POST'])
def back_to_dashboard():
    session.pop('client_id', None)  
    session.pop('client_first_name', None)
    session.pop('client_last_name', None)  
    return redirect('/success')

@app.route('/logout_trainer',methods=['POST'])
def logout_trainer():
    session.pop('trainer_id', None)
    session.pop('first_name', None)
    session.pop('last_name', None)
    return redirect('/')

@app.route('/skip_profile')
def skip_profile():
    if 'trainer_id' not in session:
        flash("Please log in first.", 'error')
        return redirect(url_for('login_page'))

    trainer_id = session['trainer_id']

    # Check if the profile picture file exists for the trainer
    photo1_path = os.path.join(app.config['UPLOAD_FOLDER'], f"photo1_{trainer_id}.jpg")
    if os.path.exists(photo1_path):
        flash("You already have a profile picture.", 'info')
        return redirect(url_for('success'))

    # If the profile picture file does not exist, show an error message
    flash('Please upload a profile picture!', 'error')
    return redirect(url_for('create_profile'))

@app.route('/edit_profile', methods=['GET', 'POST'])
def edit_profile():
    if 'trainer_id' not in session:
        flash("Please log in first.", 'error')
        return redirect('/login_page')
    
    trainer_id = session['trainer_id']
    
    current_trainer = Trainer.get_by_id(trainer_id)  # Retrieve trainer data from the Trainer model
    
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
        data['photo1'] = filename1  # Update photo1 in data only if a new file is uploaded

    try:
        TrainerProfile.update(data)  # Now passing a single dictionary
        flash("Profile updated successfully.", 'success')
        return redirect('/success')
    except Exception as e:
        flash(f"Error updating profile: {e}", 'error')
        return redirect('/edit_profile')






