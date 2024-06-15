from flask_app.controllers import (exercise_library_controller, trainer_controller, client_controller, consultation_controller, 
                                   assessment_controller, history_controller, highlights_controller, 
                                   generate_plan_controller, workout_plans_controller, workout_rating_controller, 
                                   nutrition_profile_controller, dashboard_controller)
from flask_app import app

if __name__ == "__main__":
    app.run(debug=True)
