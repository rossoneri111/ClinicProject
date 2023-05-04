import { clearForm, createVisitCard } from "./modalWindowfunction.js";

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
         return await fetch(`${this.URL}/${cardId}`, {
            method: "PUT",
            headers: {
               "Content-Type": "application/json",
               Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(cardData),
         });
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
         ["btn-primary", "me-3"]
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
      if (this.cardData.length) this.addListeners();
   }

   addListeners() {
      const filterForm = document.querySelector("#filterCards");
      const filterBtn = filterForm.querySelector(".btn-primary");
      const resetBtn = filterForm.querySelector(".btn-danger");

      if (filterBtn.disabled) {
         filterBtn.disabled = false;
         filterForm.addEventListener("submit", this.filter);
      }

      if (resetBtn.disabled) {
         resetBtn.disabled = false;
         filterForm.addEventListener("reset", this.filter);
      }
   }

   filter(event) {
      const filterData = new FormData(this);
      const cards = [...document.querySelector("#cards").children];
      const searchRequest = filterData.get("searchRequest").toLowerCase();
      const urgency = filterData.getAll("urgency");
      const status = filterData.get("status");

      cards.forEach((card) => {
         const name = card.dataset.name;
         const desc = card.dataset.desc;
         (name.includes(searchRequest) || desc.includes(searchRequest)) &&
         urgency.includes(card.dataset.urgency)
            ? card.classList.remove("d-none")
            : card.classList.add("d-none");
      });

      if (event.type === "submit") event.preventDefault();

      // temporary using for checking filter requests
      console.log(searchRequest, urgency, status);
   }

   render() {
      if (this.cardData.length) {
         this.addListeners();

         return this.cardData.reduce((cards, item) => {
            const card = new VisitCard(item);
            cards.push(card.render());
            return cards;
         }, []);
      } else {
         const cardsPlaceholder = document.createElement("h2");
         cardsPlaceholder.innerText = "No visits data";
         cardsPlaceholder.id = "cardsPlaceholder";
         return [cardsPlaceholder];
      }
   }
}

