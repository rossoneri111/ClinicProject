import {getAccessToCabinet, dataVerification} from './getAccessFunction.js'

document.querySelector('.btn-enter').addEventListener('click', getAccessToCabinet);
document.querySelector('.access-btn').addEventListener('click', dataVerification);




class Modal {
    constructor() {
    }
}



const choseDoctor = document.querySelector('.choose-doctor');

choseDoctor.addEventListener('change', e => {
    if (choseDoctor.value === 'cardiologist') {

    } else if (choseDoctor.value === 'dentist') {

    } else {

    }
})
