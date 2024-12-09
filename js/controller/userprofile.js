// controller/userprofile.js
import { userManager, currentUser } from '../model/init.js';
import { showMenu } from '../view/showmenu.js';
import { getTranslation } from "./lang.js";
import { resetFormUser, editUser } from "./crud/cruduser.js";
import { reload } from '../model/extension/reload.js';

export function buttonUserProfile() {
    updateProfileUserMenuTitle();
    ButtonUserSetting();
    createProfileUserButtons();
}

function updateProfileUserMenuTitle() {

    if (currentUser) {
        const profileUserMenu = document.getElementById('profileUserMenu');

        // Create the <h1> element
        const profileTitleElement = profileUserMenu.querySelector('.menu-title');

        // Get translation for "Profile of"
        const profileOfTranslation = getTranslation('profileOf'); // "profileOf" should be the key in your translation file.

        // Capitalize the first letter of the username
        const capitalizedUsername = currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1);

        // Create and set the new content of the <h1>
        profileTitleElement.textContent = `${profileOfTranslation}: ${capitalizedUsername}`;
    }
}

// Show menu by ID
function ButtonUserSetting() {
    
    if (currentUser) {
        const profileUserBtn = document.getElementById('profileUserBtn');

        // Create bold element
        const boldUsername = document.createElement('strong');
        boldUsername.textContent = currentUser.username;

        // Get translation for "User"
        const userTranslation = getTranslation('profileUser');

        // Clear the button and add the formatted content
        profileUserBtn.textContent = '';  // Clear the current content
        profileUserBtn.appendChild(boldUsername);
        profileUserBtn.append(` ${userTranslation}`);
    }
}

function createProfileUserButtons() {

    const buttonsContainer = document.getElementById('buttonsContainerUserSession');
    buttonsContainer.textContent = ''; // Clear the current container

    if (!currentUser) {
        console.error('No active user found.');
        return;
    }

    // Create "Create New Account" button
    const newUserProfileBtn = document.createElement('button');
    newUserProfileBtn.id = 'newUserProfileBtn';
    newUserProfileBtn.textContent = getTranslation('newUserProfile');
    newUserProfileBtn.addEventListener('click', () => {
        resetFormUser();
        showMenu('registerUserMenu');
    });
    buttonsContainer.appendChild(newUserProfileBtn);

    // Create "Open Account" button
    const openUserProfileBtn = document.createElement('button');
    openUserProfileBtn.id = 'openUserProfileBtn';
    openUserProfileBtn.textContent = getTranslation('openUserProfile');
    openUserProfileBtn.addEventListener('click', () => {
        resetFormUser();
        showMenu('loginUserMenu');
    });

    // If the user is "default", add the create and open account buttons
    if (currentUser.username === 'default') {
        const users = userManager.users.filter(user => user.username !== 'default');
        if (users.length > 0) {
            buttonsContainer.appendChild(openUserProfileBtn);
        }
    } else {

        // Create "Edit Profile" button
        const editUserProfileBtn = document.createElement('button');
        editUserProfileBtn.id = 'editUserProfileBtn';
        editUserProfileBtn.textContent = getTranslation('editUserProfile');
        editUserProfileBtn.addEventListener('click', () => {
            resetFormUser();
            showMenu('registerUserMenu');
            editUser();
        });
        buttonsContainer.appendChild(editUserProfileBtn);

        // If it's a regular user, add all the buttons
        buttonsContainer.appendChild(openUserProfileBtn);

        // Create "Log Out" button
        const closeUserProfileBtn = document.createElement('button');
        closeUserProfileBtn.id = 'closeUserProfileBtn';
        closeUserProfileBtn.textContent = getTranslation('closeUserProfile');
        closeUserProfileBtn.addEventListener('click', () => {
            userManager.logout();
            reload();
        });
        buttonsContainer.appendChild(closeUserProfileBtn);

        // Create "Delete Account" button
        const deleteUserProfileBtn = document.createElement('button');
        deleteUserProfileBtn.id = 'deleteUserProfileBtn';
        deleteUserProfileBtn.textContent = getTranslation('deleteUserProfile');
        deleteUserProfileBtn.addEventListener('click', () => {
            resetFormUser();
            showMenu('passwordUserMenu');
        });
        buttonsContainer.appendChild(deleteUserProfileBtn);
    }
}

export async function viewUser() {
    try {
        // Get the current user from storage

        if (!currentUser) {
            console.error('Error: No current user found.');
            return;
        }

        // Adjust the value of lastAlarm
        const lastAlarm = (currentUser.lastAlarm === "N/A" || currentUser.lastAlarm === null) ? `${getTranslation('none')}` : currentUser.lastAlarm;

        // Fill the containers with user data
        document.getElementById('createdTasksContainer').innerHTML =
            `${getTranslation('createdTasks')}: <span class="value">${currentUser.stats.createdTasks}</span>`;
        document.getElementById('tasksWithAlarmContainer').innerHTML =
            `${getTranslation('tasksWithAlarm')}: <span class="value">${currentUser.stats.tasksWithAlarms}</span>`;
        document.getElementById('lastActivatedAlarmContainer').innerHTML =
            `${getTranslation('lastActivatedAlarm')}: <span class="value">${lastAlarm}</span>`;
        document.getElementById('selfDestroyedTasksContainer').innerHTML =
            `${getTranslation('selfDestroyedTasks')}: <span class="value">${currentUser.stats.destroyedTasks}</span>`;
        document.getElementById('currentTasksContainer').innerHTML =
            `${getTranslation('Active')}: <span class="value">${currentUser.stats.currentTasks.active}</span>, ` +
            `${getTranslation('Archived')}: <span class="value">${currentUser.stats.currentTasks.archived}</span>, ` +
            `${getTranslation('Trash')}: <span class="value">${currentUser.stats.currentTasks.trash}</span>`;
    } catch (error) {
        console.error('Error displaying user data:', error);
    }
}