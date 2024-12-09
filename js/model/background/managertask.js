// model/background/managertask.js

let browser = typeof chrome !== "undefined" ? chrome : browser;

export async function reschedulePomodoroTask(task) {
    let minutes = parseInt(task.timer);
    if (isNaN(minutes) || minutes <= 0) {
        return console.error(`Invalid timer for Pomodoro task: ${task.title}`);
    }

    let nextAlarmTime = Date.now() + minutes * 60 * 1000;
    console.log(`Rescheduling Pomodoro task: ${task.title} for ${minutes} minutes later at ${new Date(nextAlarmTime).toISOString()}`);
    browser.alarms.create(task.id, { when: nextAlarmTime });
}

export async function rescheduleTask(task) {
    let [hours, minutes] = task.timer.split(':').map(Number);
    let now = new Date();
    let nextAlarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, hours, minutes, 0, 0).getTime();

    console.log(`Rescheduling task: ${task.title} for the next day at ${new Date(nextAlarmTime).toISOString()}`);
    browser.alarms.create(task.id, { when: nextAlarmTime });
}

export async function executeTaskAction(task) {
    console.log(`Executing action: ${task.action} for task: ${task.title}`);

    switch (task.action) {
        case 'none':
            console.log(`No action taken for task: ${task.title} as the action is 'none'.`);
            break;
        case 'openLink':
            browser.tabs.create({ url: task.url || 'about:blank', active: false });
            break;
        case 'closeTab':
            task.url ? closeTabsByUrlPattern(task.url) : closeCurrentTab();
            break;
        default:
            console.error(`Unknown action type: ${task.action}`);
    }
}

async function closeCurrentTab() {
    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
        browser.tabs.remove(tabs[0].id);
    }
}

async function closeTabsByUrlPattern(pattern) {
    let regexPattern = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\./g, '\\.'), 'i');
    let tabs = await browser.tabs.query({});
    for (let tab of tabs) {
        if (regexPattern.test(tab.url)) {
            browser.tabs.remove(tab.id);
            console.log(`Closed tab with URL: ${tab.url}`);
        }
    }
}