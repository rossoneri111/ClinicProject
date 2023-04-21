function getAccessToCabinet() {
    const form = document.querySelector('.enter-form');
    form.classList.toggle('d-none');
    document.querySelector('.btn-enter').classList.toggle('d-none');
}


async function dataVerification(e) {
    e.preventDefault();

    const email = document.querySelector('.user-email').value;
    const password = document.querySelector('.user-password').value;

    const res = await fetch("https://ajax.test-danit.com/api/v2/cards/login", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email: `${email}`, password: `${password}`})
    })
    const response = await res.text();

    if (res.status !== 200) {
        const wrongEnter = document.querySelector('.wrong-enter');
        wrongEnter.classList.remove('d-none');
    } else {
        localStorage.setItem('token', response);
        const form = document.querySelector('.enter-form');
        form.classList.toggle('d-none');
        const createVisitBtn = document.querySelector('.btn-create-visit');
        createVisitBtn.classList.toggle('d-none');
    }
}

export {getAccessToCabinet, dataVerification}
