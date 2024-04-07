from flask import render_template, redirect, request, session, flash
from flask_app import app
from flask_app.models.history_model import History
from flask_app.models.client_model import Client


@app.route(f'/medical_history/<int:client_id>')
def medical_history(client_id):
    return render_template('intakepages/history.html', client_id=client_id, first_name=session.get('first_name'), last_name=session.get('last_name'))

@app.route('/save_medical_history', methods=['POST'])
def save_medical_history():
    client_id = request.form.get('client_id')
    if client_id is None:
        flash("Client ID not found. Unable to save fitness experience data.", 'error')
        return redirect(f'/medical_history/{client_id}')
    
    data = {
        "existing_conditions": request.form["existing_conditions"],
        "medications": request.form["medications"],
        "surgeries_or_injuries": request.form["surgeries_or_injuries"],
        "allergies": request.form["allergies"],
        "family_history": request.form["family_history"],
        "client_id": client_id,
        "client_first_name": session.get('first_name'),
        "client_last_name": session.get('last_name')
    }

    history_id = client_id
    History.save(data)

    return redirect(f'/flexibility_test/{client_id}')

