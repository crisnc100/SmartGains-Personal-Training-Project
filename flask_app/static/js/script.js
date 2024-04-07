function addExerciseInput() {
    const exercises = ['Bench', 'Squat', 'Deadlift', 'Overhead Press'];
    const exerciseInputs = document.getElementById('exerciseInputs');
    const addExerciseButton = document.getElementById('addExerciseButton');

    exercises.forEach(exercise => {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group mb-3';

        const inputLabel = document.createElement('label');
        inputLabel.className = 'input-group-text';
        inputLabel.textContent = exercise;

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.className = 'form-control';
        inputField.name = `strength_max_${exercise.toLowerCase().replace(' ', '_')}`;

        inputGroup.appendChild(inputLabel);
        inputGroup.appendChild(inputField);
        exerciseInputs.appendChild(inputGroup);
    });

    // Disable the button after it's clicked
    addExerciseButton.disabled = true;
}


function addBalanceInput() {
    const balances = ['Narrow Stance', 'Tandem Stance', 'Single-Leg'];
    const balanceInputs = document.getElementById('balanceInputs');
    const addBalanceButton = document.getElementById('addBalanceButton');

    balances.forEach(balance => {
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group mb-3';

        const inputLabel = document.createElement('label');
        inputLabel.className = 'input-group-text';
        inputLabel.textContent = balance;

        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.className = 'form-control';
        inputField.name = `balance_test_results_${balance.toLowerCase().replace(' ', '_')}`;

        inputGroup.appendChild(inputLabel);
        inputGroup.appendChild(inputField);
        balanceInputs.appendChild(inputGroup);
    });

    // Disable the button after it's clicked
    addBalanceButton.disabled = true;
}


function switchToEditMode() {
    console.log('Attempting to switch to edit mode...');
    $.get('/switch_to_edit_mode', function(response) {
        console.log('Response received:', response);
        if (response.success) {
            console.log('Switching to edit mode...');
            $('.editable').attr('contenteditable', 'true');
            // Show save and cancel buttons
            $('#saveChangesBtn').show();
            $('#cancelEditBtn').show();
            // Hide edit button
            $('button[onclick="switchToEditMode()"]').hide();
        } else {
            console.error('Failed to switch to edit mode');
            alert('Failed to switch to edit mode');
        }
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('AJAX call failed:', textStatus, errorThrown);
    });
}

function cancelEditMode() {
    // Hide save and cancel buttons
    $('#saveChangesBtn').hide();
    $('#cancelEditBtn').hide();
    // Show edit button
    $('button[onclick="switchToEditMode()"]').show();
    // Optionally, reload the page or reset editable fields
    $('.editable').attr('contenteditable', 'false');
}


function switchToUpdateMode() {
    var clientId = $('#client_id').val(); // Ensure there's an input field with id="client_id" in your HTML
    var updatedData = {
        client_data: {
            id: clientId,
            first_name: $('#first_name').text() || 'Default First',
            last_name: $('#last_name').text() || 'Default Last',
            email: $('#email').text() || 'Default Email',
            age: $('#age').text() ? parseInt($('#age').text(), 10) : null,
            gender: $('#gender').text() || 'Default Gender',
            occupation: $('#occupation').text() || 'Default Occupation',
            phone_number: $('#phone_number').text() || 'Default Phone',
            address: $('#address').text() || 'Default Address',
            location_gym: $('#location_gym').text() || 'Default Location'
            // Ensure these IDs match your HTML elements
        },
        consultation_data: {
            id: $('#consultation_id').val(),
            prior_exercise_programs: $('#prior_exercise_programs').text(),
            exercise_habits: $('#exercise_habits').text(),
            fitness_goals: $('#fitness_goals').text(),
            progress_measurement: $('#progress_measurement').text(),
            area_specifics: $('#area_specifics').text(),
            exercise_likes: $('#exercise_likes').text(),
            exercise_dislikes: $('#exercise_dislikes').text(),
            diet_description: $('#diet_description').text(),
            dietary_restrictions: $('#dietary_restrictions').text(),
            processed_food_consumption: $('#processed_food_consumption').text(),
            daily_water_intake: $('#daily_water_intake').text(),
            daily_routine: $('#daily_routine').text(),
            stress_level: $('#stress_level').text(),
            smoking_alcohol_habits: $('#smoking_alcohol_habits').text(),
            hobbies: $('#hobbies').text()
            // Add IDs in your HTML to match these
        },
        history_data: {
            id: $('#history_id').val(),
            existing_conditions: $('#existing_conditions').text(),
            medications: $('#medications').text(),
            surgeries_or_injuries: $('#surgeries_or_injuries').text(),
            allergies: $('#allergies').text(),
            family_history: $('#family_history').text()
        },
        flexibility_data: {
            id: $('#flexibility_assessment_id').val(),
            shoulder_flexibility: $('#shoulder_flexibility').text(),
            lower_body_flexibility: $('#lower_body_flexibility').text(),
            joint_mobility: $('#joint_mobility').text()
        }
    };
    updatedData.beginner_assessment_data = {
        client_id: clientId,
        basic_technique: $('#basic_technique').text(),
        chair_sit_to_stand: $('#chair_sit_to_stand').text(),
        arm_curl: $('#arm_curl').text(),
        balance_test_results: $('#balance_test_results').text(),
        cardio_test: $('#cardio_test').text()
    };

    // Always include advanced assessment data if the fields exist on the page
    updatedData.advanced_assessment_data = {
        client_id: clientId,
        advanced_technique: $('#advanced_technique').text(),
        strength_max: $('#strength_max').text(),
        strength_endurance: $('#strength_endurance').text(),
        circuit: $('#circuit').text(),
        moderate_cardio: $('#moderate_cardio').text()
    };

    // Send POST request to update data
    $.ajax({
        url: '/switch_to_update_mode',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(updatedData),
        success: function(response) {
            if (response.success) {
                console.log('Data updated successfully.');

                // Exit edit mode
                $('.editable').attr('contenteditable', 'false'); // Make elements non-editable
                $('#saveChangesBtn').hide(); // Hide save button
                $('#cancelEditBtn').hide(); // Hide cancel button
                $('button[onclick="switchToEditMode()"]').show(); // Show edit button

                // Optionally, you can refresh the page to show updated data or update the UI elements as necessary
            } else {
                console.error('Failed to update data:', response.message);
            }
        },
        error: function(xhr, status, error) {
            console.error('Error updating data:', status, error);
        }
    });
}

function viewWorkoutDetails(workoutId) {
    // Assuming you have workout details stored or need to fetch from the server
    var demoPlanContent = "Details of workout ID " + workoutId; // Replace this with actual fetching logic
    $('#demoPlanContent').text(demoPlanContent);
    $('#demoPlanModal').modal('show');
}
