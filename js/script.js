// js/script.js
import { initController } from './controller/init.js';

document.addEventListener('DOMContentLoaded', function () {

        console.log('DOM is fully loaded and parsed');

        let inTaskViewMenu = false;
        let currentTaskIndex = 0;
        let currentMenuOptionIndex = 0;

        // Main menu

        const mainMenuTitle = document.getElementById('mainMenuTitle');
        const searchBar = document.getElementById('searchBar');
        const addTaskBtn = document.getElementById('addTaskBtn');
        const archiveBtn = document.getElementById('archiveBtn');
        const trashBtn = document.getElementById('trashBtn');
        const settingsBtn = document.getElementById('settingsBtn');
        const profileUserBtn = document.getElementById('profileUserBtn');

        // All
        const restoreAllBtn = document.getElementById('restoreAllBtn');
        const deleteAllBtn = document.getElementById('deleteAllBtn');

        // MENU EDICION
        const taskTitle = document.getElementById('taskTitle');
        const taskDesc = document.getElementById('taskDesc');
        const taskUrl = document.getElementById('taskUrl');
        const addUrlCheckbox = document.getElementById('addUrlCheckbox');
        const taskPassword = document.getElementById('taskPassword');
        const addPasswordCheckbox = document.getElementById('addPasswordCheckbox');
        const tabAction = document.getElementById('tabAction');
        const getUrlBtn = document.getElementById('getUrlBtn');
        const taskColor = document.getElementById('taskColor');
        const timer = document.getElementById('timer');
        const addTimer = document.getElementById('addTimer');
        const singleTimer = document.getElementById('singleTimer');
        const dailyTimer = document.getElementById('dailyTimerCheckbox');
        const pomodoro = document.getElementById('pomodoro');
        const pomodorocheck = document.getElementById('pomodorocheck');
        const timerOptions = document.getElementById('timerOptions');
        const saveBtn = document.getElementById('saveBtn');

        // Password
        const confirmPasswordBtn = document.getElementById('confirmPasswordBtn');
        const togglePasswordBtn = document.getElementById('togglePasswordBtn');
        const inputPassword = document.getElementById('inputPassword');

        // Caching DOM elements
        const app = document.getElementById('app');

        const taskList = document.getElementById('taskList');
        const archivedTasksList = document.getElementById('archivedTasks');
        const trashTasksList = document.getElementById('trashTasks');

        initController();

});