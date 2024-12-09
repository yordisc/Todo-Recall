// model/encrypt/encrypt.js

let browser = chrome || browser;
let ENCRYPTION_KEY = null;
const IV_LENGTH = 12;

// Function to generate a 256-bit (32 bytes) encryption key
async function generateEncryptionKey() {
    return crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// Function to export the key to a storable format (base64)
async function exportKey(key) {
    const exportedKey = await crypto.subtle.exportKey("raw", key);
    return toBase64(exportedKey);
}

// Function to import the key from a stored format (base64)
async function importKey(base64Key) {
    const rawKey = fromBase64(base64Key);
    return crypto.subtle.importKey(
        "raw",
        rawKey,
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
    );
}

// Safe functions to convert ArrayBuffer <-> Base64
function toBase64(arrayBuffer) {
    return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
}

function fromBase64(base64String) {
    return new Uint8Array(atob(base64String).split("").map(c => c.charCodeAt(0)));
}

// Function to encrypt text
async function encrypt(text) {
    if (!ENCRYPTION_KEY) {
        throw new Error('Encryption key is not initialized');
    }
    const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
    const encoder = new TextEncoder();
    const encryptedContent = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        ENCRYPTION_KEY,
        encoder.encode(text)
    );

    const ivBase64 = toBase64(iv);
    const encryptedBase64 = toBase64(encryptedContent);

    return `${ivBase64}:${encryptedBase64}`;
}

// Function to decrypt text
async function decrypt(encryptedText) {
    if (!ENCRYPTION_KEY) {
        throw new Error('Encryption key is not initialized');
    }

    if (!encryptedText || typeof encryptedText !== 'string') {
        throw new Error('Invalid encrypted text');
    }

    const parts = encryptedText.split(':');
    if (parts.length !== 2) {
        throw new Error('Invalid encrypted text format');
    }

    const iv = fromBase64(parts[0]);
    const encryptedContent = fromBase64(parts[1]);

    try {
        const decryptedContent = await crypto.subtle.decrypt(
            { name: "AES-GCM", iv: iv },
            ENCRYPTION_KEY,
            encryptedContent
        );
        const decoder = new TextDecoder();
        return decoder.decode(decryptedContent);
    } catch (error) {
        console.error('Decryption failed:', error);
        throw new Error('Failed to decrypt the message');
    }
}

// Creating and saving the encryption key
async function createdAndSaveKey() {
    const key = await generateEncryptionKey();
    const keyBase64 = await exportKey(key);
    await new Promise((resolve) => {
        const storage = chrome.storage || browser.storage;
        storage.local.set({ encryptionKey: keyBase64 }, () => resolve());
    });
    console.log('Encryption key created and saved successfully');
    await loadEncryptionKey();
}

// Load the stored encryption key
export async function loadEncryptionKey() {
    try {
        const result = await new Promise((resolve) => {
            const storage = chrome.storage || browser.storage;
            storage.local.get(['encryptionKey'], (items) => resolve(items));
        });
        if (result.encryptionKey) {
            ENCRYPTION_KEY = await importKey(result.encryptionKey);
            console.log('Encryption key loaded successfully');
        } else {
            console.log('Encryption key not found, creating a new one...');
            await createdAndSaveKey();
        }
    } catch (error) {
        console.error('Error loading encryption key:', error);
    }
}

// Function to encrypt and store data
export async function SetEncrypt(key, value) {
    try {
        const stringValue = JSON.stringify(value);
        const encryptedValue = await encrypt(stringValue);
        return encryptedValue;
    } catch (error) {
        console.error(`Error encrypting value for key ${key}:`, error);
        throw error;
    }
}

// Function to retrieve and decrypt stored data
export async function GetEncrypt(key, value) {
    try {
        const decryptedValue = await decrypt(value);
        console.log(`Decrypted value for key ${key}:`, decryptedValue);
        try {
            return JSON.parse(decryptedValue);
        } catch (jsonError) {
            console.warn('Value is not a valid JSON, returning raw decrypted value:', decryptedValue);
            return decryptedValue;
        }
    } catch (error) {
        console.error(`Error decrypting or parsing value for key ${key}:`, error);
        return null;
    }
}