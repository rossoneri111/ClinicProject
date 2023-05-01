import { clearForm } from "./modalWindowfunction.js";
class HttpService {
   constructor() {
      this.URL = "https://ajax.test-danit.com/api/v2/cards";
   }

   async signIn(signInData) {
      try {
         return await fetch(`${this.URL}/login`, {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               email: signInData.get("email"),
               password: signInData.get("password"),
            }),
         });
      } catch (e) {
         Handlers.errorHandler(e);
      }
   }

   async getAllCards(token) {
      try {
         return await (
            await fetch(this.URL, {
               method: "GET",
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
               },
            })
         ).json();
      } catch (e) {
         Handlers.errorHandler(e);
      }
   }

   async getCard(token, cardId) {
      try {
         return await (
            await fetch(`${this.URL}/${cardId}`, {
               method: "GET",
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
               },
            })
         ).json();
      } catch (e) {
         Handlers.errorHandler(e);
      }
   }
   async postCard(token, cardData) {
      try {
         return await (
            await fetch(this.URL, {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(cardData),
            })
         ).json();
      } catch (e) {
         Handlers.errorHandler(e);
      }
   }

   async updateCard(token, cardId, cardData) {
      try {
         return await (
            await fetch(`${this.URL}/${cardId}`, {
               method: "PUT",
               headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
               },
               body: JSON.stringify(cardData),
            })
         ).json();
      } catch (e) {
         Handlers.errorHandler(e);
      }
   }

   async deleteCard(token, cardId) {
      try {
         return await fetch(`${this.URL}/${cardId}`, {
            method: "DELETE",
            headers: {
               Authorization: `Bearer ${token}`,
            },
         });
      } catch (e) {
         Handlers.errorHandler(e);
      }
   }
}

class ClinicApp {
   constructor() {
      this.handlers = new Handlers();
      this.token = this.getToken();
      this.render();
   }

   addListeners() {
      const signInForm = document.querySelector("#signInForm");
      if (signInForm)
         signInForm.addEventListener("submit", this.handlers.signInHandler);

      const signOutForm = document.querySelector("#signOutForm");
      if (signOutForm)
         signOutForm.addEventListener("submit", this.handlers.signOutHandler);

      const createVisitBtn = document.querySelector('[name="createVisitBtn"]');
      if (createVisitBtn)
         createVisitBtn.addEventListener(
            "click",
            this.handlers.createVisitHandler
         );
   }

   getToken() {
      return sessionStorage.getItem("token");
   }

   setToken(token) {
      this.token = token;
      sessionStorage.setItem("token", token);
   }

   cleanToken() {
      sessionStorage.removeItem("token");
      this.token = null;
   }

   render() {
      const navbar = document.querySelector(".navbar-nav");
      navbar.innerHTML = "";

      const cards = document.querySelector(".cards-content");
      cards.innerHTML = "";

      this.token
         ? this.renderSignedIn(navbar, cards)
         : this.renderNotSignedIn(navbar, cards);

      this.addListeners();
   }

   async renderSignedIn(navbar, cards) {
      const createVisitBtn = new Button(
         "createVisitBtn",
         "Create Visit",
         "modal",
         "#createVisitModal",
         ["btn-primary"]
      );
      navbar.append(createVisitBtn.render());

      const signOutBtn = new Button(
         "signOutBtn",
         "Sign Out",
         "modal",
         "#signOutModal",
         ["btn-danger"]
      );
      navbar.append(signOutBtn.render());

      const cardsData = await httpService.getAllCards(this.token);
      const cardsContent = new Cards(cardsData);
      cards.append(...cardsContent.render());
   }

   renderNotSignedIn(navbar, cards) {
      const signInBtn = new Button(
         "signInBtn",
         "Sign In",
         "modal",
         "#signInModal",
         ["btn-info"]
      );
      navbar.append(signInBtn.render());

      const cardsContent = document.createElement("h2");
      cardsContent.innerText = "Please, sign in to get access to visits";
      cards.append(cardsContent);
   }
}

class Button {
   constructor(name, innerText, bsToggle, bsTarget, classList) {
      this.name = name;
      this.innerText = innerText;
      this.bsToggle = bsToggle;
      this.bsTarget = bsTarget;
      this.classList = classList;
   }

   render() {
      const btn = document.createElement("button");

      btn.name = this.name;
      btn.innerText = this.innerText;
      btn.type = "button";
      btn.classList.add("btn", ...this.classList);
      btn.dataset.bsToggle = this.bsToggle;
      btn.dataset.bsTarget = this.bsTarget;

      return btn;
   }
}

