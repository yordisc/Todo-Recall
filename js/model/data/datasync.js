// model/data/datasync.js

export async function addTaskStatsVainilla(storageUser) {

    const currentUser = await storageUser.getCurrentUser();
    if (!currentUser) {
        console.error('Error: currentUser is not initialized');
        return;
    }

    currentUser.stats.createdTasks++;
    await storageUser.saveUsers();
}
export async function destroyTaskStatsVainilla(storageUser) {

    const currentUser = await storageUser.getCurrentUser();
    if (!currentUser) {
        console.error('Error: currentUser is not initialized');
        return;
    }
    currentUser.stats.destroyedTasks++;
    await storageUser.saveUsers();
}

export async function updateStatsUserTask(storageUser, storageTask) {
    if (!storageTask || !storageUser) {
        console.error('Error: storageTask or storageUser is not initialized');
        return;
    }

    const currentUser = await storageUser.getCurrentUser();
    if (!currentUser) {
        console.error('Error: currentUser is not initialized');
        return;
    }

    try {
        // Get all tasks
        const { tasks = [], archivedTasks = [], trashTasks = [] } = await storageTask.getAllTasks() || {};

        // Reset counters
        currentUser.stats.currentTasks = { active: 0, trash: 0, archived: 0 };
        currentUser.stats.tasksWithAlarms = 0;
        currentUser.stats.tasks = [];

        // Function to update task stats
        const updateTaskStats = (taskList, status) => {
            taskList.forEach(task => {
                if (task.iduser === currentUser.id) {
                    currentUser.stats.currentTasks[status]++;
                    if (task.timer && !task.trashed && !task.archived) currentUser.stats.tasksWithAlarms++;
                    currentUser.stats.tasks.push(task.id);
                }
            });
        };

        // Update stats for each task type
        updateTaskStats(tasks, 'active');
        updateTaskStats(archivedTasks, 'archived');
        updateTaskStats(trashTasks, 'trash');

        // Update created tasks count
        //currentUser.stats.createdTasks = currentUser.stats.tasks.length;

        // Save changes
        await storageUser.saveUsers();
    } catch (error) {
        console.error('Error updating user task stats:', error);
    }
}

export async function storageResetStatsVainilla(storageUser) {

    const currentUser = await storageUser.getCurrentUser();
    if (!currentUser) {
        console.error('Error: currentUser is not initialized');
        return;
    }

    currentUser.stats.tasks = [];
    currentUser.stats.createdTasks = 0;
    currentUser.stats.destroyedTasks = 0;
    currentUser.stats.tasksWithAlarms = 0;
    currentUser.stats.currentTasks.active = 0;
    currentUser.stats.currentTasks.archived = 0;
    currentUser.stats.currentTasks.trash = 0;

    await storageUser.saveUsers();
}