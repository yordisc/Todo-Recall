// controller/csv.js
import TaskData from '../model/data/taskdata.js';
import taskManager, { currentUser } from '../model/init.js';
import { generateTaskId } from '../model/extension/idgen.js';
import { passwordExport } from './password.js';
import { reloadDOM } from '../model/extension/reload.js';

function convertTasksToCsv(tasks) {
    if (tasks.length === 0) {
        alert('There are no tasks to export.');
        return null;
    }
    const headers = Object.keys(tasks[0]);
    const csvRows = [
        headers.join(','),
        ...tasks.map(task =>
            headers.map(header => `"${('' + task[header]).replace(/"/g, '\\"')}"`).join(',')
        )
    ];
    return csvRows.join('\n');
}

function downloadCsv(csvString, filename) {
    if (!csvString) return;

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('Export completed successfully.');
}

function exportCsv() {

    if (!currentUser) {
        alert('No user is currently logged in.');
        return;
    }

    function proceedWithExport() {
        const tasksToExport = taskManager.getTasks()
            .filter(task => task.iduser === currentUser.id)
            .map(task => ({
                title: task.title,
                description: task.description,
                url: task.url,
                action: task.action,
                timer: task.timer,
                pomodoro: task.pomodoro,
                color: task.color,
                //password: task.password,
                //archived: task.archived,
                //trashed: task.trashed,
                destroy: task.destroy
            }));

        const csvString = convertTasksToCsv(tasksToExport);
        downloadCsv(csvString, 'tasks.csv');
    }

    if (currentUser.username !== 'default') {
        passwordExport(proceedWithExport);
    } else {
        proceedWithExport();
    }
}

function importCsv() {
    if (!currentUser) {
        alert('No user is currently logged in.');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';

    input.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (!file) {
            console.error('No file selected');
            return;
        }

        const reader = new FileReader();

        reader.onload = async (e) => {
            try {
                const text = e.target.result;
                console.log('CSV file content:', text);

                if (!text || text.trim() === '') {
                    throw new Error('The CSV file is empty.');
                }

                const rows = text.split('\n').filter(row => row.trim() !== '');
                if (rows.length === 0) {
                    throw new Error('There are no rows in the CSV file.');
                }

                const headerRow = rows[0].split(',').map(header => header.trim());
                const requiredHeaders = ['title', 'description', 'url', 'action', 'timer', 'pomodoro', 'color', 'destroy'];

                // Check if the required headers are present
                if (!requiredHeaders.every(header => headerRow.includes(header))) {
                    throw new Error('Required columns are missing from the CSV file.');
                }

                const dataRows = rows.slice(1);
                if (dataRows.length === 0) {
                    throw new Error('There is no data in the CSV file.');
                }

                // Safely retrieve the current tasks
                const { tasks = [] } = await taskManager.getAllTasks(); // Ensure there is always an array
                const existingIds = new Set(tasks.map(task => task.id));

                const tasksFromCsv = dataRows.map(row => {
                    const columns = row.split(',').map(cell => cell.trim());

                    // Create a task using the headers
                    const task = {};
                    headerRow.forEach((header, index) => {
                        let value = columns[index] ? columns[index].replace(/"/g, '').trim() : '';

                        // Convert boolean or numeric values
                        if (value === 'true' || value === 'false') {
                            value = value === 'true';
                        } else if (!isNaN(value) && value !== '') {
                            value = Number(value);
                        }
                        task[header] = value || ''; // Ensure no 'undefined' values

                        // Convert title to string if it's not
                        if (header === 'title' && typeof value !== 'string') {
                            task[header] = String(value);
                        }
                    });

                    // Generate a unique ID for the task if it doesn't exist
                    let taskId = task.id || generateTaskId();
                    while (existingIds.has(taskId)) {
                        taskId = generateTaskId();
                    }
                    task.id = taskId;
                    task.iduser = currentUser.id;
                    existingIds.add(taskId);

                    return task;
                }).filter(task => Object.keys(task).length > 0); // Filter out empty tasks

                console.log('Tasks from CSV:', tasksFromCsv);

                tasksFromCsv.forEach(taskData => {
                    const newTask = new TaskData(taskData);
                    taskManager.addTask(newTask);
                });

                taskManager.updateStorage();
                alert('Import completed successfully.');
                reloadDOM();
            } catch (error) {
                console.error('Error importing CSV:', error);
                alert('There was an error importing the CSV file.');
            }
        };

        reader.readAsText(file);
    });

    input.click();
}

function importExportListener() {
    document.getElementById('importCsvBtn').addEventListener('click', importCsv);
    document.getElementById('exportCsvBtn').addEventListener('click', exportCsv);
}

export { importExportListener };