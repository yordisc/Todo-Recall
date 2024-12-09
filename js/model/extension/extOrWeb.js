// model/extension/extOrWeb.js
let browser = chrome || browser;

export function checkIfExtensionOrWeb() {
    let environment = 'web';
    let browserName = 'Unknown';

    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.id) {
        environment = 'extension';
        if (navigator.userAgent.includes("Edg")) {
            browserName = 'Edge';
        } else if (navigator.userAgent.includes("Chrome")) {
            browserName = 'Chrome';
        }
    } else if (typeof browser !== "undefined" && browser.runtime && browser.runtime.id) {
        environment = 'extension';
        browserName = 'Firefox';
    } else if (navigator.userAgent.includes("Safari") && !navigator.userAgent.includes("Chrome")) {
        browserName = 'Safari';
    }

    return { environment, browserName };
}

// Function to apply view settings based on the environment
function applyViewSettings() {
    const viewElements = document.querySelectorAll('.view');
    if (!viewElements.length) {
        console.error("View elements not found");
        return null;
    }

    const { environment } = checkIfExtensionOrWeb();
    const isExtension = environment === 'extension';
    const settings = isExtension
        ? { width: '250px', maxWidth: '250px', maxHeight: '330px', height: '330px' }
        : { width: '90%', maxWidth: '320px', maxHeight: 'auto', height: 'auto' };

    viewElements.forEach(view => Object.assign(view.style, settings));

    return settings;
}

function titleOpenListener(titleId, pageUrl) {
    const mainMenuTitle = document.getElementById(titleId);
    if (!mainMenuTitle) {
        console.error(`Element with ID ${titleId} not found`);
        return;
    }

    mainMenuTitle.addEventListener('click', function () {
        const { environment } = checkIfExtensionOrWeb();
        const isExtension = environment === 'extension';
        if (!isExtension) {
            console.error('The extension is not in extension mode.');
            return;
        }

        const runtime = typeof chrome !== 'undefined' ? chrome.runtime : browser.runtime;
        const tabs = typeof chrome !== 'undefined' ? chrome.tabs : browser.tabs;
        const extensionUrl = runtime.getURL(pageUrl);

        // Get current dimensions
        const currentSettings = applyViewSettings();
        if (!currentSettings) {
            console.error('Could not obtain the current dimensions.');
            return;
        }

        if (tabs && tabs.create) {

            tabs.create({ url: extensionUrl }, (tab) => {
                // Inject script to adjust zoom
                if (typeof browser !== 'undefined' && browser.tabs) {
                    browser.tabs.executeScript(tab.id, {
                        code: 'document.body.style.zoom = "150%";'
                    });
                }
            });

        } else {
            console.error('Could not open the URL in a new tab.');
        }
    });
}

// Export the function if needed
export { applyViewSettings, titleOpenListener };