// model/init.js
import StorageWrapper from './storage/storagewrapper.js';
import StorageUser from './storage/storageuser.js';
import StorageTask from './storage/storagetask.js';
import { addTaskStatsVainilla, destroyTaskStatsVainilla, storageResetStatsVainilla, updateStatsUserTask } from './data/datasync.js';

let storageTodoRecall = new StorageWrapper();
let userManager = new StorageUser(storageTodoRecall);
let taskManager = new StorageTask(userManager, storageTodoRecall);

let currentUser;

function initialize() {
    return new Promise(async (resolve, reject) => {
        try {
           await storageTodoRecall.ensureInitializedEncryption(); // encrypted

            await userManager.loadUsers();
            currentUser = await userManager.getCurrentUser();
            //console.log('Current User:', currentUser);

            await taskManager.loadTasks();
            //console.log('TaskManager initialized:', taskManager);

            resolve(userManager);

        } catch (error) {
            console.error('Initialization failed:', error);
            reject(error);
        }
    });
}

export function addTaskStatsUser() {
    addTaskStatsVainilla(userManager);
}

export function destroyTaskStatsUser() {
    destroyTaskStatsVainilla(userManager);
}

export function storageResetStatsUser() {
    storageResetStatsVainilla(userManager);
}

export function updateStatsUser() {
    updateStatsUserTask(userManager, taskManager);
}

export default taskManager;

export { initialize, userManager, currentUser };