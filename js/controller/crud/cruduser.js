// controller/crud/cruduser.js
import { userManager, currentUser } from '../../model/init.js';
import { validateRegister, validateLogin, validatePasswordUser } from '../validate/validateuser.js';
import { getTranslation } from '../lang.js';
import { reload } from '../../model/extension/reload.js';

export function resetFormUser() {
    registerUsername.value = '';
    registerPassword.value = '';
    registerPasswordConfirm.value = '';
    loginUserInput.value = '';
    loginPasswordInput.value = '';
    inputPasswordUser.value = '';

    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input, textarea').forEach(el => el.classList.remove('error', 'success'));
}

function switchToEditUserMode() {
    const menu = document.getElementById('registerUserMenu');

    const title = menu.querySelector('h1.menu-title');
    title.setAttribute('translate', 'editUserTitle');
    title.textContent = getTranslation('editUserTitle');

    const registerButton = menu.querySelector('button#registerBtn');
    registerButton.setAttribute('id', 'editUserBtn');
    registerButton.setAttribute('translate', 'editUserBtn');
    registerButton.textContent = getTranslation('editUserBtn');
}

function resetToRegisterMode() {
    const menu = document.getElementById('registerUserMenu');

    const title = menu.querySelector('h1.menu-title');
    title.setAttribute('translate', 'registerTitle');
    title.textContent = 'Register';

    const editButton = menu.querySelector('button#editUserBtn');
    editButton.setAttribute('id', 'registerBtn');
    editButton.setAttribute('translate', 'registerBtn');
    editButton.textContent = 'Register';
}

async function registerUser() {
    const isRegisterValid = validateRegister();

    if (!isRegisterValid) {
        console.log('Not validated');
        return;
    }

    const username = registerUsername.value.trim();
    const password = registerPasswordConfirm.value.trim();

    try {
        console.log('Attempting to create user:', username);
        await userManager.createUser(username, password);
        console.log('User created:', username);

        console.log('Attempting to log in user:', username);
        await userManager.login(username, password);
        console.log('User logged in:', username);

        if (currentUser && currentUser.username !== 'default') {
            console.log(`New user created and active: ${currentUser.username}`);
        } else {
            console.log('Error creating or activating the new user.');
            console.log('Current user:', currentUser); // Add logging here
        }
    } catch (error) {
        console.error('Error registering the user:', error);
    }
    reload();
}

async function loginUser() {
    const isLoginValid = validateLogin();

    if (!isLoginValid) {
        console.log(`Not validated`);
        return;
    }

    const username = loginUserInput.value.trim();
    const password = loginPasswordInput.value.trim();

    try {
        await userManager.login(username, password);
        reload();
    } catch (error) {
        console.error('Error logging in user', error);
    }
}

export function editUser() {
    switchToEditUserMode();

    if (currentUser) {
        registerUsername.value = currentUser.username;
        registerPassword.value = currentUser.password;
    } else {
        console.error('No current user loaded.');
    }

    document.getElementById('editUserBtn').addEventListener('click', () => {
        saveEditUser();
        resetFormUser();
    });
}

async function saveEditUser() {
    const newUsername = registerUsername.value.trim();
    const newPassword = registerPasswordConfirm.value.trim();

    if (!newUsername || !newPassword) {
        console.error('Username or password fields are empty.');
        return;
    }

    if (currentUser) {
        currentUser.username = newUsername;
        currentUser.password = newPassword;

        try {
            await userManager.saveUsers();
            await userManager.login(newUsername, newPassword);
            console.log('User data updated and login successful.');
        } catch (error) {
            console.error('Error updating user data:', error);
        }
    } else {
        console.error('No current user loaded.');
    }
    resetToRegisterMode();
}

export function deleteUser() {
    const isPasswordUserValid = validatePasswordUser();

    if (!isPasswordUserValid) {
        console.log(`Not validated`);
        return;
    }
    userManager.deleteCurrentUser();
    reload();
}

export function userListener() {
    document.getElementById('registerBtn').addEventListener('click', () => {
        registerUser();
    });

    document.getElementById('loginBtn').addEventListener('click', () => {
        loginUser();
    });

    document.getElementById('confirmPassworUserdBtn').addEventListener('click', () => {
        deleteUser();
    });
}