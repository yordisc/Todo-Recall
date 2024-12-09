// controller/validate/validateuser.js
import { userManager, currentUser } from '../../model/init.js';
import { getTranslation } from '../lang.js';
import { showError, clearError, clearValidationErrors } from './validatetask.js';

function validateUsernameR() {
    const username = registerUsername.value.trim();
    const userExists = userManager.users.some(user => user.username === username);
    clearValidationErrors();

    if (username === '' || username.length < 5 || /\s/.test(username)) {
        showError(registerUsername, getTranslation('usernameInvalid'));
        registerUsername.classList.add('error');
        return false;
    } else if (username.toLowerCase() === 'default') {
        showError(registerUsername, getTranslation('usernameInvalid'));
        registerUsername.classList.add('error');
        return false;
    } else if (userExists) {
        showError(registerUsername, getTranslation('usernameExists'));
        registerUsername.classList.add('error');
        return false;
    } else {
        clearError(registerUsername);
        registerUsername.classList.add('success');
        return true;
    }
}

function validatePasswordR() {
    const password = registerPassword.value.trim();
    const passwordPattern = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
    clearValidationErrors();
    if (password === '' || /\s/.test(password)) {
        showError(registerPassword, getTranslation('passwordEmpty'));
        registerPassword.classList.add('error');
        return false;
    } else if (!passwordPattern.test(password)) {
        showError(registerPassword, getTranslation('passwordRequirements'));
        return false;
    } else {
        clearError(registerPassword);
        registerPassword.classList.add('success');
        return true;
    }
}

function validatePasswordConfirmR() {
    const password = registerPassword.value.trim();
    const confirmPassword = registerPasswordConfirm.value.trim();
    clearValidationErrors();
    if (confirmPassword === '' || confirmPassword !== password) {
        showError(registerPasswordConfirm, getTranslation('passwordMismatch'));
        registerPasswordConfirm.classList.add('error');
        console.log('error passwords do not match');
        return false;
    } else {
        clearError(registerPasswordConfirm);
        registerPasswordConfirm.classList.add('success');
        console.log('passwords match');
        return true;
    }
}

// Function to validate the current user's password
function validatePasswordUser() {
    const inputPassword = document.getElementById('inputPasswordUser').value.trim();
    const inputPasswordUser = document.getElementById('inputPasswordUser');

    clearValidationErrors();

    clearError(inputPasswordUser);

    if (!inputPassword) {
        showError(inputPasswordUser, getTranslation('Passwordisrequired'));
        return false;
    }

    if (currentUser && inputPassword === currentUser.password) {
        clearError(inputPasswordUser);
        return true; // The password is correct
    } else {
        showError(inputPasswordUser, getTranslation('incorrectPassword'));
        return false; // The password is incorrect
    }
}

function validateLogin() {
    clearValidationErrors(); // Clean up previous errors

    const usernameInput = document.getElementById('loginUserInput');
    const passwordInput = document.getElementById('loginPasswordInput');

    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username) {
        showError(usernameInput, getTranslation('Usernameisrequired'));
        return false;
    }

    if (!password) {
        showError(passwordInput, getTranslation('Passwordisrequired'));
        return false;
    }

    const user = userManager.users.find(user => user.username === username);

    if (!user) {
        showError(usernameInput, getTranslation('Userdoesnotexist'));
        return false;
    }

    if (user.password !== password) {
        showError(passwordInput, getTranslation('incorrectPassword'));
        return false;
    }

    // If all validations pass, we clear the errors and return true
    clearError(usernameInput);
    clearError(passwordInput);

    return true;
}

function validateRegister() {
    const validations = [
        validateUsernameR(),
        validatePasswordR(),
        validatePasswordConfirmR(),
    ];
    return validations.every(valid => valid);
}

function validateUserListeners() {
    const registerUsername = document.getElementById('registerUsername');
    const registerPassword = document.getElementById('registerPassword');
    const passwordConfirmInput = document.getElementById('registerPasswordConfirm');
    const inputPasswordUser = document.getElementById('inputPasswordUser');

    const loginUserInput = document.getElementById('loginUserInput');
    const loginPasswordInput = document.getElementById('loginPasswordInput');

    loginUserInput.addEventListener('input', () => validateLogin());
    loginPasswordInput.addEventListener('input', () => validateLogin());

    registerUsername.addEventListener('input', () => validateUsernameR(registerUsername));
    registerPassword.addEventListener('input', () => validatePasswordR(registerPassword));
    passwordConfirmInput.addEventListener('input', () => validatePasswordConfirmR(registerPassword, passwordConfirmInput));

    inputPasswordUser.addEventListener('input', () => validatePasswordUser());
}

export { validateRegister, validateLogin, validatePasswordUser, validateUserListeners };