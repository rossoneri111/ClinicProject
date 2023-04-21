const choseDoctor = document.querySelector('.choose-doctor');

function createVisitCard() {
    clearForm()
    if (choseDoctor.value === 'cardiologist') {
        document.querySelector('.cardiologist-option').classList.remove('d-none')
    } else if (choseDoctor.value === 'dentist') {
        document.querySelector('.dentist-option').classList.remove('d-none')
    } else if (choseDoctor.value === 'therapist') {
        document.querySelector('.therapist-option').classList.remove('d-none')
    } else {
        clearForm()
    }
}

function createDefaultValue() {
    choseDoctor.value = 'choose-option';
    clearForm()
}

function clearForm() {
    document.querySelectorAll('.choose-specialist').forEach(specialist => {
        specialist.classList.add('d-none')
    })
    document.querySelectorAll('.modal-form__data').forEach(data => {
        data.value = '';
    })
    document.querySelectorAll('.choose-urgency').forEach(data => {
        data.value = 'choose-urgency';
    })
}


export {createVisitCard, createDefaultValue};