class Handlers {
   constructor() {}

   async signInHandler(event) {
      event.preventDefault();

      const formData = new FormData(this);

      try {
         const response = await httpService.signIn(formData);

         if (response.ok) {
            const token = await response.text();
            clinicApp.setToken(token);
            clinicApp.render();
         } else {
            throw new Error("Incorrect password!");
         }
      } catch (e) {
         Handlers.errorHandler(e);
      }
   }

   signOutHandler() {
      clinicApp.cleanToken();
      clinicApp.render();
   }

   createVisitHandler(event) {
      const createVisit = new CreateVisitModal();
   }

   static errorHandler(error) {
      const errorAlert = document.body.appendChild(
         Handlers.showAlert(error.message)
      );
      setTimeout(() => {
         errorAlert.remove();
      }, 5000);
   }

   static showAlert(message) {
      const alertContainer = document.createElement("div");
      alertContainer.classList.add(
         "alert",
         "alert-danger",
         "alert-dismissible",
         "w-50",
         "mx-auto",
         "fade",
         "show"
      );
      alertContainer.role = "alert";
      alertContainer.innerText = message;

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.classList.add("btn-close");
      closeBtn.dataset.bsDismiss = "alert";
      closeBtn.ariaLabel = "Close";

      alertContainer.append(closeBtn);

      return alertContainer;
   }
}

class Cards {
   constructor(cardData) {
      this.cardData = cardData;
   }

   render() {
      return this.cardData.reduce((cards, item) => {
         const {
            doctor = "Therapist",
            patient,
            purpose,
            description,
            urgency,
            age,
            id,
         } = item;
         const div = document.createElement("div");
         div.setAttribute("data-id", id);
         div.classList.add(
            "patient-card",
            "card",
            "border-success",
            "mb-3",
            "p-1",
            "w-25"
         );
         div.innerHTML = `
               <p class="card-header bg-transparent border-success position-relative">${doctor} Card
                   <img class="position-absolute top-0 end-0" width="25" height="25" src="./img/delete.svg" alt="delete">
               </p>
               <p class="card-text">Patient name: ${patient}</p>
               <p class="d-none card-text">Patient age: ${age}</p>
               <p class="d-none card-text">Purpose of visit: ${purpose}</p>
               <p class="d-none card-text">Description: ${description}</p>
               <p class="d-none card-text">Urgency: ${urgency}</p>
                <div class="card-footer bg-transparent border-success">
                   <button class="btn btn-success">Edit</button>
                   <button class="showMore btn btn-primary">Show more</button>
                </div>
               `;

         cards.push(div);

         return cards;
      }, []);
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
      super();
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
      super();
      this.chooseDoctor = document.querySelector(".choose-doctor");
      this.addListeners();
   }

   addListeners() {
      this.chooseDoctor.addEventListener(
         "change",
         this.createVisitCard.bind(this)
      );

      document.querySelectorAll(".btn-close--modal").forEach((btn) => {
         btn.addEventListener("click", this.createDefaultValue.bind(this));
      });

      document
         .querySelector(".btn-create-visit__card")
         .addEventListener("click", this.getCardData);
   }

   createVisitCard() {
      this.clearForm();
      if (this.chooseDoctor.value === "cardiologist") {
         document
            .querySelector(".cardiologist-option")
            .classList.remove("d-none");
         this.activateCreateCardBtn();
      } else if (this.chooseDoctor.value === "dentist") {
         document.querySelector(".dentist-option").classList.remove("d-none");
         this.activateCreateCardBtn();
      } else if (this.chooseDoctor.value === "therapist") {
         document.querySelector(".therapist-option").classList.remove("d-none");
         this.activateCreateCardBtn();
      } else {
         this.clearForm();
      }
   }

