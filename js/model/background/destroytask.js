// model/background/destroytask.js

import taskManager, { userManager } from '../init.js';

export async function destroyTask(task) {
    try {
        await taskManager.deleteTask(task.id);

        let currentUser = await userManager.getCurrentUser();
        console.log('Retrieved current user:', currentUser);
        if (currentUser) {
            currentUser.destroyTaskStats();
        }

        console.log(`Task ${task.id} destroyed and user's destroyedTasks count updated.`);
    } catch (error) {
        console.error('Error destroying task:', error);
    }
}