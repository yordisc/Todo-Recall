// controller/password.js
import taskManager, { currentUser } from '../model/init.js';
import { showMenu } from '../view/showmenu.js';
import { displayTasks } from './display.js';
import { getTranslation } from './lang.js';
import { currentTaskId, currentAction, populateForm, displayTaskContent } from './crud/crudtask.js';
import { showError } from './validate/validatetask.js';

// Clear previous validations from a specific field
function clearPasswordValidation(inputPasswordElement) {
    inputPasswordElement.classList.remove('error', 'success');
    const errorMessage = inputPasswordElement.parentElement.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function validatePasswordInput(storedPassword, inputPasswordElement) {
    const inputPassword = inputPasswordElement.value.trim();

    // Clear any previous validation
    clearPasswordValidation(inputPasswordElement);

    // Check if the entered password matches the stored password
    if (inputPassword === storedPassword) {
        inputPasswordElement.classList.add('success');
        return true;
    } else {
        inputPasswordElement.classList.add('error');
        showError(inputPasswordElement, getTranslation('incorrectPassword'));
        return false;
    }
}

async function confirmPasswordAction() {
    console.log('Confirming password...');

    // Find the task in the available lists
    const task = taskManager.getTasks('tasks').find(t => t.id === currentTaskId) ||
        await taskManager.getTasks('archived').find(t => t.id === currentTaskId) ||
        await taskManager.getTasks('trashed').find(t => t.id === currentTaskId);

    // Validate if the task exists and if the password is correct
    if (task && validatePasswordInput(task.password, inputPassword)) {
        console.log('Correct password');
        switch (currentAction) {
            case 'view':
                displayTaskContent(task);
                showMenu('viewTaskMenu');
                break;
            case 'edit':
                populateForm(task);
                showMenu('editMenu');
                break;
            case 'trash':
                await taskManager.trashTask(currentTaskId);
                displayTasks();
                showMenu('mainMenu');
                break;
            default:
                console.error('Invalid action:', currentAction);
                showMenu('mainMenu');
        }
    } else {
        console.log('Incorrect password');
        showError(inputPassword, getTranslation('incorrectPassword'));
        inputPassword.classList.add('error');
    }
}

function passwordExport(callback) {
    showMenu('passwordMenu');

    const confirmPasswordBtn = document.getElementById('confirmPasswordBtn');
    const inputPassword = document.getElementById('inputPassword');

    if (!confirmPasswordBtn || !inputPassword) {
        console.error('Error: Necessary elements were not found in the DOM.');
        return;
    }

    const newHandler = () => {
        if (validatePasswordInput(currentUser.password, inputPassword)) {
            callback();
            showMenu('optionsMenu');
        } else {
            alert('Incorrect password. Please try again.');
        }
    };

    confirmPasswordBtn.replaceWith(confirmPasswordBtn.cloneNode(true));
    const newConfirmPasswordBtn = document.getElementById('confirmPasswordBtn');

    newConfirmPasswordBtn.addEventListener('click', newHandler);
}

function passwordListener() {
    confirmPasswordBtn.addEventListener('click', () => confirmPasswordAction());
    togglePasswordBtn.addEventListener('click', () => {
        inputPassword.type = inputPassword.type === 'password' ? 'text' : 'password';
    });
    inputPassword.addEventListener('input', () => {
        const task = taskManager.getTasks('tasks').find(t => t.id === currentTaskId) ||
            taskManager.getTasks('archived').find(t => t.id === currentTaskId) ||
            taskManager.getTasks('trashed').find(t => t.id === currentTaskId);
        if (task) {
            validatePasswordInput(task.password, inputPassword);
        }
    });
}

export { validatePasswordInput, confirmPasswordAction, passwordExport, passwordListener };