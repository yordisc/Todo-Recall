// controller/listener.js
import { updateMenuColor, colorListener, resetToDefaultColor } from './color.js';
import { getTranslation, langListener, resetLangDefault } from './lang.js';
import { showMenu } from '../view/showmenu.js';
import { displayTasks } from '../controller/display.js';
import { titleOpenListener } from '../model/extension/extOrWeb.js';
import { deleteAllTasks, restoreAllTasks, resetFormTask, resetStorage } from './crud/crudtask.js';
import { userListener, resetFormUser } from './crud/cruduser.js';
import { viewUser } from './userprofile.js';
import { validateListener, clearValidationErrors } from './validate/validatetask.js';
import { validateUserListeners } from './validate/validateuser.js';
import { passwordListener } from './password.js';
import { importExportListener } from './csv.js';

function initListener() {
    titleOpenListener('mainMenuTitle', 'background.html');
    mainListener();
    backListener();
    langListener();
    timeListener();
    colorListener();
    validateListener();
    passwordListener();
    rdAllListener();
    importExportListener();
    resetDefaultListener();
    validateUserListeners();
    userListener();
}

//MAIN MENU

function mainListener() {
    searchBar.addEventListener('input', () => displayTasks(searchBar.value));
    document.getElementById('searchBtn').addEventListener('click', () => {
        searchBar.classList.toggle('visible');
        if (!searchBar.classList.contains('visible')) {
            searchBar.value = '';
            searchBar.blur();
        }
    });
    addTaskBtn.addEventListener('click', () => {
        resetFormTask();
        const currentColor = menuColor.value;
        updateMenuColor('editMenu', currentColor);
        document.querySelector('#editMenu h1').textContent = getTranslation('newTaskTitle');
        showMenu('editMenu');
    });

    archiveBtn.addEventListener('click', () => showMenu('archiveMenu'));
    trashBtn.addEventListener('click', () => showMenu('trashMenu'));
    settingsBtn.addEventListener('click', () => showMenu('optionsMenu'));
    profileUserBtn.addEventListener('click', () => {
        viewUser();
        showMenu('profileUserMenu');
    });
}

function backListener() {
    const backProfileBtn = document.getElementById('backProfileBtn');
    const backRegisterBtn = document.getElementById('backRegisterBtn');
    const backLoginBtn = document.getElementById('backLoginBtn');
    const backUserPassword = document.getElementById('backUserPassword');

    if (backProfileBtn) {
        backProfileBtn.addEventListener('click', () => {
            resetFormUser();
            showMenu('optionsMenu');
        });
    }

    if (backRegisterBtn) {
        backRegisterBtn.addEventListener('click', () => {
            resetFormUser();
            showMenu('profileUserMenu');
        });
    }

    if (backLoginBtn) {
        backLoginBtn.addEventListener('click', () => {
            resetFormUser();
            showMenu('profileUserMenu');
        });
    }

    if (backUserPassword) {
        backUserPassword.addEventListener('click', () => {
            resetFormUser();
            showMenu('profileUserMenu');
        });
    }

    const backBtns = document.querySelectorAll('[id^=back]');
    backBtns.forEach(btn => {
        if (btn.id !== 'backProfileBtn' && btn.id !== 'backRegisterBtn' && btn.id !== 'backLoginBtn' && btn.id !== 'backUserPassword') {
            btn.addEventListener('click', () => {
                resetFormTask();
                const editTaskTitle = document.querySelector('#editMenu h1');
                if (editTaskTitle) {
                    editTaskTitle.textContent = getTranslation('editTaskTitle');
                }
                showMenu('mainMenu');
            });
        }
    });
}

function timeListener() {
    addTimer.addEventListener('change', function () {
        if (this.checked) {
            timerOptions.classList.add('visible');
        } else {
            timerOptions.classList.remove('visible');
            singleTimer.checked = false;
            dailyTimer.checked = false;
            selfDestruction.checked = false;
            pomodorocheck.checked = false;
            timerInput.classList.remove('visible');
            timerInput.value = ''; // Clear the timer field when it is deselected
        }
    });
    singleTimer.addEventListener('change', function () {
        if (this.checked) {
            clearValidationErrors();
            dailyTimer.checked = false;
            selfDestruction.checked = false;
            timerInput.type = 'datetime-local';
            timerInput.classList.add('visible');
            destruction.classList.add('visible');
            pomodoro.classList.remove('visible');
        } else {
            timerInput.classList.remove('visible');
            pomodoro.classList.remove('visible');
            destruction.classList.remove('visible');
            selfDestruction.checked = false;
        }
    });
    dailyTimer.addEventListener('change', function () {
        if (this.checked) {
            clearValidationErrors();
            singleTimer.checked = false;
            pomodorocheck.checked = false;
            selfDestruction.checked = false;
            timerInput.type = 'time';
            timerInput.classList.add('visible');
            destruction.classList.add('visible');
            pomodoro.classList.add('visible');
        } else {
            timerInput.classList.remove('visible');
            pomodoro.classList.remove('visible');
            destruction.classList.remove('visible');
            selfDestruction.checked = false;
        }
    });
}

pomodorocheck.addEventListener('change', function () {
    if (this.checked) {
        selfDestruction.checked = false;
        timerInput.type = 'number';
    } else {
        timerInput.type = 'time';
    }
});

selfDestruction.addEventListener('change', function () {
    if (this.checked) {
        pomodorocheck.checked = false;
    }

    if (singleTimer.checked) {
        timerInput.type = 'datetime-local';
    }

    if (dailyTimer.checked) {
        timerInput.type = 'time';
    }
});

function rdAllListener() {
    restoreAllBtn.addEventListener('click', restoreAllTasks);
    deleteAllBtn.addEventListener('click', deleteAllTasks);
}

function resetDefaultListener() {
    resetDefaultBtn.addEventListener('click', function () {
        resetLangDefault();
        resetToDefaultColor();
        //resetStorage(); // Clear memory
    });
}

export { initListener };