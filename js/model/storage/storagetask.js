// model/storage/storagetask.js
import TaskData from '../data/taskdata.js';
import { generateTaskId } from '../extension/idgen.js';

export default class StorageTask {
    constructor(userManager, storageWrapper) {
        this.userManager = userManager;
        this.storageWrapper = storageWrapper;
        this.eventListeners = {};
        this.tasks = [];
        this.archivedTasks = [];
        this.trashTasks = [];
    }

    on(event, listener) {
        if (!this.eventListeners[event]) {
            this.eventListeners[event] = [];
        }
        this.eventListeners[event].push(listener);
    }

    emit(event, ...args) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(listener => listener(...args));
        }
    }

    validateArray(data) {
        return Array.isArray(data) ? data : [];
    }

    async loadTasks() {
        try {
            const tasks = await this.storageWrapper.getItem('tasks');
            console.log('Loaded tasks from storage:', tasks);
            this.tasks = this.validateArray(tasks).map(taskData => new TaskData(taskData));

            const archivedTasks = await this.storageWrapper.getItem('archivedTasks');
            console.log('Loaded archivedTasks from storage:', archivedTasks);
            this.archivedTasks = this.validateArray(archivedTasks).map(taskData => new TaskData(taskData));

            const trashTasks = await this.storageWrapper.getItem('trashTasks');
            console.log('Loaded trashTasks from storage:', trashTasks);
            this.trashTasks = this.validateArray(trashTasks).map(taskData => new TaskData(taskData));
            this.emit('tasksUpdated');
        } catch (error) {
            console.error('Error loading tasks:', error);
        }
    }

    async updateStorage() {
        await this.storageWrapper.setItem('tasks', this.tasks || []);
        await this.storageWrapper.setItem('archivedTasks', this.archivedTasks || []);
        await this.storageWrapper.setItem('trashTasks', this.trashTasks || []);
    }

    async syncToLocalStorage() {
        const tasks = await this.storageWrapper.getItem('tasks');
        localStorage.setItem('tasks', JSON.stringify(tasks));
        const archivedTasks = await this.storageWrapper.getItem('archivedTasks');
        localStorage.setItem('archivedTasks', JSON.stringify(archivedTasks));
        const trashTasks = await this.storageWrapper.getItem('trashTasks');
        localStorage.setItem('trashTasks', JSON.stringify(trashTasks));
    }

    async syncToChromeStorage() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        await this.storageWrapper.setItem('tasks', tasks);
        const archivedTasks = JSON.parse(localStorage.getItem('archivedTasks')) || [];
        await this.storageWrapper.setItem('archivedTasks', archivedTasks);
        const trashTasks = JSON.parse(localStorage.getItem('trashTasks')) || [];
        await this.storageWrapper.setItem('trashTasks', trashTasks);
    }

    async getAllTasks() {
        try {
            const currentUser = await this.userManager.getCurrentUser();
            const userId = currentUser ? currentUser.id : null;
            console.log('Current user ID:', userId);

            let tasks = await this.storageWrapper.getItem('tasks') || [];
            let archivedTasks = await this.storageWrapper.getItem('archivedTasks') || [];
            let trashTasks = await this.storageWrapper.getItem('trashTasks') || [];

            tasks = Array.isArray(tasks) ? tasks : [];
            archivedTasks = Array.isArray(archivedTasks) ? archivedTasks : [];
            trashTasks = Array.isArray(trashTasks) ? trashTasks : [];

            if (userId) {
                tasks = tasks.filter(task => task.iduser === userId);
                archivedTasks = archivedTasks.filter(task => task.iduser === userId);
                trashTasks = trashTasks.filter(task => task.iduser === userId);
            }

            console.log('Filtered tasks:', tasks);
            console.log('Filtered archivedTasks:', archivedTasks);
            console.log('Filtered trashTasks:', trashTasks);

            return { tasks, archivedTasks, trashTasks };
        } catch (error) {
            console.error('Failed to get tasks:', error);
            throw error;
        }
    }

    async fetchTasks() {
        try {
            let tasks = await this.storageWrapper.getItem('tasks');
            tasks = Array.isArray(tasks) ? tasks : [];
            this.tasks = this.validateArray(tasks).map(taskData => new TaskData(taskData));
            console.log('Fetched tasks:', tasks);
            return this.tasks || [];
        } catch (e) {
            console.error('Error fetching tasks:', e);
            return [];
        }
    }

    getTasks(type) {
        switch (type) {
            case 'archived': return this.archivedTasks;
            case 'trash': return this.trashTasks;
            default: return this.tasks;
        }
    }

    async addTask(taskData) {
        const currentUser = await this.userManager.getCurrentUser();
        if (!currentUser) throw new Error('No user is currently logged in.');

        const uniqueId = this.generateUniqueId();
        const task = new TaskData({ ...taskData, iduser: currentUser.id, id: uniqueId });

        this.tasks.push(task);
        await this.updateStorage();
        await currentUser.addTaskStats();
        return uniqueId;
    }

    async updateTask(id, updatedTaskData) {
        const currentUser = await this.userManager.getCurrentUser();
        if (!currentUser) throw new Error('No user is currently logged in.');

        const taskIndex = this.tasks.findIndex(t => t.id === id);
        if (taskIndex > -1) {
            Object.assign(this.tasks[taskIndex], updatedTaskData);
            await this.updateStorage();
            if (this.storageWrapper.isExtension) {
                await this.syncToLocalStorage();
            }
        }
        await currentUser.updateStats();
    }

    async archiveTask(taskId) {
        const currentUser = await this.userManager.getCurrentUser();
        if (!currentUser) throw new Error('No user is currently logged in.');

        const task = this.findTaskById(this.tasks, taskId);
        if (task) {
            task.archived = true;
            task.trashed = false;
            this.archivedTasks.push(task);
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            await this.updateStorage();
            await currentUser.updateStats();
        }
    }

    async trashTask(taskId) {
        const currentUser = await this.userManager.getCurrentUser();
        if (!currentUser) throw new Error('No user is currently logged in.');

        const task = this.findTaskById(this.tasks, taskId);
        if (task) {
            task.trashed = true;
            task.archived = false;
            this.trashTasks.push(task);
            this.tasks = this.tasks.filter(t => t.id !== taskId);
            await this.updateStorage();
            await currentUser.updateStats();
        }
    }


    async deleteTask(id) {
        const currentUser = await this.userManager.getCurrentUser();
        if (!currentUser) throw new Error('No user is currently logged in.');

        const task = this.findTaskById(this.tasks, id) ||
            this.findTaskById(this.archivedTasks, id) ||
            this.findTaskById(this.trashTasks, id);

        if (!task) {
            console.error('Task not found in any list:', id);
            throw new Error('Task not found.');
        }

        if (this.tasks.some(t => t.id === id)) {
            this.tasks = this.tasks.filter(t => t.id !== id);
        } else if (this.archivedTasks.some(t => t.id === id)) {
            this.archivedTasks = this.archivedTasks.filter(t => t.id !== id);
        } else if (this.trashTasks.some(t => t.id === id)) {
            this.trashTasks = this.trashTasks.filter(t => t.id !== id);
        }
        await this.updateStorage();
        await currentUser.updateStats();
    }

    async restoreTask(id) {
        const currentUser = await this.userManager.getCurrentUser();
        if (!currentUser) throw new Error('No user is currently logged in.');

        const task = this.findTaskById(this.trashTasks, id) || this.findTaskById(this.archivedTasks, id);
        if (!task) return;

        if (task.trashed) {
            this.trashTasks = this.trashTasks.filter(t => t.id !== id);
        } else if (task.archived) {
            this.archivedTasks = this.archivedTasks.filter(t => t.id !== id);
        }

        task.trashed = false;
        task.archived = false;

        this.tasks.push(task);
        await this.updateStorage();
        await currentUser.updateStats();
    }

    async deleteAllTasks() {
        const currentUser = await this.userManager.getCurrentUser();
        if (!currentUser) throw new Error('No user is currently logged in.');

        const userId = currentUser.id;

        this.trashTasks = this.trashTasks.filter(task => {
            if (task.iduser === userId) {
                return false;
            }
            return true;
        });

        await this.updateStorage();
        await currentUser.updateStats();
    }

    async restoreAllTasks() {
        const currentUser = await this.userManager.getCurrentUser();
        if (!currentUser) throw new Error('No user is currently logged in.');

        const userId = currentUser.id;

        while (this.trashTasks.length > 0) {
            const task = this.trashTasks.pop();
            if (task.iduser === userId) {
                task.trashed = false;
                this.tasks.push(task);
            }
        }

        await this.updateStorage();
        await currentUser.storageResetStats();
    }

    findTaskById(tasks, id) {
        if (!Array.isArray(tasks)) {
            console.error('tasks is not an array:', tasks);
            return null;
        }
        return tasks.find(t => t.id === id);
    }

    generateUniqueId() {
        let newId;
        const allTasks = [...this.tasks, ...this.archivedTasks, ...this.trashTasks];
        do {
            newId = generateTaskId();
        } while (allTasks.some(t => t.id === newId));
        return newId;
    }

    async resetStorage() {
        this.tasks = [];
        this.archivedTasks = [];
        this.trashTasks = [];
        await this.storageWrapper.clear();
        await this.storageWrapper.setItem('menuColor', 'default');
        await this.storageWrapper.setItem('language', 'en');
        await this.updateStorage();
        this.emit('storageReset');
        return "Memory completely cleared.";
    }
}