   getCardData() {
      const cardiologist = document.querySelector(".cardiologist-option");
      const dentist = document.querySelector(".dentist-option");
      const therapist = document.querySelector(".therapist-option");

      if (!cardiologist.classList.contains("d-none")) {
         const cardiologistCard = new VisitCardiologist({
            patient: document.querySelector(".cardiologist-option__name").value,
            age: document.querySelector(".cardiologist-option__age").value,
            purpose: document.querySelector(".cardiologist-option__purpose")
               .value,
            description: document.querySelector(
               ".cardiologist-option__description"
            ).value,
            urgency: document.querySelector(".cardiologist-option__select")
               .value,
            diseases: document.querySelector(".cardiologist-option__diseases")
               .value,
            pressure: document.querySelector(".cardiologist-option__pressure")
               .value,
            massIndex: document.querySelector(".cardiologist-option__massIndex")
               .value,
         });

         clearForm();

         httpService
            .postCard(sessionStorage.getItem("token"), cardiologistCard)
            .then((card) => {
               const {
                  doctor = "Cardiologist",
                  patient,
                  age,
                  purpose,
                  description,
                  urgency,
                  diseases,
                  pressure,
                  massIndex,
                  id,
               } = card;
               const div = document.createElement("div");
               div.setAttribute("data-id", id);
               div.classList.add(
                  "patient-card",
                  "card",
                  "border-success",
                  "mb-3",
                  "p-1",
                  "w-25"
               );
               div.innerHTML = `
                <p class="card-header bg-transparent border-success position-relative">${doctor} Card
                   <img class="position-absolute top-0 end-0" width="25" height="25" src="./img/delete.svg" alt="delete">
                </p>
               <p class="card-text">Patient name: ${patient}</p>
               <div class="collapse" id=${id}>
                  <p class="card-text">Patient age: ${age}</p>
                  <p class="card-text">Purpose of visit: ${purpose}</p>
                  <p class="card-text">Description: ${description}</p>
                  <p class="card-text">Urgency: ${urgency}</p>
                  <p class="card-text">Cardiovascular system diseases: ${diseases}</p>
                  <p class="card-text">Blood pressure: ${pressure}</p>
                  <p class="card-text">Body mass index: ${massIndex}</p>
               </div>
                <div class="card-footer bg-transparent border-success">
                    <button class="btn btn-success">Edit</button>
                    <button class="showMore btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false" aria-controls="${id}">Show More/Less</button>
                </div>
               `;
               document.querySelector(".cards-content").append(div);
            });
      }

      if (!dentist.classList.contains("d-none")) {
         const dentistCard = new VisitDentist({
            patient: document.querySelector(".dentist-option__name").value,
            purpose: document.querySelector(".dentist-option__purpose").value,
            description: document.querySelector(".dentist-option__description")
               .value,
            urgency: document.querySelector(".dentist-option__select").value,
            lastVisitData: document.querySelector(".dentist-option__data")
               .value,
         });

         clearForm();

         httpService
            .postCard(sessionStorage.getItem("token"), dentistCard)
            .then((card) => {
               const {
                  doctor = "Dentist",
                  patient,
                  purpose,
                  description,
                  urgency,
                  lastVisitData,
                  id,
               } = card;
               const div = document.createElement("div");
               div.setAttribute("data-id", id);
               div.classList.add(
                  "patient-card",
                  "card",
                  "border-success",
                  "mb-3",
                  "p-1",
                  "w-25"
               );
               div.innerHTML = `
                <p class="card-header bg-transparent border-success position-relative">${doctor} Card
                   <img class="position-absolute top-0 end-0" width="25" height="25" src="./img/delete.svg" alt="delete">
                </p>
               <p class="card-text">Patient name: ${patient}</p>
               <div class="collapse" id=${id}>
                   <p class="card-text">Purpose of visit: ${purpose}</p>
                   <p class="card-text">Description: ${description}</p>
                   <p class="card-text">Urgency: ${urgency}</p>
                   <p class="card-text">Last visit data: ${lastVisitData}</p>
               </div>
                <div class="card-footer bg-transparent border-success">
                   <button class="btn btn-success">Edit</button>
                   <button class="showMore btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false" aria-controls="${id}">Show More/Less</button>
                </div>
               `;
               document.querySelector(".cards-content").append(div);
            });
      }

      if (!therapist.classList.contains("d-none")) {
         const therapistCard = new VisitTherapist({
            patient: document.querySelector(".therapist-option__name").value,
            purpose: document.querySelector(".therapist-option__purpose").value,
            description: document.querySelector(
               ".therapist-option__description"
            ).value,
            urgency: document.querySelector(".therapist-option__select").value,
            age: document.querySelector(".therapist-option__age").value,
         });

         clearForm();

         httpService
            .postCard(sessionStorage.getItem("token"), therapistCard)
            .then((card) => {
               const {
                  doctor = "Therapist",
                  patient,
                  purpose,
                  description,
                  urgency,
                  age,
                  id,
               } = card;
               const div = document.createElement("div");
               div.setAttribute("data-id", id);
               div.classList.add(
                  "patient-card",
                  "card",
                  "border-success",
                  "mb-3",
                  "p-1",
                  "w-25"
               );
               div.innerHTML = `
               <p class="card-header bg-transparent border-success position-relative">${doctor} Card
                   <img class="position-absolute top-0 end-0" width="25" height="25" src="./img/delete.svg" alt="delete">
               </p>
               <p class="card-text">Patient name: ${patient}</p>
               <div class="collapse" id=${id}>
                  <p class="card-text">Patient age: ${age}</p>
                  <p class="card-text">Purpose of visit: ${purpose}</p>
                  <p class="card-text">Description: ${description}</p>
                  <p class="card-text">Urgency: ${urgency}</p>
               </div>
                <div class="card-footer bg-transparent border-success">
                   <button class="btn btn-success">Edit</button>
                   <button class="showMore btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#${id}" aria-expanded="false" aria-controls="${id}">Show More/Less</button>
                </div>
               `;
               document.querySelector(".cards-content").append(div);
            });
      }
   }

