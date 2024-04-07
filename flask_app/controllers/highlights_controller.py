from flask import render_template, redirect, request, session, flash
from flask_app import app
from flask_app.models.consultation_model import Consultation
from flask_app.models.client_model import Client
from flask_app.models.history_model import History
from flask_app.models.assessment_model import FlexibilityAssessment, BeginnerAssessment, AdvancedAssessment




@app.route("/view_highlights/<int:client_id>", methods=['GET', 'POST'])
def view_highlights(client_id):
    print("View Highlights route triggered.")

    # Check if the client_id is passed in the URL
    if client_id is None:
        flash("Client ID not found in the URL.", 'error')
        return redirect('/')
    
    # Store the client_id in the session
    session['client_id'] = client_id

    # Retrieve data from models based on the client_idW
    client_data = Client.get_one(client_id)
    consultation_data = Consultation.get_by_client_id(client_id)
    Flexibilityassessment_data = FlexibilityAssessment.get_by_client_id(client_id)
    Advancedassessment_data = AdvancedAssessment.get_by_client_id(client_id)
    Beginnerassessment_data = BeginnerAssessment.get_by_client_id(client_id)
    history_data = History.get_by_client_id(client_id)
    
    # Render the template with all assessment data
    return render_template('intakepages/initial_highlights.html',
                           client_data=client_data, 
                           consultation_data=consultation_data,
                           Beginnerassessment_data=Beginnerassessment_data,
                           Advancedassessment_data=Advancedassessment_data,
                           Flexibilityassessment_data=Flexibilityassessment_data,
                           history_data=history_data
                          )

