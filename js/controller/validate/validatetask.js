// controller/validate/validatetask.js
import { getTranslation } from '../lang.js';
import { saveTask } from '../crud/crudtask.js';

let saveBtnClickCount = 0;
let hasShownNoUrlError = false;

function showError(element, message) {
    if (!element) {
        console.error('Error: ', message);
        return;
    }

    element.classList.add('error');
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = message;
    element.parentNode.appendChild(errorMessage);
}

function clearError(element) {
    const errorMessage = element.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    element.classList.remove('error');
}

function clearValidationErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
    document.querySelectorAll('input, textarea').forEach(el => {
        el.classList.remove('error');
        el.classList.remove('success');
    });
    hasShownNoUrlError = false;
}

function validateTask() {
    clearValidationErrors();

    const validations = [
        validateField(taskTitle, 'titleRequired'),
        validateField(taskDesc, 'descriptionRequired'),
        validateUrl(),
        validatePasswordField(),
        validateTimer(),
        validatePomodoro(),
        validateDestruction() // Moved to last, so it can show the message and allow saving
    ];

    return validations.every(valid => valid);
}

function validateField(field, errorMsgKey) {
    clearValidationErrors();
    const value = field.value.trim();
    if (!value) {
        showError(field, getTranslation(errorMsgKey));
        return false;
    }
    return true;
}

function validateUrl() {
    const url = taskUrl.value.trim();
    clearValidationErrors();
    if (addUrlCheckbox.checked) {
        if (url === '') {
            showError(taskUrl, getTranslation('noURL'));
            return false;
        } else if (!isValidUrl(url)) {
            showError(taskUrl, getTranslation('urlInvalid'));
            return false;
        }
    }

    return true;
}

function isValidUrl(url) {
    clearValidationErrors();
    const pattern = /^(ftp|http|https):\/\/[^ "]+$/;
    return pattern.test(url);
}

function validatePasswordField() {
    clearValidationErrors();
    const password = taskPassword.value.trim();
    if (addPasswordCheckbox.checked && !password) {
        showError(taskPassword, getTranslation('passwordRequirements'));
        return false;
    }
    return true;
}

function validateTimer() {
    clearValidationErrors();
    const action = tabAction.value;
    if (addTimer.checked && !timerInput.value.trim() && (action === 'openLink' || action === 'closeTab')) {
        showError(timerInput, getTranslation('timerRequired'));
        return false;
    }
    return true;
}

function validateDestruction() {
    clearValidationErrors();
    if (selfDestruction.checked) {
        showError(destruction, getTranslation('selfDestructionInfo'));
    } else {
        clearError(destruction); // Clear the message if the checkbox is unchecked
    }
    return true; // Always return true so the task can be saved
}

function validatePomodoro() {
    clearValidationErrors();
    if (pomodorocheck.checked) {
        showError(pomodoro, getTranslation('PomodoroInfo'));
    } else {
        clearError(pomodoro); // Clear the message if the checkbox is unchecked
    }
    return true; // Always return true so the task can be saved
}

function validateListener() {
    taskTitle.addEventListener('input', validateTask);
    taskDesc.addEventListener('input', validateTask);

    taskUrl.addEventListener('input', function () {
        addUrlCheckbox.checked = taskUrl.value.trim() !== '';
        validateTask();
    });

    addUrlCheckbox.addEventListener('change', function () {
        if (this.checked) {
            taskUrl.classList.add('visible');
            getUrlBtn.classList.add('visible');
            clearUrlBtn.classList.add('visible');
        } else {
            taskUrl.classList.remove('visible');
            taskUrl.value = '';
            getUrlBtn.classList.remove('visible');
            clearUrlBtn.classList.remove('visible');
        }
        validateTask();
    });

    taskPassword.addEventListener('input', validateTask);
    addPasswordCheckbox.addEventListener('change', function () {
        if (this.checked) {
            taskPassword.classList.add('visible');
        } else {
            taskPassword.classList.remove('visible');
            taskPassword.value = '';
            taskPassword.classList.remove('error', 'success');
        }
        validateTask();
    });

    tabAction.addEventListener('change', function () {
        if (this.value === 'openLink' || this.value === 'closeTab') {
            addUrlCheckbox.checked = true;
            addTimer.checked = true;
            timerOptions.classList.add('visible');
            taskUrl.classList.add('visible');
            getUrlBtn.classList.add('visible');
            clearUrlBtn.classList.add('visible');
        } else {
            addUrlCheckbox.checked = false;
            taskUrl.classList.remove('visible');
            getUrlBtn.classList.remove('visible');
            clearUrlBtn.classList.remove('visible');
            addTimer.checked = false;
        }
        validateTask();
    });

    getUrlBtn.addEventListener('click', function () {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            taskUrl.value = tabs[0].url;
            validateTask();
        });
    });
    
    clearUrlBtn.addEventListener('click', function () {
        taskUrl.value = '';
    });

    selfDestruction.addEventListener('change', function () {
        validateDestruction(); // Validate (and show/hide message) immediately when checkbox changes
    });

    pomodorocheck.addEventListener('change', function () {
        validatePomodoro();
    });

    saveBtn.addEventListener('click', () => {
        // If it's the first click
        if (saveBtnClickCount === 0) {
            if (validateTask()) {
                const action = tabAction.value;
                const url = taskUrl.value.trim();

                // If the action is 'openLink' or 'closeTab' and the URL is empty
                if ((action === 'openLink' || action === 'closeTab') && url === '') {
                    showError(taskUrl, getTranslation('noURL'));
                    hasShownNoUrlError = true; // Mark that the error was shown
                } else {
                    saveTask();
                }
            } else {
                showError(timerInput, getTranslation('noTimer'));
            }
        }
        // If it's the second click
        else if (saveBtnClickCount === 1) {
            if (validateTask()) {
                const action = tabAction.value;
                const timer =  timerInput.value.trim();

                // If the action is 'openLink' or 'closeTab' and the timer is empty
                if ((action === 'openLink' || action === 'closeTab') && !timer) {
                    showError(timerInput, getTranslation('noTimer'));
                } else {
                    saveTask();
                }
            }
        }

        // Toggle the click count
        saveBtnClickCount = (saveBtnClickCount + 1) % 2;
    });
}

export { showError, clearError, clearValidationErrors, validateTask, validateListener };