   createDefaultValue() {
      this.chooseDoctor.value = "choose-option";
      this.clearForm();
   }

   clearForm() {
      document.querySelectorAll(".choose-specialist").forEach((specialist) => {
         specialist.classList.add("d-none");
      });
      document.querySelectorAll(".modal-form__data").forEach((data) => {
         data.value = "";
      });
      document.querySelectorAll(".choose-urgency").forEach((data) => {
         data.value = "choose-urgency";
      });
      document.querySelector(".btn-create-visit__card").classList.add("d-none");
   }

   activateCreateCardBtn() {
      const cardiologist = document.querySelector(".cardiologist-option");
      const dentist = document.querySelector(".dentist-option");
      const therapist = document.querySelector(".therapist-option");

      if (!cardiologist.classList.contains("d-none")) {
         const cardiologistInputs = document.querySelectorAll(
            ".cardiologist-option__value"
         );
         const cardiologistSelect = document.querySelector(
            ".cardiologist-option__select"
         );
         if (
            [...cardiologistInputs].every((input) => input.value !== "") &&
            cardiologistSelect.value !== ""
         ) {
            document
               .querySelector(".btn-create-visit__card")
               .classList.remove("d-none");
         } else {
            cardiologistInputs.forEach((e) => {
               e.addEventListener("keyup", this.activateCreateCardBtn);
            });
            cardiologistSelect.addEventListener(
               "change",
               this.activateCreateCardBtn
            );
            document
               .querySelector(".btn-create-visit__card")
               .classList.add("d-none");
         }
      }

      if (!dentist.classList.contains("d-none")) {
         const dentistInputs = document.querySelectorAll(
            ".dentist-option__value"
         );
         const dentistSelect = document.querySelector(
            ".dentist-option__select"
         );
         if (
            [...dentistInputs].every((input) => input.value !== "") &&
            dentistSelect.value !== ""
         ) {
            document
               .querySelector(".btn-create-visit__card")
               .classList.remove("d-none");
         } else {
            dentistInputs.forEach((e) => {
               e.addEventListener("keyup", this.activateCreateCardBtn);
            });
            dentistSelect.addEventListener(
               "change",
               this.activateCreateCardBtn
            );
            document
               .querySelector(".btn-create-visit__card")
               .classList.add("d-none");
         }
      }

      if (!therapist.classList.contains("d-none")) {
         const therapistInputs = document.querySelectorAll(
            ".therapist-option__value"
         );
         const therapistSelect = document.querySelector(
            ".therapist-option__select"
         );
         if (
            [...therapistInputs].every((input) => input.value !== "") &&
            therapistSelect.value !== ""
         ) {
            document
               .querySelector(".btn-create-visit__card")
               .classList.remove("d-none");
         } else {
            therapistInputs.forEach((e) => {
               e.addEventListener("keyup", this.activateCreateCardBtn);
            });
            therapistSelect.addEventListener(
               "change",
               this.activateCreateCardBtn
            );
            document
               .querySelector(".btn-create-visit__card")
               .classList.add("d-none");
         }
      }
   }
}

// document.addEventListener("click", showFullCardInfo);
//
// function showFullCardInfo(e) {
//    if (e.target.classList.contains("showMore")) {
//       const card = e.target.closest(".patient-card");
//       const children = card.children;
//       for (let i = 0; i < children.length; i++) {
//          children[i].classList.remove("d-none");
//       }
//       e.target.classList.add("d-none");
//    }
// }

