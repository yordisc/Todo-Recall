// controller/crud/crudtask.js
import taskManager from '../../model/init.js';
import { validateTask } from '../validate/validatetask.js';
import { getTranslation } from '../lang.js';
import { showMenu } from '../../view/showmenu.js';
import { displayTasks } from '../display.js';
import { updateAllMenusColor, updateMenuColor, styleTaskMenu } from '../color.js';

export let currentTaskId = null;
export let currentAction = '';

const taskActions = {
    edit: editTask,
    view: viewTask,
    trash: trashTask,
    archive: archiveTask,
    restore: restoreTask,
    delete: deleteTask
};

Object.keys(taskActions).forEach(action => {
    window[`${action}Task`] = (id) => handleTaskAction(id, action);
});

function handleTaskAction(id, action) {
    currentTaskId = id;
    currentAction = action;

    const taskAction = taskActions[action];
    if (taskAction) {
        taskAction(id);
    } else {
        console.error('Invalid action:', action);
    }
}

async function saveTask() {
    if (!validateTask()) return;

    const taskData = createTaskDataFromForm();

    try {
        const existingTask = await findTaskById(currentTaskId);

        if (existingTask) {
            await taskManager.updateTask(existingTask.id, taskData);
            console.log("saveTask - Task updated with ID:", existingTask.id);
        } else {
            const newTaskId = await taskManager.addTask(taskData);
            console.log("saveTask - New task saved with ID:", newTaskId);
        }

        postSaveActions(taskData);
        resetFormTask();
    } catch (error) {
        console.error("Error saving task:", error);
    }
}

function createTaskDataFromForm() {
    const menuColor = document.getElementById('menuColor').value;
    return {
        title: taskTitle.value.trim(),
        description: taskDesc.value.trim(),
        url: taskUrl.value.trim(),
        action: tabAction.value,
        timer: timerInput.value,
        color: taskColor.value === 'default' ? menuColor : taskColor.value,
        pomodoro: pomodorocheck.checked,
        password: taskPassword.value,
        archived: false,
        trashed: false,
        destroy: selfDestruction.checked
    };
}

function postSaveActions(taskData) {
    displayTasks();
    showMenu('mainMenu');

    if (taskData.color === 'default') {
        const menuColor = document.getElementById('menuColor').value;
        updateAllMenusColor(menuColor);
    }
}

async function findTaskById(id) {
    try {
        const allTasks = await taskManager.getAllTasks();

        const tasks = Array.isArray(allTasks.tasks) ? allTasks.tasks : [];
        const archivedTasks = Array.isArray(allTasks.archivedTasks) ? allTasks.archivedTasks : [];
        const trashTasks = Array.isArray(allTasks.trashTasks) ? allTasks.trashTasks : [];

        const allTasksList = [
            ...tasks,
            ...archivedTasks,
            ...trashTasks
        ];

        console.log('Combined tasks list:', allTasksList);

        return allTasksList.find(task => task.id === id);
    } catch (error) {
        console.error('Error finding task by ID:', error);
        return null;
    }
}

async function editTask(id) {
    try {
        resetFormTask();
        currentTaskId = id;
        console.log("editTask - Received ID:", id);

        const task = await findTaskById(id);
        if (!task) {
            console.warn("editTask - Task not found for ID:", id);
            return;
        }

        if (task.password) {
            console.log("editTask - Task password protected. Showing password menu.");
            currentTaskId = id;
            currentAction = 'edit';
            showMenu('passwordMenu');
            return;
        }

        populateForm(task);
        showMenu('editMenu');
        console.log("editTask - currentTaskId assigned:", currentTaskId);
    } catch (error) {
        console.error("Error editing task:", error);
    }
}

function populateForm(task) {
    const { title, description, url, action, timer, pomodoro, color, password, destroy } = task;

    // Assign values to form fields
    taskTitle.value = title || '';
    taskDesc.value = description || '';
    taskUrl.value = url || '';
    tabAction.value = action || 'none';
    taskColor.value = color || 'default';
    taskPassword.value = password || '';

    if (taskColor.value === 'default') {
        taskColor.value = document.getElementById('menuColor').value;
    }

// Configure the timer input field
if (timer) {
    if (!isNaN(timer)) {
        // Timer is a number, assume it's a duration in minutes
        timerInput.type = 'number'; // Use number input for durations
        timerInput.min = '0'; // Set a minimum value for number input
        timerInput.step = '1'; // Increment step for number input
        timerInput.value = timer;
    } else if (timer.includes('T')) {
        // Timer is in datetime-local format
        timerInput.type = 'datetime-local';
        timerInput.value = timer;
    } else if (timer.includes(':')) {
        // Timer is in time format (HH:MM)
        timerInput.type = 'time';
        timerInput.value = timer;
    } else {
        // Default to text if none of the above formats match
        timerInput.type = 'text';
        timerInput.value = '';
    }
} else {
    // No timer provided, set input to text with empty value
    timerInput.type = 'text';
    timerInput.value = '';
}

    configureUrl(url);
    configureTimer(timer);
    configurePassword(password);

    selfDestruction.checked = destroy;
    pomodorocheck.checked = pomodoro;

    styleTaskMenu('editMenu', color || 'default');

    showMenu('editMenu');
}

function configureTimer(timerValue) {
    // Ensure timerValue is a string before calling .includes
    let isDateTime = typeof timerValue === 'string' && timerValue.includes('T');

    addTimer.checked = !!timerValue;
    timerInput.classList.toggle('visible', !!timerValue);
    timerOptions.classList.toggle('visible', !!timerValue);
    destruction.classList.toggle('visible', !!timerValue);

    singleTimer.checked = isDateTime;
    dailyTimer.checked = !isDateTime;
}

