// model/storage/storageuser.js
import UserData from '../data/userdata.js';
import { generateUserId } from '../extension/idgen.js';

export default class StorageUser {
    constructor(storageWrapper) {
        this.storageWrapper = storageWrapper;
        this.currentUser = null;
        this.users = [];
        this.loadUsersFromStorage();
    }

    async createUser(username, password) {
        // Deactivate all users before creating a new one
        this.users.forEach(u => u.active = false);

        // Create a new user
        const userId = generateUserId();
        const newUser = new UserData({
            id: userId,
            username,
            password,
            active: true,  // Mark this new user as active
        });

        // Add it to the list of users
        this.users.push(newUser);

        // Set as currentUser
        this.currentUser = newUser;

        // Save updated users
        await this.saveUsers();

        return userId;
    }

    async createDefaultUser() {
        const defaultUser = this.users.find(user => user.id === 'user-0000');

        // If a default user already exists, set it as current and active
        if (defaultUser) {
            this.users.forEach(u => u.active = false); // Deactivate all
            this.currentUser = defaultUser;
            this.currentUser.active = true;
            await this.saveUsers();
            return;
        }

        // If not, create a new default user
        const newDefaultUser = new UserData({
            id: 'user-0000',
            username: 'default',
            password: 'default',
            active: true  // This one will be active
        });

        this.users.push(newDefaultUser);
        this.currentUser = newDefaultUser;

        // Save the updated state
        await this.saveUsers();
    }

    async saveUsers() {
        await this.storageWrapper.setItem('users', this.users);
    }

    async assignCurrentUser() {
        const activeUsers = this.users.filter(user => user.active);

        if (activeUsers.length > 1) {
            console.warn('Multiple active users found, deactivating all but one.');
            activeUsers.slice(1).forEach(user => user.active = false);
        }

        const activeUser = activeUsers[0];

        if (activeUser) {
            this.currentUser = activeUser;
        } else {
            await this.createDefaultUser();
            this.currentUser = this.users.find(user => user.id === 'user-0000');
        }

        await this.saveUsers();
    }

    async loadUsersFromStorage() {
        const users = await this.storageWrapper.getItem('users');

        // Verify if the data is valid
        if (!users || !Array.isArray(users)) {
            console.warn('Invalid user data found, creating default user.');
            await this.createDefaultUser();
            return;
        }

        // Convert loaded users to instances of UserData
        this.users = users.map(user => {
            if (user.id && user.username && user.password) {
                return new UserData(user);
            } else {
                console.error('Invalid user data', user);
                return null;
            }
        }).filter(Boolean);

        // Assign the current active user
        await this.assignCurrentUser();
    }

    async loadUsers() {
        try {
            // Load users from storage
            const users = await this.storageWrapper.getItem('users');
            this.users = Array.isArray(users) ? users.map(user => new UserData(user)) : [];

            // Find the user that has active=true
            this.currentUser = this.users.find(user => user.active);

            if (!this.currentUser) {
                // If there is no current user, set the 'default' user as current
                const defaultUser = this.users.find(user => user.id === 'user-0000');
                if (defaultUser) {
                    this.currentUser = defaultUser;
                    this.currentUser.active = true;
                } else {
                    // If the default profile does not exist, create one
                    await this.createDefaultUser();
                }
            }
        } catch (error) {
            console.error('Error loading users:', error);
            await this.createDefaultUser();
        }
    }

    async login(username, password) {
        await this.loadUsersFromStorage();

        const user = this.users.find(user => user.username === username && user.password === password);

        if (user) {
            // Deactivate all users and activate only the matching one
            this.users.forEach(u => u.active = false);
            user.active = true;
            this.currentUser = user;
            await this.saveUsers();
            await this.assignCurrentUser();
            return user.id;
        } else {
            throw new Error('Invalid username or password.');
        }
    }

    async logout() {
        if (!this.currentUser) {
            await this.createDefaultUser();
        }

        // Deactivate the current currentUser
        if (this.currentUser && this.currentUser.id !== 'user-0000') {
            this.currentUser.active = false;
        }

        // Assign the default user
        this.currentUser = this.users.find(user => user.id === 'user-0000');
        if (this.currentUser) {
            this.currentUser.active = true;
        }

        await this.saveUsers();
        await this.assignCurrentUser();
    }

    async getCurrentUser() {
        return this.currentUser;
    }

    getTasksForCurrentUser() {
        if (!this.currentUser) throw new Error('There is no active user.');
        return this.currentUser.tasks.map(taskId => this.findTaskById(this.tasks, taskId));
    }

    async deleteCurrentUser() {
        if (!this.currentUser) {
            throw new Error('There is no active user.');
        }

        if (this.currentUser.id === 'user-0000') {
            throw new Error('The default user cannot be deleted.');
        }

        // Delete the current user
        this.users = this.users.filter(user => user.id !== this.currentUser.id);

        // Assign the default user or create one if it doesn't exist
        const defaultUser = this.users.find(user => user.id === 'user-0000');
        if (defaultUser) {
            this.currentUser = defaultUser;
        } else {
            await this.createDefaultUser();
        }

        await this.saveUsers();
    }

    async deleteAllUsers() {
        this.users = [];
        await this.createDefaultUser();
        await this.saveUsers();
    }

    async updateMenuColor(color) {
        if (!this.currentUser) throw new Error('There is no active user.');

        this.currentUser.updateSettings({ color });
        await this.saveUsers();
    }

    async updateUserLanguage(language) {
        if (!this.currentUser) throw new Error('There is no active user.');

        this.currentUser.updateSettings({ language });
        await this.saveUsers();
    }
}