class CreateVisitModal {
   constructor() {
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
               const div = new VisitCard(card);
               const cardsContent = document.querySelector(".cards-content");
               cardsContent.querySelector("#cardsPlaceholder")
                  ? cardsContent.replaceChildren(div.render())
                  : cardsContent.append(div.render());
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
               const div = new VisitCard(card);
               const cardsContent = document.querySelector(".cards-content");
               cardsContent.querySelector("#cardsPlaceholder")
                  ? cardsContent.replaceChildren(div.render())
                  : cardsContent.append(div.render());
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
               const div = new VisitCard(card);
               const cardsContent = document.querySelector(".cards-content");
               cardsContent.querySelector("#cardsPlaceholder")
                  ? cardsContent.replaceChildren(div.render())
                  : cardsContent.append(div.render());
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
   doctor = "Dentist";

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
   doctor = "Cardiologist";

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
   doctor = "Therapist";

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

class VisitCard {
   visit;

   /** @param {VisitDentist | VisitCardiologist | VisitTherapist} visit */

   constructor(visit) {
      // if (!VisitDentist.validateVisitDentist()) {
      //    throw new Error(`visit should be a validate visit`);
      // }
      this.visit = visit;
      const { patient, purpose, description, urgency, id, doctor } = visit;

      this.id = id;
      this.doctor = doctor;
      this.patient = patient;
      this.purpose = purpose;
      this.description = description;
      this.urgency = urgency;
   }

   render() {
      const div = document.createElement("div");
      div.dataset.id = this.id;
      div.dataset.urgency = this.urgency;
      div.dataset.name = this.patient;
      div.dataset.desc = this.description;
      div.classList.add("patient-card", "card", "mb-3", "p-1", "w-25");
      div.innerHTML = this.#getVisitCardHtml();
      this.changeBorderColor(div);

      try {
         const buttonDelete = div.querySelector(".btn__delete");
         buttonDelete.addEventListener("click", this.deleteVisit.bind(this));
      } catch (e) {
         console.log(e.message);
      }

      //
      // const buttonEdit = div.querySelector(".btn__edit");
      // buttonEdit.addEventListener("click", this.openEditModal);

      // document.querySelector(".cards-content").append(div);
      return div;
   }

   #getVisitCardHtml() {
      switch (this.visit.doctor) {
         case "Dentist":
            return `
                <p class="card-header bg-transparent border-warning border-2 position-relative">${this.visit.doctor} Card
                   <img class="position-absolute top-0 end-0 btn__delete" width="25" height="25" src="./img/delete.svg" alt="delete">
                </p>
               <p class="card-text">Patient name: <span class="patient-name">${this.visit.patient}</span></p>
               <div class="collapse" id=${this.visit.id}>
                   <p class="card-text">Purpose of visit: <span class="patient-purpose">${this.visit.purpose}</span></p>
                   <p class="card-text">Description: <span class="patient-description">${this.visit.description}</span></p>
                   <p class="card-text">Urgency: <span class="patient-urgency">${this.visit.urgency}</span></p>
                   <p class="card-text">Last visit data: <span class="patient-last-visit">${this.visit.lastVisitData}</span></p>
               </div>
                <div class="card-footer bg-transparent border-warning border-2">
                   <button class="btn btn-success btn-edit" data-bs-toggle="modal" data-bs-target="#dentist-edit">Edit</button>
                   <button class="showMore btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#${this.visit.id}" aria-expanded="false" aria-controls="${this.visit.id}">Show More/Less</button>
                </div>
               `;
         case "Cardiologist":
            return `

               <p class="card-header bg-transparent border-danger border-2 position-relative">${this.visit.doctor} Card
            <img class="position-absolute top-0 end-0 btn__delete" width="25" height="25" src="./img/delete.svg" alt="delete">
            </p>
            <p class="card-text">Patient name: <span class="patient-name">${this.visit.patient}</span></p>
            <div class="collapse" id=${this.visit.id}>
               <p class="card-text">Patient age: <span class="patient-age">${this.visit.age}</span></p>
               <p class="card-text">Purpose of visit: <span class="patient-purpose">${this.visit.purpose}</span></p>
               <p class="card-text">Description: <span class="patient-description">${this.visit.description}</span></p>
               <p class="card-text">Urgency: <span class="patient-urgency">${this.visit.urgency}</span></p>
               <p class="card-text">Cardiovascular system diseases: <span class="patient-diseases">${this.visit.diseases}</span></p>
               <p class="card-text">Blood pressure: <span class="patient-pressure">${this.visit.pressure}</span></p>
               <p class="card-text">Body mass index: <span class="patient-mass-index">${this.visit.massIndex}</span></p>
            </div>
            </div>
            <div class="card-footer bg-transparent border-danger border-2">
               <button class="btn btn-success btn-edit" data-bs-toggle="modal" data-bs-target="#cardiologist-edit">Edit</button>
               <button class="showMore btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#${this.visit.id}" aria-expanded="false" aria-controls="${this.visit.id}">Show More/Less</button>
            </div>
               `;

         case "Therapist":
            return `
               <p class="card-header bg-transparent border-success border-2 position-relative">${this.visit.doctor} Card
                   <img class="position-absolute top-0 end-0 btn__delete" width="25" height="25" src="./img/delete.svg" alt="delete">
               </p>
               <p class="card-text">Patient name: <span class="patient-name">${this.visit.patient}</span></p>
               <div class="collapse" id=${this.visit.id}>
                  <p class="card-text">Patient age: <span class="patient-age">${this.visit.age}</span></p>
                  <p class="card-text">Purpose of visit: <span class="patient-purpose">${this.visit.purpose}</span></p>
                  <p class="card-text">Description: <span class="patient-description">${this.visit.description}</span></p>
                  <p class="card-text">Urgency: <span class="patient-urgency">${this.visit.urgency}</span></p>
               </div>
                <div class="card-footer bg-transparent border-success border-2">
                   <button class="btn btn-success btn-edit" data-bs-toggle="modal" data-bs-target="#therapist-edit">Edit</button>
                   <button class="showMore btn btn-primary" type="button" data-bs-toggle="collapse" data-bs-target="#${this.visit.id}" aria-expanded="false" aria-controls="${this.visit.id}">Show More/Less</button>
                </div>
               `;
         default:
            break;
      }
   }

   async deleteVisit() {
      const confirmResult = confirm("Do you want to delete this card?");
      if (!confirmResult) {
         return;
      }
      const response = await httpService.deleteCard(
         sessionStorage.getItem("token"),
         this.id
      );
      if (response.status === 200) {
         const cardDiv = document.querySelector(`[data-id="${this.id}"]`);
         if (!cardDiv) {
            throw new Error("");
         }
         cardDiv.remove();
      }
   }

   changeBorderColor(div) {
      if (this.visit.doctor === `Therapist`) {
         div.classList.add("border-success", "border-5");
      }
      if (this.visit.doctor === `Dentist`) {
         div.classList.add("border-warning", "border-5");
      }
      if (this.visit.doctor === `Cardiologist`) {
         div.classList.add("border-danger", "border-5");
      }
   }

   appendToDesk() {
      const desk = document.getElementById(`desk`);
      const visitCardHtml = this.renderHtml();
      desk.innerHTML = desk.innerHTML + visitCardHtml;
   }

   buttonEditListener() {
      //...
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

class VisitDentistCard extends VisitCard {
   constructor(visit) {
      super(visit);
      this.lastVisitData = visit.lastVisitData;
   }
}

class VisitTherapistCard extends VisitCard {
   constructor(visit) {
      super(visit);
      this.age = visit.age;
   }
}

class VisitCardiologistCard extends VisitCard {
   constructor(visit) {
      super(visit);
      const { age, diseases, pressure, massIndex } = visit;

      this.age = age;
      this.diseases = diseases;
      this.pressure = pressure;
      this.massIndex = massIndex;
   }
}

import { dragnDrop } from "./DragnDropFunction.js";

dragnDrop();

function dddd() {
   const f = new HttpService();
   f.deleteCard(sessionStorage.getItem("token"), 169733);
}

// dddd()

document.querySelector(".cards-content").addEventListener("click", editCard);

function editCard(e) {
   if (e.target.classList.contains("btn-edit")) {
      if (
         e.target.closest(".patient-card").children[0].innerText ===
         "Dentist Card"
      ) {
         const id = e.target
            .closest(".card-footer")
            .closest(".patient-card")
            .getAttribute("data-id");

         const name = e.target
            .closest(".patient-card")
            .querySelector(".patient-name").innerText;
         const purpose = e.target
            .closest(".patient-card")
            .querySelector(".patient-purpose").innerText;
         const description = e.target
            .closest(".patient-card")
            .querySelector(".patient-description").innerText;
         const urgency = e.target
            .closest(".patient-card")
            .querySelector(".patient-urgency").innerText;
         const data = e.target
            .closest(".patient-card")
            .querySelector(".patient-last-visit").innerText;

         document.querySelector(".dentist-option__purpose-edit").value =
            purpose;
         document.querySelector(".dentist-option__data-edit").value = data;
         document.querySelector(".dentist-option__description-edit").value =
            description;
         document.querySelector(".dentist-option__select-edit").value = urgency;
         document.querySelector(".dentist-option__name-edit").value = name;

         document
            .querySelector(".dentist-save__changes")
            .addEventListener("click", function (e) {
               const changedData = new VisitDentist({
                  patient: document.querySelector(".dentist-option__name-edit")
                     .value,
                  purpose: document.querySelector(
                     ".dentist-option__purpose-edit"
                  ).value,
                  description: document.querySelector(
                     ".dentist-option__description-edit"
                  ).value,
                  urgency: document.querySelector(
                     ".dentist-option__select-edit"
                  ).value,
                  lastVisitData: document.querySelector(
                     ".dentist-option__data-edit"
                  ).value,
               });
               changedData.id = id;

               httpService
                  .updateCard(sessionStorage.getItem("token"), id, changedData)
                  .then((res) => {
                     if (res.ok) {
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-name").innerText =
                           changedData.patient;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-purpose").innerText =
                           changedData.purpose;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-description").innerText =
                           changedData.description;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-urgency").innerText =
                           changedData.urgency;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-last-visit").innerText =
                           changedData.lastVisitData;
                     }
                  });
            });
      }

      if (
         e.target.closest(".patient-card").children[0].innerText ===
         "Cardiologist Card"
      ) {
         const id = e.target
            .closest(".card-footer")
            .closest(".patient-card")
            .getAttribute("data-id");

         const name = e.target
            .closest(".patient-card")
            .querySelector(".patient-name").innerText;
         const age = e.target
            .closest(".patient-card")
            .querySelector(".patient-age").innerText;
         const purpose = e.target
            .closest(".patient-card")
            .querySelector(".patient-purpose").innerText;
         const description = e.target
            .closest(".patient-card")
            .querySelector(".patient-description").innerText;
         const urgency = e.target
            .closest(".patient-card")
            .querySelector(".patient-urgency").innerText;
         const diseases = e.target
            .closest(".patient-card")
            .querySelector(".patient-diseases").innerText;
         const pressure = e.target
            .closest(".patient-card")
            .querySelector(".patient-pressure").innerText;
         const massIndex = e.target
            .closest(".patient-card")
            .querySelector(".patient-mass-index").innerText;

         document.querySelector(".cardiologist-option__purpose-edit").value =
            purpose;
         document.querySelector(
            ".cardiologist-option__description-edit"
         ).value = description;
         document.querySelector(".cardiologist-option__select-edit").value =
            urgency;
         document.querySelector(".cardiologist-option__name-edit").value = name;
         document.querySelector(".cardiologist-option__pressure-edit").value =
            pressure;
         document.querySelector(".cardiologist-option__massIndex-edit").value =
            massIndex;
         document.querySelector(".cardiologist-option__diseases-edit").value =
            diseases;
         document.querySelector(".cardiologist-option__age-edit").value = age;

         document
            .querySelector(".cardiologist-save__changes")
            .addEventListener("click", function (e) {
               const changedData = new VisitCardiologist({
                  patient: document.querySelector(
                     ".cardiologist-option__name-edit"
                  ).value,
                  purpose: document.querySelector(
                     ".cardiologist-option__purpose-edit"
                  ).value,
                  description: document.querySelector(
                     ".cardiologist-option__description-edit"
                  ).value,
                  urgency: document.querySelector(
                     ".cardiologist-option__select-edit"
                  ).value,
                  pressure: document.querySelector(
                     ".cardiologist-option__pressure-edit"
                  ).value,
                  massIndex: document.querySelector(
                     ".cardiologist-option__massIndex-edit"
                  ).value,
                  diseases: document.querySelector(
                     ".cardiologist-option__diseases-edit"
                  ).value,
                  age: document.querySelector(".cardiologist-option__age-edit")
                     .value,
               });
               changedData.id = id;

               httpService
                  .updateCard(sessionStorage.getItem("token"), id, changedData)
                  .then((res) => {
                     if (res.ok) {
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-name").innerText =
                           changedData.patient;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-purpose").innerText =
                           changedData.purpose;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-description").innerText =
                           changedData.description;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-urgency").innerText =
                           changedData.urgency;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-age").innerText =
                           changedData.age;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-pressure").innerText =
                           changedData.pressure;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-mass-index").innerText =
                           changedData.massIndex;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-diseases").innerText =
                           changedData.diseases;
                     }
                  });
            });
      }

      if (
         e.target.closest(".patient-card").children[0].innerText ===
         "Therapist Card"
      ) {
         const id = e.target
            .closest(".card-footer")
            .closest(".patient-card")
            .getAttribute("data-id");

         const name = e.target
            .closest(".patient-card")
            .querySelector(".patient-name").innerText;
         const age = e.target
            .closest(".patient-card")
            .querySelector(".patient-age").innerText;
         const purpose = e.target
            .closest(".patient-card")
            .querySelector(".patient-purpose").innerText;
         const description = e.target
            .closest(".patient-card")
            .querySelector(".patient-description").innerText;
         const urgency = e.target
            .closest(".patient-card")
            .querySelector(".patient-urgency").innerText;

         document.querySelector(".therapist-option__purpose-edit").value =
            purpose;
         document.querySelector(".therapist-option__age-edit").value = age;
         document.querySelector(".therapist-option__description-edit").value =
            description;
         document.querySelector(".therapist-option__select-edit").value =
            urgency;
         document.querySelector(".therapist-option__name-edit").value = name;

         document
            .querySelector(".therapist-save__changes")
            .addEventListener("click", function (e) {
               const changedData = new VisitTherapist({
                  patient: document.querySelector(
                     ".therapist-option__name-edit"
                  ).value,
                  purpose: document.querySelector(
                     ".therapist-option__purpose-edit"
                  ).value,
                  description: document.querySelector(
                     ".therapist-option__description-edit"
                  ).value,
                  urgency: document.querySelector(
                     ".therapist-option__select-edit"
                  ).value,
                  age: document.querySelector(".therapist-option__age-edit")
                     .value,
               });
               changedData.id = id;

               httpService
                  .updateCard(sessionStorage.getItem("token"), id, changedData)
                  .then((res) => {
                     if (res.ok) {
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-name").innerText =
                           changedData.patient;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-purpose").innerText =
                           changedData.purpose;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-description").innerText =
                           changedData.description;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-urgency").innerText =
                           changedData.urgency;
                        document
                           .querySelector(`[data-id="${id}"]`)
                           .querySelector(".patient-age").innerText =
                           changedData.age;
                     }
                  });
            });
      }
   }
}
