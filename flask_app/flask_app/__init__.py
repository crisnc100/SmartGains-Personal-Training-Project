from flask import Flask
from flask_cors import CORS  # Import CORS
from flask_mail import Mail
import os
#from flask_wtf import CSRFProtect

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])  # Update origins as per your setup

app.secret_key = os.getenv('SECRET_KEY')

# Configure Flask-Mail to use Gmail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')  # Use environment variables for credentials
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')  # Use environment variables for credentials
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

# Initialize Flask-Mail with the app configuration
mail = Mail(app)
#csrf = CSRFProtect(app)
