import { getAccessToCabinet, dataVerification } from "./getAccessFunction.js";
import { createVisitCard, createDefaultValue } from "./modalWindowfunction.js";

class HttpService {
  constructor() {
    this.URL = "https://ajax.test-danit.com/api/v2/cards";
  }

  async signIn(signInData) {
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
  }

  async getAllCards(token) {
    return await (
      await fetch(this.URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    ).json();
  }

  async getCard(token, id) {
    return await (
      await fetch(`${this.URL}/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    ).json();
  }
  async postCard(token, cardData) {
    const { title , description, doctor, bp, age, weight } = cardData;
    return await (
      await fetch(this.URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title,
          description: description,
          doctor: doctor,
          bp: bp,
          age: age,
          weight: weight,
        }),
      })
    ).json();
  }

  async updateCard(token, id, cardData) {
    const { title, description, doctor, bp, age, weight } = cardData;
    return await (
      await fetch(`${this.URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: id,
          title: title,
          description: description,
          doctor: doctor,
          bp: bp,
          age: age,
          weight: weight,
        }),
      })
    ).json();
  }

  async deleteCard(token, id) {
    return await fetch(`${this.URL}/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
}

class ClinicApp {
  constructor() {
    this.handlers = new Handlers();
    this.addListeners();
    this.token = this.getToken();
    this.render();
  }

  addListeners() {
    const signInForm = document.querySelector("#signInForm");
    signInForm.addEventListener("submit", this.handlers.signInHandler);

    const createVisitForm = document.querySelector("#createVisitForm");
    createVisitForm.addEventListener(
      "submit",
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

  render() {
    const navbar = document.querySelector(".navbar-nav");
    navbar.innerHTML = "";
    this.token ? this.renderSignedIn(navbar) : this.renderNotSignedIn(navbar);
  }

  renderSignedIn(navbar) {
    const createVisitBtn = new Button(
      "createVisitBtn",
      "Create Visit Class",
      "modal",
      "#createVisitModal"
    );
    navbar.append(createVisitBtn.render());
  }

  renderNotSignedIn(navbar) {
    const signInBtn = new Button(
      "signInBtn",
      "Sign In Class",
      "modal",
      "#signInModal"
    );
    navbar.append(signInBtn.render());
  }
}

class Button {
  constructor(name, innerText, bsToggle, bsTarget) {
    this.name = name;
    this.innerText = innerText;
    this.bsToggle = bsToggle;
    this.bsTarget = bsTarget;
  }

  render() {
    const btn = document.createElement("button");

    btn.name = this.name;
    btn.innerText = this.innerText;
    btn.type = "button";
    btn.classList.add("btn", "btn-primary");
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

    const response = await httpService.signIn(formData);

    if (response.ok) {
      const token = await response.text();
      clinicApp.setToken(token);
      clinicApp.render();
    } else {
      console.log("Incorrect password!");
    }
  }

  async createVisitHandler(event) {
    event.preventDefault();

    console.log(new FormData(this));
  }
}

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

const httpService = new HttpService();
const clinicApp = new ClinicApp(httpService);
console.log(clinicApp);
document
  .querySelector(".btn-enter")
  .addEventListener("click", getAccessToCabinet);
document
  .querySelector(".access-btn")
  .addEventListener("click", dataVerification);
document
  .querySelector(".choose-doctor")
  .addEventListener("change", createVisitCard);
document.querySelectorAll(".btn-close--modal").forEach((btn) => {
  btn.addEventListener("click", createDefaultValue);
});
