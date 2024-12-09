// model/data/userdata.js
import { addTaskStatsUser, destroyTaskStatsUser, storageResetStatsUser, updateStatsUser } from '../init.js';

export default class UserData {
    constructor({
        id,
        active = false,
        username,
        password,
        lastAlarm = null,
        stats = {
            createdTasks: 0,
            tasksWithAlarms: 0,
            destroyedTasks: 0,
            currentTasks: { active: 0, trash: 0, archived: 0 },
            tasks: []
        },
        settings = { color: '', language: '' }
    }) {
        this.id = id;
        this.active = active;
        this.username = username;
        this.password = password;
        this.lastAlarm = lastAlarm;
        this.stats = stats;
        this.settings = settings;
    }

    setLastAlarm() {
        this.lastAlarm = new Date().toLocaleString();
    }

    addTaskStats() {
        addTaskStatsUser();
        this.updateStats();
        console.log('Task stats added');
    }

    destroyTaskStats() {
        destroyTaskStatsUser();
        this.updateStats();
        console.log('Task stats destroy');
    }

    storageResetStats() {
        storageResetStatsUser();
        console.log('Stats Reset');
    }

    updateStats() {
        updateStatsUser();
        console.log('Task stats updated');
    }

    updateSettings(newSettings) {
        Object.assign(this.settings, newSettings);
    }

    toJSON() {
        return {
            id: this.id,
            active: this.active,
            username: this.username,
            password: this.password,
            lastAlarm: this.lastAlarm,
            stats: { ...this.stats },
            settings: { ...this.settings }
        };
    }
}