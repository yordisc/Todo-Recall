// controller/display.js
import taskManager from '../model/init.js';
import { resetFormTask } from './crud/crudtask.js';
import { resetFormUser } from './crud/cruduser.js';
import { getTranslation } from './lang.js';

function createTaskItem(task, actions = []) {
    const taskItem = document.createElement('li');
    const style = getComputedStyle(document.documentElement);
    const bgColor = style.getPropertyValue(`--${task.color}-bg-color`);
    const textColor = style.getPropertyValue(`--${task.color}-text-color`);

    taskItem.style.backgroundColor = bgColor;
    taskItem.style.color = textColor;
    taskItem.innerHTML = `
        <span tabindex="0" class="task-title">${task.title}</span>
        ${actions.map(({ label }) => `
            <button tabindex="0" class="task-action-btn" data-action="${label}">
                ${getTranslation(label)}
            </button>`).join('')}
    `;

    taskItem.querySelector('.task-title').addEventListener('click', () => viewTask(task.id));

    actions.forEach(({ label, action }) => {
        taskItem.querySelector(`[data-action="${label}"]`).addEventListener('click', action);
    });

    return taskItem;
}

// Display tasks in the corresponding view
export async function displayTasks(searchTerm = '') {
    const taskList = document.getElementById('taskList');
    const archivedTasksList = document.getElementById('archivedTasks');
    const trashTasksList = document.getElementById('trashTasks');

    console.log('Displaying tasks with search term:', searchTerm);
    const { tasks, archivedTasks, trashTasks } = await taskManager.getAllTasks();

    console.log('Tasks:', tasks);
    console.log('Archived Tasks:', archivedTasks);
    console.log('Trash Tasks:', trashTasks);

    // Clear current tasks displayed
    taskList.innerHTML = '';
    archivedTasksList.innerHTML = '';
    trashTasksList.innerHTML = '';

    // Filter tasks by search term
    const filteredTasks = tasks.filter(task => {
        console.log('Task Title:', task.title);
        if (typeof task.title !== 'string') {
            console.warn(`Invalid task title:`, task);
            return false; // Filter invalid tasks.
        }
        return task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
               task.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
    console.log('Filtered Tasks:', filteredTasks);

    // Display filtered tasks
    filteredTasks.forEach(task => {
        console.log('Rendering Task:', task);
        taskList.appendChild(createTaskItem(task, [
            { label: 'editBtn', action: () => editTask(task.id) },
            { label: 'archiveBtn', action: () => archiveTask(task.id) },
            { label: 'trashBtn', action: () => trashTask(task.id) }
        ]));
    });

    // Display archived tasks
    archivedTasks.forEach(task => {
        console.log('Rendering Archived Task:', task);
        archivedTasksList.appendChild(createTaskItem(task, [
            { label: 'restoreBtn', action: () => restoreTask(task.id) }
        ]));
    });

    // Display trash tasks
    trashTasks.forEach(task => {
        console.log('Rendering Trash Task:', task);
        trashTasksList.appendChild(createTaskItem(task, [
            { label: 'restoreBtn', action: () => restoreTask(task.id) },
            { label: 'deleteBtn', action: () => deleteTask(task.id) }
        ]));
    });
    resetFormUser();
    resetFormTask();
}