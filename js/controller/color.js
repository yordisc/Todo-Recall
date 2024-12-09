// controller/color.js
import { userManager, currentUser } from '../model/init.js';

// Centralized color definitions
const colors = [
    { value: 'default', text: 'Default', translate: 'defaultColor' },
    { value: 'yellow', text: 'Yellow', translate: 'yellowColor' },
    { value: 'blue', text: 'Blue', translate: 'blueColor' },
    { value: 'red', text: 'Red', translate: 'redColor' },
    { value: 'green', text: 'Green', translate: 'greenColor' },
    { value: 'purple', text: 'Purple', translate: 'purpleColor' },
    { value: 'orange', text: 'Orange', translate: 'orangeColor' },
    { value: 'white', text: 'White', translate: 'whiteColor' },
    { value: 'black', text: 'Black', translate: 'blackColor' }
];

// Function to create and populate the color options for a select element
function createColorOptions(selectElement, translations) {
    if (selectElement) {
        selectElement.innerHTML = ''; // Clear existing options

        colors.forEach(color => {
            const option = document.createElement('option');
            option.value = color.value;
            option.textContent = translations[color.translate] || color.text; // Use translation or fallback to default text
            option.setAttribute('translate', color.translate);
            selectElement.appendChild(option);
        });
    } else {
        console.error('Select element not found.');
    }
}

// Function to update the color of a specific menu
function updateMenuColor(menuId, color) {
    const menu = document.getElementById(menuId);
    if (menu) {
        const bgColor = getComputedStyle(document.documentElement).getPropertyValue(`--${color}-bg-color`);
        const textColor = getComputedStyle(document.documentElement).getPropertyValue(`--${color}-text-color`);
        menu.style.backgroundColor = bgColor;
        menu.style.color = textColor;
    }
}

// Function to update the color of all menus
async function updateAllMenusColor(color) {
    document.querySelectorAll('.view').forEach(menu => {
        menu.classList.remove(...colors.map(c => c.value));
        menu.classList.add(color);
        updateMenuColor(menu.id, color);
    });

    const bgColor = getComputedStyle(document.documentElement).getPropertyValue(`--${color}-bg-color`);
    const textColor = getComputedStyle(document.documentElement).getPropertyValue(`--${color}-text-color`);
    document.documentElement.style.setProperty('--menu-bg-color', bgColor);
    document.documentElement.style.setProperty('--menu-text-color', textColor);

    // Check if user is logged in before attempting to update user menu color settings
    if (currentUser) {
        try {
            await userManager.updateMenuColor(color);
        } catch (error) {
            console.error('Error updating user menu color:', error);
        }
    } else {
        console.warn('No user is currently logged in, menu color will not be saved.');
    }
}

// Function to reset all menus to default color
async function resetToDefaultColor() {
    document.querySelectorAll('.view').forEach(menu => {
        menu.classList.remove(...colors.map(c => c.value));
        menu.classList.add('default');
        menu.style.backgroundColor = '';
        menu.style.color = '';
    });
    document.documentElement.style.removeProperty('--menu-bg-color');
    document.documentElement.style.removeProperty('--menu-text-color');
    const menuColor = document.getElementById('menuColor');
    if (menuColor) {
        menuColor.value = 'default';
    }

    // Remove the color from the user's settings only if a user is logged in
    if (currentUser) {
        try {
            await userManager.updateMenuColor('default');
        } catch (error) {
            console.error('Error resetting user menu color:', error);
        }
    }
}

// Function to style a specific menu based on color
function styleTaskMenu(menuId, color) {
    const menu = document.getElementById(menuId);
    if (menu) {
        const style = getComputedStyle(document.documentElement);
        menu.style.backgroundColor = style.getPropertyValue(`--${color}-bg-color`);
        menu.style.color = style.getPropertyValue(`--${color}-text-color`);
    }
}

// Function to initialize the menu color based on saved preference or default
async function initializeMenuColor() {
    const savedMenuColor = currentUser ? currentUser.settings.color || 'default' : 'default';

    // Load language translations first
    const translations = JSON.parse(localStorage.getItem('translations')) || {};
    await updateAllMenusColor(savedMenuColor);

    const menuColor = document.getElementById('menuColor');
    const taskColor = document.getElementById('taskColor');

    if (menuColor) {
        createColorOptions(menuColor, translations);
        menuColor.value = savedMenuColor; // Set the saved color as selected
    }

    if (taskColor) {
        createColorOptions(taskColor, translations);
    }
}

// Function to handle color changes in the select elements
function colorListener() {
    const taskColor = document.getElementById('taskColor');
    const menuColor = document.getElementById('menuColor');

    if (taskColor) {
        taskColor.addEventListener('change', function () {
            updateMenuColor('editMenu', taskColor.value);
        });
    }

    if (menuColor) {
        menuColor.addEventListener('change', async function () {
            const color = menuColor.value;
            await updateAllMenusColor(color);
        });
    }
}

export { initializeMenuColor, colorListener, styleTaskMenu, resetToDefaultColor, updateMenuColor, updateAllMenusColor };
