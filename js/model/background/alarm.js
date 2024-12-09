// model/background/alarm.js

import TaskData from '../data/taskdata.js';
import taskManager, { userManager } from '../init.js';
import { destroyTask } from './destroytask.js';
import { createNotification, changeTabColorBeforeNotification } from './notification.js';
import { executeTaskAction, rescheduleTask, reschedulePomodoroTask } from './managertask.js';

let browser = typeof chrome !== "undefined" ? chrome : browser;

async function setAlarm(task) {
    console.log(`Setting alarm for task: ${task.title} at ${task.timer}`);

    if (!task.timer) {
        return console.log(`No timer value provided for task: ${task.title}`);
    }

    let now = new Date();
    let alarmTime;

    if (task.pomodoro) {
        let minutes = parseInt(task.timer);
        if (isNaN(minutes) || minutes <= 0) {
            return console.error(`Invalid timer for Pomodoro task: ${task.title}`);
        }
        alarmTime = now.getTime() + minutes * 60 * 1000;
    } else {
        alarmTime = calculateAlarmTime(task.timer, now);
    }

    if (isNaN(alarmTime)) {
        return console.error(`Invalid alarm time for task: ${task.title}`);
    }

    console.log(`Final alarm time for task: ${task.title} is ${new Date(alarmTime).toISOString()}`);
    browser.alarms.create(task.id, { when: alarmTime });
}

function calculateAlarmTime(timer, now) {
    if (timer.includes('T')) {
        let alarmTime = new Date(timer).getTime();
        if (isNaN(alarmTime)) {
            console.error(`Invalid datetime-local format for timer: ${timer}`);
            return NaN;
        }
        return alarmTime;
    } else {
        let [hours, minutes] = timer.split(':').map(Number);
        if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            console.error(`Invalid time format for timer: ${timer}`);
            return NaN;
        }

        let targetTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0, 0);
        if (now > targetTime) {
            targetTime.setDate(targetTime.getDate() + 1);
        }
        return targetTime.getTime();
    }
}

export async function handleAlarm(alarm) {
    try {
        console.log(`Alarm triggered for task ID: ${alarm.name}`);

        let tasks = await taskManager.fetchTasks();
        let task = tasks.find(t => t.id === alarm.name);

        if (!task) {
            return console.log(`Task not found for ID: ${alarm.name}`);
        }

        console.log(`Executing task: ${task.title}`);

        let currentUser = await userManager.getCurrentUser();
        if (currentUser) {
            let now = new Date().toISOString();
            currentUser.setLastAlarm(now);
            await userManager.saveUsers();
            console.log(`Last alarm set for user ${currentUser.username} at ${now}`);
        } else {
            console.error('No current user available');
        }

        await changeTabColorBeforeNotification(task);

        setTimeout(async () => {
            await createNotification(task);
            await executeTaskAction(task);

            if (task.destroy) {
                await destroyTask(task);
            } else if (task.pomodoro) {
                await reschedulePomodoroTask(task);
            } else if (!task.timer.includes('T')) {
                await rescheduleTask(task);
            }
        }, 3000);
    } catch (error) {
        console.error('Error handling alarm:', error);
    }
}

export async function setupAlarms() {
    try {
        let tasks = await taskManager.fetchTasks();
        let currentUser = await userManager.getCurrentUser();
        if (!currentUser) {
            console.log('No active user found');
        }

        console.log('Current user:', currentUser.id);

        console.log(`Removing old alarms for user: ${currentUser.id}`);
        await removeOldAlarms(currentUser.id);
        console.log('Old alarms removed. Setting up new alarms...');

        console.log('Fetched tasks:', tasks);

        let userTasks = tasks.filter(task => task.iduser === currentUser.id);
        console.log('User tasks:', userTasks);

        for (let task of userTasks.filter(task => !task.archived && !task.trashed)) {
            console.log(`Setting alarm for task ID: ${task.id} with timer: ${task.timer}`);
            await setAlarm(new TaskData(task));
        }
    } catch (error) {
        console.error('Error setting up alarms:', error);
    }
}

export async function removeOldAlarms(currentUserId) {
    try {
        let alarms = await browser.alarms.getAll();
        console.log('Current alarms:', alarms);

        for (let alarm of alarms) {
            let tasks = await taskManager.fetchTasks();
            let task = tasks.find(t => t.id === alarm.name);
            if (task && task.iduser !== currentUserId) {
                await browser.alarms.clear(alarm.name);
                console.log(`Cleared alarm for task ID: ${alarm.name}`);
            }
        }
    } catch (error) {
        console.error('Error removing old alarms:', error);
    }
}