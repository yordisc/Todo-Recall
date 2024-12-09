// controller/lang.js
import { userManager, currentUser } from '../model/init.js';

// Centralized language definitions
const languages = [
    { value: 'en', key: 'english' },
    { value: 'es', key: 'spanish' },
    { value: 'pt', key: 'portuguese' },
    { value: 'de', key: 'german' },
    { value: 'zh', key: 'chinese' },
    { value: 'ru', key: 'russian' },
    { value: 'hi', key: 'hindi' }
];

// Helper function to capitalize the first letter of a string
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Function to get translation from localStorage
function getTranslation(key) {
    const translations = JSON.parse(localStorage.getItem('translations')) || {};
    return translations[key] || key;
}

// Function to create and populate the language select dropdown
function createLanguageSelect(translations) {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.innerHTML = ''; // Clear existing options

        languages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.value;
            const translationKey = `languageSelect${capitalize(lang.key)}`;
            option.textContent = translations[translationKey] || lang.key; // Use translation or fallback to key
            option.setAttribute('translate', translationKey);
            languageSelect.appendChild(option);
        });
    } else {
        console.error('Language select element not found.');
    }
}

// Function to load language JSON
async function loadLanguage(language) {
    language = language.replace(/['"]+/g, '');

    try {
        const response = await fetch(`../../locales/${language}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        applyTranslations(data);
        createLanguageSelect(data);

        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.value = language;
        }

        await userManager.updateUserLanguage(language);

        observeDOMChanges(data);
    } catch (error) {
        console.error('Error loading language file:', error);
    }
}

// Function to apply translations to the UI
function applyTranslations(translations) {
    // Save translations to localStorage
    localStorage.setItem('translations', JSON.stringify(translations));

    // Apply translations to the UI
    document.title = translations.title || document.title;

    // Translate all menus and options
    document.querySelectorAll('.view').forEach(menu => {
        if (menu) translateChildren(menu, translations);
    });

    // Update color and action options
    updateOptionsTranslations('taskColor', translations);
    updateOptionsTranslations('menuColor', translations);
    updateOptionsTranslations('tabAction', translations);

    // Update placeholders
    updatePlaceholders(translations);
}

// Function to update options translations
function updateOptionsTranslations(selectId, translations) {
    const selectElement = document.getElementById(selectId);
    if (selectElement) {
        selectElement.querySelectorAll('option').forEach(option => {
            const translationKey = `${selectId}${capitalize(option.value)}`;
            if (translations[translationKey]) {
                option.textContent = translations[translationKey];
            }
        });
    }
}

// Function to update placeholders
function updatePlaceholders(translations) {
    // Example placeholders for tasks (assuming these elements exist)
    const placeholders = {
        'taskTitle': 'titlePlaceholder',
        'taskDesc': 'description',
        'taskUrl': 'urlPlaceholder',
        'taskPassword': 'passwordPlaceholder'
    };
    for (const [id, key] of Object.entries(placeholders)) {
        const element = document.getElementById(id);
        if (element) element.placeholder = getTranslation(key);
    }
}

// Function to translate an element based on its translation key
function translateElement(element, translationKey, translations) {
    if (translations[translationKey]) {
        switch (element.tagName.toLowerCase()) {
            case 'input':
                if (element.type === 'text' || element.type === 'password') {
                    element.placeholder = translations[translationKey];
                }
                break;
            case 'select':
                translateSelectOptions(element, translations);
                break;
            default:
                element.textContent = translations[translationKey];
                break;
        }
    }
}

// Function to translate options in a select element
function translateSelectOptions(selectElement, translations) {
    selectElement.querySelectorAll('option').forEach(option => {
        const translationKey = `${selectElement.id}${capitalize(option.value)}`;
        if (translations[translationKey]) {
            option.textContent = translations[translationKey];
        }
    });
}

// Function to translate all children of an element
function translateChildren(parent, translations) {
    parent.childNodes.forEach(child => {
        if (child.nodeType === Node.ELEMENT_NODE) {
            const translationKey = child.getAttribute('translate');
            if (translationKey) {
                translateElement(child, translationKey, translations);
            }
            translateChildren(child, translations);
        }
    });
}

// Function to observe and translate dynamically added elements
function observeDOMChanges(translations) {
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        translateChildren(node, translations);
                    }
                });
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
}

// Function to get the browser language
function getBrowserLanguage() {
    const supportedLanguages = languages.map(lang => lang.value);
    const browserLanguage = navigator.language.slice(0, 2);
    return supportedLanguages.includes(browserLanguage) ? browserLanguage : 'en';
}

// Function to initialize language
async function initLanguage() {
    const savedLanguage = currentUser?.settings?.language || null;
    const defaultLanguage = 'en';
    const browserLanguage = getBrowserLanguage();
    const languageToUse = savedLanguage || browserLanguage || defaultLanguage;

    await loadLanguage(languageToUse);
}

// Function to reset the language to the browser's default
async function resetLangDefault() {
    const browserLanguage = getBrowserLanguage();
    await loadLanguage(browserLanguage);
}

// Function to add a language change listener
function langListener() {
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.addEventListener('change', async function () {
            const selectedLanguage = this.value;
            await loadLanguage(selectedLanguage);
        });
    }
}

export { initLanguage, langListener, getTranslation, resetLangDefault };