import { createVisitCard, createDefaultValue } from './modalWindowfunction.js'

class HttpService {
    constructor() {
        this.URL = 'https://ajax.test-danit.com/api/v2/cards'
    }

    async signIn(signInData) {
        return await fetch(`${this.URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: signInData.get('email'),
                password: signInData.get('password'),
            }),
        })
    }

    async getAllCards(token) {
        return await (
            await fetch(this.URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })
        ).json()
    }

    async getCard(token, id) {
        return await (
            await fetch(`${this.URL}/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            })
        ).json()
    }
    async postCard(token, cardData) {
        return await (
            await fetch(this.URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ cardData }),
            })
        ).json()
    }

    async updateCard(token, id, cardData) {
        return await (
            await fetch(`${this.URL}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ cardData }),
            })
        ).json()
    }

    async deleteCard(token, id) {
        return await fetch(`${this.URL}/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
    }
}

class ClinicApp {
    constructor() {
        this.handlers = new Handlers()
        this.token = this.getToken()
        this.render()
    }

    addListeners() {
        const signInForm = document.querySelector('#signInForm')
        if (signInForm)
            signInForm.addEventListener('submit', this.handlers.signInHandler)

        const createVisitBtn = document.querySelector('[name="createVisitBtn"]')
        if (createVisitBtn)
            createVisitBtn.addEventListener(
                'click',
                this.handlers.createVisitHandler
            )
    }

    getToken() {
        return sessionStorage.getItem('token')
    }

    setToken(token) {
        this.token = token
        sessionStorage.setItem('token', token)
    }

    render() {
        const navbar = document.querySelector('.navbar-nav')
        navbar.innerHTML = ''
        this.token
            ? this.renderSignedIn(navbar)
            : this.renderNotSignedIn(navbar)

        this.addListeners()
    }

    renderSignedIn(navbar) {
        const createVisitBtn = new Button(
            'createVisitBtn',
            'Create Visit Class',
            'modal',
            '#createVisitModal'
        )
        navbar.append(createVisitBtn.render())
    }

    renderNotSignedIn(navbar) {
        const signInBtn = new Button(
            'signInBtn',
            'Sign In Class',
            'modal',
            '#signInModal'
        )
        navbar.append(signInBtn.render())
    }
}

class Button {
    constructor(name, innerText, bsToggle, bsTarget) {
        this.name = name
        this.innerText = innerText
        this.bsToggle = bsToggle
        this.bsTarget = bsTarget
    }

    render() {
        const btn = document.createElement('button')

        btn.name = this.name
        btn.innerText = this.innerText
        btn.type = 'button'
        btn.classList.add('btn', 'btn-primary')
        btn.dataset.bsToggle = this.bsToggle
        btn.dataset.bsTarget = this.bsTarget

        return btn
    }
}

class Handlers {
    constructor() {}

    async signInHandler(event) {
        event.preventDefault()

        const formData = new FormData(this)

        try {
            const response = await httpService.signIn(formData)

            if (response.ok) {
                const token = await response.text()
                clinicApp.setToken(token)
                clinicApp.render()
            } else {
                throw new Error('Incorrect password!')
            }
        } catch (e) {
            Handlers.errorHandler(e)
        }
    }

    createVisitHandler(event) {
        const createVisit = new CreateVisitModal()
    }

    static errorHandler(error) {
        const errorAlert = document.body.appendChild(
            Handlers.showAlert(error.message)
        )
        setTimeout(() => {
            errorAlert.remove()
        }, 5000)
    }

    static showAlert(message) {
        const alertContainer = document.createElement('div')
        alertContainer.classList.add(
            'alert',
            'alert-danger',
            'alert-dismissible',
            'w-50',
            'mx-auto',
            'fade',
            'show'
        )
        alertContainer.role = 'alert'
        alertContainer.innerText = message

        const closeBtn = document.createElement('button')
        closeBtn.type = 'button'
        closeBtn.classList.add('btn-close')
        closeBtn.dataset.bsDismiss = 'alert'
        closeBtn.ariaLabel = 'Close'

        alertContainer.append(closeBtn)

        return alertContainer
    }
}

// Not used
class Modal {
    constructor() {}

    // render() {
    //   const modal = document.createElement("div");
    //   modal.classList.add("modal", "fade");
    //   modal.tabIndex = -1;
    //   modal.role = "dialog";
    //   modal.ariaHidden = "true";
    //
    //   const modalDialog = document.createElement("div");
    //   modalDialog.classList.add("modal-dialog", "modal-dialog-centered");
    //
    //   const modalContent = document.createElement("div");
    //   modalContent.classList.add("modal-content");
    //
    //   modalDialog.append(modalContent);
    //   modal.append(modalDialog);
    //
    //   return modal;
    // }
}

// Not used
class SignInModal extends Modal {
    constructor() {
        super()
    }

    // render() {
    //   const modal = super.render();
    //   modal.id = "signInModal";
    //
    //   const modalContent = modal.querySelector(".modal-content");
    //   const form = document.createElement("form");
    //
    //   const emailContainer = document.createElement("div");
    //   emailContainer.classList.add("form-floating");
    //   const emailLabel = document.createElement("label");
    //   emailLabel.htmlFor = "email";
    //   emailLabel.innerText = "Enter Email";
    //   const emailInput = document.createElement("input");
    //   emailInput.type = "email";
    //   emailInput.classList.add("form-control");
    //   emailInput.id = "email";
    //   emailInput.placeholder = "name@example.com";
    //   emailContainer.append(emailInput, emailLabel);
    //
    //   const passwordContainer = document.createElement("div");
    //   passwordContainer.classList.add("form-floating");
    //   const passwordLabel = document.createElement("label");
    //   passwordLabel.htmlFor = "password";
    //   passwordLabel.innerText = "Enter Password";
    //   const passwordInput = document.createElement("input");
    //   passwordInput.type = "password";
    //   passwordInput.classList.add("form-control");
    //   passwordInput.id = "password";
    //   passwordInput.placeholder = "Password";
    //   passwordContainer.append(passwordInput, passwordLabel);
    //
    //   const signInActionBtn = document.createElement("button");
    //   signInActionBtn.type = "submit";
    //   signInActionBtn.classList.add("btn", "btn-primary");
    //   signInActionBtn.innerText = "Login";
    //   signInActionBtn.dataset.bsToggle = "modal";
    //   signInActionBtn.dataset.bsTarget = "#signInModal";
    //
    //   form.append(emailContainer, passwordContainer, signInActionBtn);
    //
    //   modalContent.append(form);
    //
    //   return modal;
    // }
}

class CreateVisitModal extends Modal {
    constructor() {
        super()
        this.chooseDoctor = document.querySelector('.choose-doctor')
        this.addListeners()
    }

    addListeners() {
        this.chooseDoctor.addEventListener(
            'change',
            this.createVisitCard.bind(this)
        )

        document.querySelectorAll('.btn-close--modal').forEach((btn) => {
            btn.addEventListener('click', this.createDefaultValue.bind(this))
        })
    }

    createVisitCard() {
        this.clearForm()
        if (this.chooseDoctor.value === 'cardiologist') {
            document
                .querySelector('.cardiologist-option')
                .classList.remove('d-none')
            this.activateCreateCardBtn()
        } else if (this.chooseDoctor.value === 'dentist') {
            document.querySelector('.dentist-option').classList.remove('d-none')
            this.activateCreateCardBtn()
        } else if (this.chooseDoctor.value === 'therapist') {
            document
                .querySelector('.therapist-option')
                .classList.remove('d-none')
            this.activateCreateCardBtn()
        } else {
            this.clearForm()
        }
    }

    createDefaultValue() {
        this.chooseDoctor.value = 'choose-option'
        this.clearForm()
    }

    clearForm() {
        document
            .querySelectorAll('.choose-specialist')
            .forEach((specialist) => {
                specialist.classList.add('d-none')
            })
        document.querySelectorAll('.modal-form__data').forEach((data) => {
            data.value = ''
        })
        document.querySelectorAll('.choose-urgency').forEach((data) => {
            data.value = 'choose-urgency'
        })
        document
            .querySelector('.btn-create-visit__card')
            .classList.add('d-none')
    }

    activateCreateCardBtn() {
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
                    e.addEventListener('keyup', this.activateCreateCardBtn)
                })
                cardiologistSelect.addEventListener(
                    'change',
                    this.activateCreateCardBtn
                )
                document
                    .querySelector('.btn-create-visit__card')
                    .classList.add('d-none')
            }
        }

        if (!dentist.classList.contains('d-none')) {
            const dentistInputs = document.querySelectorAll(
                '.dentist-option__value'
            )
            const dentistSelect = document.querySelector(
                '.dentist-option__select'
            )
            if (
                [...dentistInputs].every((input) => input.value !== '') &&
                dentistSelect.value !== ''
            ) {
                document
                    .querySelector('.btn-create-visit__card')
                    .classList.remove('d-none')
            } else {
                dentistInputs.forEach((e) => {
                    e.addEventListener('keyup', this.activateCreateCardBtn)
                })
                dentistSelect.addEventListener(
                    'change',
                    this.activateCreateCardBtn
                )
                document
                    .querySelector('.btn-create-visit__card')
                    .classList.add('d-none')
            }
        }

        if (!therapist.classList.contains('d-none')) {
            const therapistInputs = document.querySelectorAll(
                '.therapist-option__value'
            )
            const therapistSelect = document.querySelector(
                '.therapist-option__select'
            )
            if (
                [...therapistInputs].every((input) => input.value !== '') &&
                therapistSelect.value !== ''
            ) {
                document
                    .querySelector('.btn-create-visit__card')
                    .classList.remove('d-none')
            } else {
                therapistInputs.forEach((e) => {
                    e.addEventListener('keyup', this.activateCreateCardBtn)
                })
                therapistSelect.addEventListener(
                    'change',
                    this.activateCreateCardBtn
                )
                document
                    .querySelector('.btn-create-visit__card')
                    .classList.add('d-none')
            }
        }
    }
}

const httpService = new HttpService()
const clinicApp = new ClinicApp(httpService)
