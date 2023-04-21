import { getAccessToCabinet, dataVerification } from "./getAccessFunction.js";

class HttpService {
  constructor() {
    this.URL = "https://ajax.test-danit.com/api/v2/cards";
  }

  async signIn(email, password) {
    return await (
      await fetch(`${this.URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email, password: password }),
      })
    ).text();
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
    const { title, description, doctor, bp, age, weight } = cardData;
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

document
  .querySelector(".btn-enter")
  .addEventListener("click", getAccessToCabinet);
document
  .querySelector(".access-btn")
  .addEventListener("click", dataVerification);

class Modal {
  constructor() {}
}

const choseDoctor = document.querySelector(".choose-doctor");

choseDoctor.addEventListener("change", (e) => {
  if (choseDoctor.value === "cardiologist") {
  } else if (choseDoctor.value === "dentist") {
  } else {
  }
});
