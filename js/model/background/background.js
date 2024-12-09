// /model/background/background.js

import { checkIfExtensionOrWeb } from '../extension/extOrWeb.js';
import { setupAlarms, removeOldAlarms, handleAlarm } from './alarm.js';

let browser = typeof chrome !== "undefined" ? chrome : browser;
const { environment, browserName } = checkIfExtensionOrWeb();

console.log(`Background script is running in ${browserName} on ${environment}...`);

browser.runtime.onInstalled.addListener(async () => {
    await setupAlarms();
});

browser.runtime.onStartup.addListener(async () => {
    console.log('Alarms assigned');
    await setupAlarms();
});

browser.storage.onChanged.addListener(async (changes, area) => {
    if (area === 'local') {
        console.log('User change detected, reloading tasks...');
        if (changes.currentUser) {
            let newUser = await userManager.getCurrentUser();
            if (newUser) {
                await removeOldAlarms(newUser.id);
                await setupAlarms();
            }
        }

        if (changes.tasks) {
            console.log('Alarm change');
            await setupAlarms();
        }
    }
});

browser.alarms.onAlarm.addListener(handleAlarm);