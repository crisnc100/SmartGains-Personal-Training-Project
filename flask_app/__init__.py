from flask import Flask
from flask_cors import CORS  
from flask_mail import Mail
import os
#from flask_wtf import CSRFProtect

# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])  # Updated origins as per my setup with react

app.secret_key = os.getenv('SECRET_KEY')


app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Correct SMTP server for Gmail
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'cortegafit@gmail.com'  # My Gmail address
app.config['MAIL_PASSWORD'] = 'rwmv hzrb wdqz aaif'  # My app-specific password
app.config['MAIL_DEFAULT_SENDER'] = 'cortegafit@gmail.com'  # My Gmail address

# Initialize Flask-Mail with the app configuration
mail = Mail(app)
#csrf = CSRFProtect(app)
