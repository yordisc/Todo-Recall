// model/extension/reload.js

import { checkIfExtensionOrWeb } from './extOrWeb.js';

let browser = chrome || browser;

export function reload() {
    const { environment } = checkIfExtensionOrWeb();

    if (environment === 'web') {
        reloadDOM(); // Only reload the DOM if it's on the web
    } else if (environment === 'extension') {
        reloadDOM(); // Only reload the DOM if it's on the web
        reloadExtension(); // Reload the extension if in extension environment
    }
}

export function reloadDOM() {
    location.reload(); // Reload the DOM (web)
}

export function reloadExtension() {
    if (typeof browser !== 'undefined') {
        browser.runtime.reload(); // Reload the extension
    }
}