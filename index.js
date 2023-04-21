import {getAccessToCabinet, dataVerification} from './getAccessFunction.js';
import {createVisitCard, createDefaultValue} from './modalWindowfunction.js';

document.querySelector('.btn-enter').addEventListener('click', getAccessToCabinet);
document.querySelector('.access-btn').addEventListener('click', dataVerification);
document.querySelector('.choose-doctor').addEventListener('change', createVisitCard);
document.querySelectorAll('.btn-close--modal').forEach(btn => {
    btn.addEventListener('click', createDefaultValue);
});

