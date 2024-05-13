from flask import Flask
from flask_cors import CORS  
from flask_mail import Mail
import os


# Initialize Flask app
app = Flask(__name__)
CORS(app, supports_credentials=True, origins=["http://localhost:5173"])  #

app.secret_key = os.getenv('SECRET_KEY')


app.config['MAIL_SERVER'] = 'smtp.gmail.com'  
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'cortegafit@gmail.com'  # My Gmail address
app.config['MAIL_PASSWORD'] = 'rwmv hzrb wdqz aaif'  # app-specific password
app.config['MAIL_DEFAULT_SENDER'] = 'cortegafit@gmail.com'  


mail = Mail(app)

