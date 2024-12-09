// HTML menu templates (view/taskmenu.js)
const mainMenu = `
<div id="mainMenu" class="view active default">
    <h1 id="mainMenuTitle" class="menu-title" translate="mainMenuTitle">Main Menu</h1>
    <div id="buttonsContainer">
        <button id="searchBtn" translate="searchBtn">🔍</button>
        <button id="archiveBtn" translate="archiveBtn">📂</button>
        <button id="trashBtn" translate="trashBtn">🗑️</button>
        <button id="settingsBtn" translate="settingsBtn">⚙️</button>
    </div>
    <input type="text" id="searchBar" class="hidden" translate="searchBar" placeholder="Search tasks...">
    <div id="Container">
        <div id="taskListContainer">
            <ul id="taskList"></ul>
        </div>
    </div>
    <div id="addTaskContainer">
        <button id="addTaskBtn" translate="addTaskBtn">+</button>
    </div>
</div>
`;

const editMenu = `
<div id="editMenu" class="view default">
    <h1 class="menu-title" translate="editTaskTitle">Edit Task</h1>
    <div>
        <div>
            <input type="text" id="taskTitle" placeholder="Title" translate="titlePlaceholder">
        </div>
        <div>
            <textarea id="taskDesc" placeholder="Description" translate="description"></textarea>
        </div>
        <div>
            <label translate="tabAselectAction" for="tabAction">Select Action:</label>
            <select id="tabAction" translate="selectAction">
                <option value="none" translate="noneAction">Select Action</option>
                <option value="openLink" translate="openLink">Open Link</option>
                <option value="closeTab" translate="closeTab">Close Tab</option>
            </select>
        </div>
    </div>
        <div class="column1">
        <label>
            <input type="checkbox" id="addUrlCheckbox">
            <span translate="addUrl">Add URL</span>
        </label>
        <input type="text" id="taskUrl" class="hidden" placeholder="URL" translate="urlPlaceholder">
        <div id="bookmarkSuggestions" class="suggestions-dropdown"></div>
            <div id="buttonsHorizon">
        <button id="getUrlBtn" class="hidden" translate="getUrlBtn">Get URL from Active Tab</button>
        <button id="clearUrlBtn" class="hidden" translate="trashBtn">🗑️</button>
            </div>
    <label>
        <input type="checkbox" id="addTimer">
        <span translate="addTimer">Add Timer</span>
    </label>
    <div id="timerOptions" class="hidden">
        <div class="column1">
          <label>
            <input type="checkbox" id="singleTimer" translate="singleTimer">
            <span translate="singleTimer">Single Timer</span>
          </label>
          <label>
            <input type="checkbox" id="dailyTimer" translate="dailyTimer">
            <span translate="dailyTimer">Constant Timer - Daily</span>
           </label>
        </div>
        <div>
            <input type="text" translate="timerPlaceholder" id="timerInput" class="hidden" placeholder="Timer">
        </div>
        <div>
           <div id="destruction" class="hidden">
           <input type="checkbox" id="selfDestruction">
           <span translate="selfDestruction">Self destruction</span>
          </div>
          <div id="pomodoro" class="hidden">
          <input type="checkbox" id="pomodorocheck" translate="pomodoro">
          <span translate="pomodoro">Pomodoro</span>
          </div>
        </div>
    </div>
    <div>
        <label>
            <input type="checkbox" id="addPasswordCheckbox">
            <span translate="addPassword">Add Password</span>
        </label>
        <input type="password" id="taskPassword" class="hidden" placeholder="Password" translate="taskPassword">
    </div>
    </div>
    <div>
        <label for="taskColor" translate="taskColorLabel">Task Color:</label>
        <select id="taskColor" translate="taskColor">
        </select>
    </div>
    <div id="buttonsContainer">
        <button id="backedit" translate="backBtn">Back</button>
        <button id="saveBtn" translate="saveBtn">Save</button>
    </div>
</div>
`;

const optionsMenu = `
<div id="optionsMenu" class="view default">
    <h1 class="menu-title" translate="optionsTitle">Options</h1>
    <label for="menuColor" translate="menuColorLabel">Menu Color:</label>
    <select id="menuColor" translate="menuColor">
    </select>
    <label for="languageSelect" translate="languageSelect">Select Language:</label>
    <select id="languageSelect" translate="languageSelect">
    </select>
    <div id="buttonsContainer">
        <button id="profileUserBtn" translate="profileUser"> profile </button>
    </div>
    <div id="buttonsContainer">
        <button id="importCsvBtn" translate="importCsvBtn">Import CSV</button>
        <button id="exportCsvBtn" translate="exportCsvBtn">Export CSV</button>
    </div>
    <div id="buttonsContainer">
        <button id="backoption" translate="backBtn">Back</button>
    </div>
    <div style="text-align: center;">
        <a href="https://www.linkedin.com/in/yordiscujar/" target="_blank"><strong><em>Yordis E. Cujar M.</em></strong></a> for 
        <a href="https://cs50.harvard.edu/x/2024/" target="_blank"><strong><em>CS50x-2024</em></strong></a>.
    </div>

</div>
`;

const archiveMenu = `
    <div id="archiveMenu" class="view default">
        <h1 class="menu-title" translate="archiveTitle">Archived Tasks</h1>
        <div id="Container">
            <div id="archivedTasksContainer">
                <ul id="archivedTasks"></ul>
            </div>
        </div>
        <div id="buttonsContainer">
            <button id="backarchive" translate="backBtn">Back</button>
        </div>
    </div>
`;

const trashMenu = `
    <div id="trashMenu" class="view default">
        <h1 class="menu-title" translate="trashTitle">Trash</h1>
        <div id="trashTasksContainer">
            <ul id="trashTasks"></ul>
        </div>
        <div id="buttonsContainer">
            <button id="restoreAllBtn" translate="restoreAllBtn">Restore All</button>
            <button id="deleteAllBtn" translate="deleteAllBtn">Delete All</button>
        </div>
        <div id="Container">
            <div id="buttonsContainer">
                <button translate="backBtn" id="backtrash" >Back</button>
            </div>
        </div>
    </div>
`;

const viewTaskMenu = `
    <div id="viewTaskMenu" class="view default">
        <h1 class="menu-title" translate="viewTaskTitle">View Task</h1>
        <div id="viewTaskContent"></div>
        <button id="backview" translate="backBtn">Back</button>
    </div>
`;

const passwordMenu = `
    <div id="passwordMenu" class="view default">
        <h1 class="menu-title" translate="passwordProtectedTaskTitle">Password Protected Task</h1>
        <input type="password" id="inputPassword" placeholder="Enter Password" translate="inputPassword">
        <div>
            <button id="togglePasswordBtn" translate="togglePasswordBtn">Show/Hide Password</button>
            <button id="confirmPasswordBtn" translate="confirmPasswordBtn">Confirm</button>
        </div>
        <div>
            <button id="backpassword" translate="backBtn">Back</button>
        </div>
    </div>
`;

export { mainMenu, editMenu, optionsMenu, archiveMenu, trashMenu, viewTaskMenu, passwordMenu };