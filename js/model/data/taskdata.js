// model/data/taskdata.js
import { generateTaskId } from '../extension/idgen.js';

export default class TaskData {
    constructor({
        iduser = '',
        id = generateTaskId(),
        title = '',
        description = '',
        url = '',
        action = 'none',
        timer = '',
        pomodoro = false,
        color = 'default',
        password = '',
        archived = false,
        trashed = false,
        destroy = false
    } = {}) {
        Object.assign(this, { id, iduser, title, description, url, action, timer, pomodoro, color, password, archived, trashed, destroy });
    }

    updateDetails(details) {
        Object.assign(this, details);
    }

    toJSON() {
        return { ...this };
    }
}