const httpService = new HttpService();
const clinicApp = new ClinicApp(httpService);

class Visit {
   patient;
   purpose;
   description;
   urgency;

   constructor(visitData) {
      this.validateVisitData(visitData);

      const { patient, purpose, description, urgency } = visitData;

      this.patient = patient;
      this.purpose = purpose;
      this.description = description;
      this.urgency = urgency;
   }
   validateVisitData({ patient, purpose, description, urgency }) {
      if (
         !patient ||
         typeof patient !== "string" ||
         !purpose ||
         typeof purpose !== "string" ||
         !description ||
         typeof description !== "string" ||
         !urgency ||
         typeof urgency !== "string"
      ) {
         throw new Error("Visit is not valid");
      }
   }
}

class VisitDentist extends Visit {
   lastVisitData;

   constructor(visitDentistData) {
      super(visitDentistData);
      this.validateVisitDentist(visitDentistData);

      this.lastVisitData = visitDentistData.lastVisitData;
   }

   validateVisitDentist({ lastVisitData }) {
      if (lastVisitData === null || lastVisitData === undefined) {
         throw new Error(`VisitDentist is not valid`);
      }
   }
}

class VisitCardiologist extends Visit {
   age;
   diseases;
   pressure;
   massIndex;

   constructor(visitCardiologistData) {
      super(visitCardiologistData);
      this.validateVisitCardiologist(visitCardiologistData);

      const { age, diseases, pressure, massIndex } = visitCardiologistData;

      this.age = age;
      this.diseases = diseases;
      this.pressure = pressure;
      this.massIndex = massIndex;
   }
   validateVisitCardiologist({ age, diseases, pressure, massIndex }) {
      if (
         isNaN(age) ||
         age > 100 ||
         age < 16 ||
         !isNaN(diseases) ||
         pressure < 50 ||
         pressure > 160 ||
         isNaN(massIndex)
      ) {
         throw new Error(`VisitCardiologist is not valid`);
      }
   }
}

class VisitTherapist extends Visit {
   age;

   constructor(visitTherapistData) {
      super(visitTherapistData);
      this.validateVisitTherapist(visitTherapistData);

      this.age = visitTherapistData.age;
   }
   validateVisitTherapist({ age }) {
      if (isNaN(age) || age > 100 || age < 16) {
         throw new Error(`VisitTherapist is not valid`);
      }
   }
}

class UIElement {
   constructor() {}

   renderHtml() {
      return `<div></div>`;
   }

   /**
    * @param {HTMLElement} el
    * @param {Function} listener
    */
   addListenerToElement(el, listener) {
      //
      //
   }
}

class GenericApi {
   collection;
   constructor(collection) {
      this.collection = collection;
   }
   update(id, newData = {}) {
      const dataFromServer = { hello: `world` };
      return Promise.resolve(Object.assign(dataFromServer, newData));
   }
}

class VisitApi extends GenericApi {
   constructor() {
      super(`visits`);
   }
}

class VisitCard extends UIElement {
   fullName;
   doctor;
   visit;
   /** @param {VisitDentist | VisitCardiologist | VisitTherapist} visit */

   constructor(visit) {
      super();
      if (!VisitDentist.validateVisitDentist()) {
         throw new Error(`visit should be a validate visit`);
      }

      this.visit = visit;
      this.fullName = visit.clientFullName;
      this.doctor = visit.doctor;
   }
   renderMinimizedCardHtml() {
      return `
<div class="visit-card">
   <h3 class="visit-card__client-name">${this.visit.clientFullName}</h3>
   <div class="visit-card__urgency">${this.visit.doctor}</div>
</div>`;
   }

   appendToDesk() {
      const desk = document.getElementById(`desk`);
      const visitCardHtml = this.renderHtml();
      desk.innerHTML = desk.innerHTML + visitCardHtml;
   }

   buttonEditListener() {
      //...
   }

   renderFullNameElement() {
      return `<h2>${this.fullName}</h2>`;
   }
   editVisitListener() {
      document.appendChild(new EditVisitDialog(this.visit));
      //...
      this.editVisit({});
   }

   editVisit(newFields = {}) {
      const visitApi = new VisitApi();
      const httpRequest = visitApi.update(this.visit.id, newFields);
   }
}

const visitDentist = new VisitDentist();
const visitCard = new VisitCard(visitDentist);
