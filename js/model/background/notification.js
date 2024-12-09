// model/background/notification.js

let browser = typeof chrome !== "undefined" ? chrome : browser;

export async function createNotification(task) {
    if (!task.id || !task.title || !task.description) {
        return console.error(`Missing required properties for notification: ${JSON.stringify(task)}`);
    }

    if (!(await checkNotificationPermission())) {
        return console.log("Notification permission not available.");
    }

    try {
        const notificationId = await browser.notifications.create({
            type: 'basic',
            iconUrl: browser.runtime.getURL('src/icon48.png'),
            title: task.title,
            message: task.description
        });
        console.log(`Notification created with ID: ${notificationId}`);
    } catch (error) {
        console.error(`Error creating notification: ${error.message}`);
    }
}

function checkNotificationPermission() {
    return new Promise(resolve => {
        browser.permissions.contains({ permissions: ['notifications'] })
            .then(result => resolve(result))
            .catch(() => resolve(false));
    });

}

export async function changeTabColorBeforeNotification(task) {
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
        return console.log('No active tab found');
    }

    let tabId = tabs[0].id;
    const color = task.color || 'default';

    try {
        let { bgColor, textColor } = await getColorsFromCSS(color, tabId);
        await browser.scripting.executeScript({
            target: { tabId },
            func: (bgColor, textColor) => {
                let style = document.createElement('style');
                style.textContent = `
                    body {
                        background-color: ${bgColor} !important;
                        color: ${textColor} !important;
                        transition: background-color 0.5s, color 0.5s;
                    }
                `;
                document.head.appendChild(style);
                setTimeout(() => document.head.removeChild(style), 3000);
            },
            args: [bgColor, textColor]
        });
    } catch (error) {
        console.log('Error changing tab color:', error.message);
    }
}

async function getColorsFromCSS(color, tabId) {
    if (typeof tabId !== 'number') {
        throw new Error('Invalid tabId');
    }

    return new Promise((resolve, reject) => {
        browser.scripting.executeScript({
            target: { tabId },
            func: (color) => {
                let rootStyles = getComputedStyle(document.documentElement);
                return {
                    bgColor: rootStyles.getPropertyValue(`--${color}-bg-color`).trim(),
                    textColor: rootStyles.getPropertyValue(`--${color}-text-color`).trim()
                };
            },
            args: [color]
        }).then(results => {
            resolve(results[0]?.result);
        }).catch(error => {
            reject(new Error(error.message));
        });
    });
}