// model/storage/storagewrapper.js
import { checkIfExtensionOrWeb } from '../extension/extOrWeb.js';
import { loadEncryptionKey, SetEncrypt, GetEncrypt } from './encrypt/encrypt.js';

export default class StorageWrapper {
    constructor() {
        const { environment, browserName } = checkIfExtensionOrWeb();
        this.isExtension = environment === 'extension';
        this.isEncryptionInitialized = false;
        this.initializationPromise = null;
        console.log(`Running in ${environment} on ${browserName}`);
    }

    async initializeEncryption() {
        try {
            await loadEncryptionKey();
            this.isEncryptionInitialized = true;
            console.log('Encryption initialized.');
        } catch (error) {
            console.error('Error initializing encryption:', error);
            this.isEncryptionInitialized = false;
        }
    }

    async ensureInitializedEncryption() {
        if (this.isEncryptionInitialized) return;
        if (!this.initializationPromise) {
            this.initializationPromise = this.initializeEncryption();
        }
        await this.initializationPromise;
    }

    // Parse the value to JSON if necessary
    _parseJSON(key, value) {
        try {
            return value ? JSON.parse(value) : null;
        } catch (e) {
            console.log(`Error parsing JSON for key ${key}:`, e);
            return null;
        }
    }

    // Retrieves an item, decrypting it if necessary
    async getItem(key) {
        // Ensure encryption is initialized before proceeding
        await this.initializeEncryption();
    
        const value = await this._getRawItem(key);
    
        if (!value) {
            return null;
        }
    
        // Check if the value is encrypted with the "ENC:" prefix
        if (value.startsWith('ENC:')) {
            // If encrypted, remove the prefix and decrypt
            try {
                const encryptedValue = value.slice(4); // Remove "ENC:"
                const decryptedValue = await GetEncrypt(key, encryptedValue); // Decrypt
                console.log(`Decrypted value for key ${key}:`, decryptedValue);
                return decryptedValue || null; // Return the decrypted value
            } catch (error) {
                console.error(`Error decrypting value for key ${key}:`, error);
                return null;
            }
        }
    
        // If not encrypted, try parsing it as JSON
        try {
            return this._parseJSON(key, value); // Parse as JSON if no "ENC:" prefix
        } catch (error) {
            console.error(`Error parsing JSON for key ${key}:`, error);
            return null;
        }
    }         

    // Retrieves the raw value (JSON or encrypted)
    async _getRawItem(key) {
        if (this.isExtension) {
            return new Promise((resolve) => {
                let storage = chrome.storage || browser.storage;
                storage.local.get([key], (result) => {
                    const value = result[key];
                    resolve(value || null);
                });
            });
        } else {
            const value = localStorage.getItem(key);
            return value || null;
        }
    }

    // Stores an item, encrypting it if necessary
    async setItem(key, value) {
        await this.initializeEncryption();
        const rawValue = JSON.stringify(value);

        if (!this.isEncryptionInitialized) {
            await this._setRawItem(key, rawValue);
            return;
        }

        try {
            const encryptedValue = await SetEncrypt(key, value);
            await this._setRawItem(key, `ENC:${encryptedValue}`);  // Prefix indicating it's encrypted
        } catch (error) {
            console.error(`Error encrypting value for key ${key}:`, error);
            throw error;
        }
    }

    // Stores the raw value (JSON or encrypted)
    async _setRawItem(key, value) {
        if (this.isExtension) {
            return new Promise((resolve) => {
                let storage = chrome.storage || browser.storage;
                let data = {};
                data[key] = value;
                storage.local.set(data, () => resolve());
            });
        } else {
            localStorage.setItem(key, value);
        }
    }

    async removeItem(key) {
        if (this.isExtension) {
            return new Promise((resolve) => {
                let storage = chrome.storage || browser.storage;
                storage.local.remove([key], () => resolve());
            });
        } else {
            localStorage.removeItem(key);
        }
    }

    async clear() {
        if (this.isExtension) {
            return new Promise((resolve) => {
                let storage = chrome.storage || browser.storage;
                storage.local.clear(() => resolve());
            });
        } else {
            localStorage.clear();
        }
    }
}