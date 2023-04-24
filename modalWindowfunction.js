const choseDoctor = document.querySelector('.choose-doctor')

function createVisitCard() {
  clearForm()
  if (choseDoctor.value === 'cardiologist') {
    document.querySelector('.cardiologist-option').classList.remove('d-none')
    activateCreateCardBtn()
  } else if (choseDoctor.value === 'dentist') {
    document.querySelector('.dentist-option').classList.remove('d-none')
    activateCreateCardBtn()
  } else if (choseDoctor.value === 'therapist') {
    document.querySelector('.therapist-option').classList.remove('d-none')
    activateCreateCardBtn()
  } else {
    clearForm()
  }
}

function createDefaultValue() {
  choseDoctor.value = 'choose-option'
  clearForm()
}

function clearForm() {
  document.querySelectorAll('.choose-specialist').forEach((specialist) => {
    specialist.classList.add('d-none')
  })
  document.querySelectorAll('.modal-form__data').forEach((data) => {
    data.value = ''
  })
  document.querySelectorAll('.choose-urgency').forEach((data) => {
    data.value = 'choose-urgency'
  })
  document.querySelector('.btn-create-visit__card').classList.add('d-none')
}

function activateCreateCardBtn() {
  const cardiologist = document.querySelector('.cardiologist-option')
  const dentist = document.querySelector('.dentist-option')
  const therapist = document.querySelector('.therapist-option')

  if (!cardiologist.classList.contains('d-none')) {
    const cardiologistInputs = document.querySelectorAll(
      '.cardiologist-option__value'
    )
    const cardiologistSelect = document.querySelector(
      '.cardiologist-option__select'
    )
    if (
      [...cardiologistInputs].every((input) => input.value !== '') &&
      cardiologistSelect.value !== ''
    ) {
      document
        .querySelector('.btn-create-visit__card')
        .classList.remove('d-none')
    } else {
      cardiologistInputs.forEach((e) => {
        e.addEventListener('keyup', activateCreateCardBtn)
      })
      cardiologistSelect.addEventListener('change', activateCreateCardBtn)
      document.querySelector('.btn-create-visit__card').classList.add('d-none')
    }
  }

  if (!dentist.classList.contains('d-none')) {
    const dentistInputs = document.querySelectorAll('.dentist-option__value')
    const dentistSelect = document.querySelector('.dentist-option__select')
    if (
      [...dentistInputs].every((input) => input.value !== '') &&
      dentistSelect.value !== ''
    ) {
      document
        .querySelector('.btn-create-visit__card')
        .classList.remove('d-none')
    } else {
      dentistInputs.forEach((e) => {
        e.addEventListener('keyup', activateCreateCardBtn)
      })
      dentistSelect.addEventListener('change', activateCreateCardBtn)
      document.querySelector('.btn-create-visit__card').classList.add('d-none')
    }
  }

  if (!therapist.classList.contains('d-none')) {
    const therapistInputs = document.querySelectorAll(
      '.therapist-option__value'
    )
    const therapistSelect = document.querySelector('.therapist-option__select')
    if (
      [...therapistInputs].every((input) => input.value !== '') &&
      therapistSelect.value !== ''
    ) {
      document
        .querySelector('.btn-create-visit__card')
        .classList.remove('d-none')
    } else {
      therapistInputs.forEach((e) => {
        e.addEventListener('keyup', activateCreateCardBtn)
      })
      therapistSelect.addEventListener('change', activateCreateCardBtn)
      document.querySelector('.btn-create-visit__card').classList.add('d-none')
    }
  }
}

export { createVisitCard, createDefaultValue }
