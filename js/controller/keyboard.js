// controller/keyboard.js
import taskManager from '../model/init.js';
import { showMenu } from '../view/showmenu.js';
import { viewTask } from './crud/crudtask.js';

function keyboardListener() {
    let isInContainer = false;
    let currentTaskIndex = 0;

    document.getElementById('Container').addEventListener('focusin', () => {
        isInContainer = true;
    });

    document.getElementById('Container').addEventListener('focusout', (event) => {
        // Check if the focus has moved outside the Container and not to an element inside the Container
        if (!document.getElementById('Container').contains(event.relatedTarget)) {
            isInContainer = false;
        }
    });

    document.addEventListener('keydown', function (event) {
        const activeMenu = document.querySelector('.view.active');

        if (!activeMenu) return; // If no menu is active, do nothing

        // Get the focusable items of the active menu
        const focusableElements = getFocusableElements(activeMenu);
        let currentFocus = focusableElements.findIndex(el => el.classList.contains('focused'));
        if (currentFocus === -1 && focusableElements.length > 0) currentFocus = 0;

        if (isInContainer) {
            // Navigation within the container
            const taskContainers = activeMenu.querySelectorAll('#Container ul li');
            let currentTaskIndex = Array.from(taskContainers).findIndex(task => task.classList.contains('focused'));

            if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
                event.preventDefault();
                if (taskContainers.length === 0) return;

                taskContainers.forEach(task => task.classList.remove('focused'));

                if (event.key === 'ArrowUp') {
                    if (currentTaskIndex === 0) {
                        // If we are on the first element, move focus to the "settingsBtn" button
                        document.getElementById('settingsBtn').focus();
                        return;
                    } else {
                        currentTaskIndex = (currentTaskIndex > 0) ? currentTaskIndex - 1 : taskContainers.length - 1;
                    }
                } else if (event.key === 'ArrowDown') {
                    if (currentTaskIndex === taskContainers.length - 1) {
                        // If we are on the last element, move focus to the "addTaskBtn" button
                        document.getElementById('addTaskBtn').focus();
                        return;
                    } else {
                        currentTaskIndex = (currentTaskIndex < taskContainers.length - 1) ? currentTaskIndex + 1 : 0;
                    }
                }

                taskContainers[currentTaskIndex].classList.add('focused');
                taskContainers[currentTaskIndex].querySelector('.task-title').focus();
            }

            if (['ArrowLeft', 'ArrowRight'].includes(event.key) && currentTaskIndex !== -1) {
                const buttons = taskContainers[currentTaskIndex].querySelectorAll('.task-action-btn, .task-title');
                let currentButtonIndex = Array.from(buttons).findIndex(button => button === document.activeElement);

                if (currentButtonIndex !== -1) {
                    if (event.key === 'ArrowLeft') {
                        currentButtonIndex = (currentButtonIndex > 0) ? currentButtonIndex - 1 : buttons.length - 1;
                    } else if (event.key === 'ArrowRight') {
                        currentButtonIndex = (currentButtonIndex < buttons.length - 1) ? currentButtonIndex + 1 : 0;
                    }

                    buttons[currentButtonIndex].focus();
                }
            }

            const focusedElement = document.activeElement;
            if (focusedElement && focusedElement.classList.contains('task-title')) {
                const tasks = taskManager.getTasks('tasks'); // Get the tasks
                const taskId = tasks.find(task => task.title === focusedElement.textContent).id;
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    viewTask(taskId);
                }
            }
        } else {
            // Page navigation
            if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
                event.preventDefault();
                if (focusableElements.length === 0) return;
                focusableElements.forEach(el => el.classList.remove('focused'));
                if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
                    currentFocus = (currentFocus > 0) ? currentFocus - 1 : focusableElements.length - 1;
                } else if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
                    currentFocus = (currentFocus < focusableElements.length - 1) ? currentFocus + 1 : 0;
                }
                focusableElements[currentFocus]?.classList.add('focused');
                focusableElements[currentFocus]?.focus();
            }
        }

        if (event.key === 'Escape') {
            const searchBar = document.getElementById('searchBar');
            if (searchBar && searchBar.classList.contains('visible') && document.activeElement === searchBar) {
                searchBar.classList.remove('visible');
                searchBar.value = '';
                searchBar.blur();
            } else {
                event.preventDefault();
                showMenu('mainMenu');
            }
        }

        if (event.ctrlKey) {
            switch (event.key) {
                case 'n':
                    event.preventDefault();
                    document.getElementById('addTaskBtn').click();
                    break;
                case 's':
                    event.preventDefault();
                    document.getElementById('settingsBtn').click();
                    break;
                case 'r':
                    event.preventDefault();
                    document.getElementById('trashBtn').click();
                    break;
                case 'a':
                    event.preventDefault();
                    document.getElementById('archiveBtn').click();
                    break;
                case ' ':
                    event.preventDefault();
                    document.getElementById('searchBtn').click();
                    break;
            }
        }
    });

    function getFocusableElements(menu) {
        return Array.from(menu.querySelectorAll('button, a, input, select, textarea, [tabindex]'))
            .filter(el => !el.hasAttribute('disabled') && el.tabIndex >= 0);
    }
}

export { keyboardListener };