function configureUrl(url) {
    const isVisible = !!url;
    addUrlCheckbox.checked = isVisible;
    taskUrl.classList.toggle('visible', isVisible);
    getUrlBtn.classList.toggle('visible', isVisible);
    clearUrlBtn.classList.toggle('visible', isVisible);
}

function configurePassword(password) {
    const isVisible = !!password;
    addPasswordCheckbox.checked = isVisible;
    taskPassword.classList.toggle('visible', isVisible);
}

async function trashTask(id) {
    try {
        const task = await findTaskById(id);
        if (task?.password) {
            showMenu('passwordMenu');
            return;
        }

        await taskManager.trashTask(id);
        displayTasks();
        showMenu('mainMenu');
    } catch (error) {
        console.error("Error trashing task:", error);
    }
}

async function archiveTask(id) {
    await taskManager.archiveTask(id);
    displayTasks();
}

async function restoreTask(id) {
    await taskManager.restoreTask(id);
    displayTasks();
}

async function restoreAllTasks() {
    await taskManager.restoreAllTasks();
    displayTasks();
}

async function deleteTask(id) {
    try {
        await taskManager.deleteTask(id);
        displayTasks();
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}

async function deleteAllTasks() {
    await taskManager.deleteAllTasks();
    displayTasks();
}

function findTask(id) {
    return taskManager.getTasks('tasks')
        .concat(taskManager.getTasks('archived'))
        .concat(taskManager.getTasks('trash'))
        .find(t => t.id === id);
}

async function resetStorage() {
    alert(await taskManager.resetStorage());
    displayTasks();
    showMenu('mainMenu');
}

function resetFormTask() {
    currentTaskId = null;
    taskTitle.value = '';
    taskDesc.value = '';
    taskUrl.value = '';
    tabAction.value = 'none';
    timerInput.type = 'text';
    timerInput.value = '';
    taskColor.value = 'default';
    taskPassword.value = '';
    inputPassword.value = '';
    
    addPasswordCheckbox.checked = false;
    addTimer.checked = false;
    singleTimer.checked = false;
    dailyTimer.checked = false;
    pomodorocheck.checked = false;
    selfDestruction.checked = false;
    pomodoro.classList.remove('visible');
    destruction.classList.remove('visible');
    timerInput.classList.remove('visible');
    timerOptions.classList.remove('visible');
    taskPassword.classList.remove('visible');
    addUrlCheckbox.checked = false;
    taskUrl.classList.remove('visible');
    getUrlBtn.classList.remove('visible');
    clearUrlBtn.classList.remove('visible');

    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input, textarea').forEach(el => el.classList.remove('error', 'success'));
}

function viewTask(id) {
    const task = findTask(id);

    if (!task) {
        showMenu('mainMenu');
        return;
    }

    if (task.password) {
        currentTaskId = id;
        currentAction = 'view';
        showMenu('passwordMenu');
        return;
    }

    displayTaskContent(task);
}

function displayTaskContent(task) {
    const { title, description, url, action, timer, color, password, destroy, pomodoro } = task;
    const viewTaskContent = document.getElementById('viewTaskContent');
    const actionText = getActionText(action);
    const urlHtml = url ? `<a href="${url}" target="_blank">${url}</a>` : getTranslation('noURL');
    const colorName = getTranslation(`${color}Color`);

    // Convert the value of the timer depending on the data type and if it is pomodoro
    let timerText = '';

    if (!timer) {
        // If timer is empty or not defined, use the translation for 'tabActionNone'
        timerText = getTranslation('none');
    } else if (pomodoro) {
        // If pomodoro is true, display the timer in HH:mm format
        timerText = `${timer} (${getTranslation('pomodoro')})`;
    } else {
        // Convert 'datetime-local' to a readable date
        if (timer.includes('T')) {
            const date = new Date(timer);
            timerText = date.toLocaleString();
        } else {
            // Handle 'time' format that is already in HH:mm
            timerText = timer;
        }
    }

    // Build the HTML content
    let contentHtml = `
        <h2>${title}</h2>
        <p>${description}</p>
        <p><strong>${getTranslation('url')}:</strong> ${urlHtml}</p>
        <p><strong>${getTranslation('action')}:</strong> ${actionText}</p>
        <p><strong>${getTranslation('timer')}:</strong> ${timerText}</p>
        <p><strong>${getTranslation('color')}:</strong> ${colorName}</p>
    `;

    // Add the password text if one exists
    if (password) {
        contentHtml += `<p><strong>${getTranslation('passwordProtected')}:</strong></p>`;
    }

    // Add the self-destruction message if it is activated
    if (destroy) {
        contentHtml += `<p class="centered"><strong>${getTranslation('selfDestructionActive')}</strong></p>`;
    }

    // Set the content in the container
    viewTaskContent.innerHTML = contentHtml;

    // Apply styling and display the menu
    styleTaskMenu('viewTaskMenu', color || 'default');
    showMenu('viewTaskMenu');
}

function getActionText(action) {
    const actionsMap = {
        openLink: 'tabActionOpenLink',
        closeTab: 'tabActionCloseTab',
        none: 'tabActionNone'
    };
    return getTranslation(actionsMap[action] || 'tabActionNone');
}

export {
    viewTask,
    displayTaskContent,
    handleTaskAction,
    populateForm,
    saveTask,
    editTask,
    archiveTask,
    trashTask,
    deleteTask,
    deleteAllTasks,
    restoreTask,
    restoreAllTasks,
    resetStorage,
    resetFormTask
};