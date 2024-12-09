// controller/init.js
import { initialize, currentUser } from '../model/init.js';
import { applyViewSettings } from "../model/extension/extOrWeb.js";
import { initView } from '../view/init.js';
import { initListener } from './listener.js';
import { keyboardListener } from './keyboard.js';
import { initLanguage } from "./lang.js";
import { initializeMenuColor } from "./color.js";
import { addBookmarkAutocomplete } from './autobookmark.js';


async function initController() {
    await initialize();

    initView();
    initListener();
    keyboardListener();
    addBookmarkAutocomplete();
    
    if (currentUser) {
        applyViewSettings();
        initializeMenuColor();
        initLanguage();
    } else {
        console.error('No user is currently logged in. Menu color initialization skipped.');
    }
}

export { initController };