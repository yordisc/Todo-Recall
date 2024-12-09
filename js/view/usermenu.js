// HTML menu users templates (view/usermenu.js)

const registerUserMenu = `
<div id="registerUserMenu" class="view default">
    <h1 class="menu-title" translate="registerTitle">Register</h1>
    <div>
        <label for="registerUsername" translate="username">Username:</label>
        <input type="text" id="registerUsername" placeholder="Username" translate="usernamePlaceholder">
    </div>
    <div>
        <label for="registerPassword" translate="password">Password:</label>
        <input type="password" id="registerPassword" placeholder="Password" translate="passwordPlaceholder">
    </div>
    <div>
        <label for="registerPasswordConfirm" translate="confirmPassword">Confirm Password:</label>
        <input type="password" id="registerPasswordConfirm" placeholder="Confirm Password" translate="confirmPasswordPlaceholder">
    </div>
    <div id="buttonsContainer">
        <button id="backRegisterBtn" translate="backBtn">Back</button>
        <button id="registerBtn" translate="registerBtn">Register</button>
    </div>
</div>
`;

const loginUserMenu = `
<div id="loginUserMenu" class="view default">
    <h1 class="menu-title" translate="login">Login</h1>
    <div>
        <label for="loginUser" translate="username">Username:</label>
        <input type="text" id="loginUserInput" placeholder="Username" translate="usernamePlaceholder">
    </div>
    <div>
        <label for="loginPassword" translate="password">Password:</label>
        <input type="password" id="loginPasswordInput" placeholder="Password" translate="passwordPlaceholder">
    </div>
    <div id="buttonsContainer">
        <button id="backLoginBtn" translate="backBtn">Back</button>
        <button id="loginBtn" translate="login">Login</button>
    </div>
</div>
`;

const profileUserMenu = `
<div id="profileUserMenu" class="view default">
    <h1 class="menu-title" translate="profileTitle">User Profile</h1>
    <div>
        <div id="createdTasksContainer"></div>
        <div id="tasksWithAlarmContainer"></div>
        <div id="lastActivatedAlarmContainer"></div>
        <div id="selfDestroyedTasksContainer"></div>

    <div id="currentTasksContainer">
        <label translate="currentTasks">Current Tasks:</label>
        <div id="currentTasksContainer"></div>
    </div>
        <div id="buttonsContainer">
            <div id="buttonsContainerUserSession"></div>
        </div>
        <div id="buttonsContainer">
            <button id="backProfileBtn" translate="backBtn">Back</button>
            <button id="resetDefaultBtn" translate="resetDefaultBtn">Reset to Default</button>
    </div>
</div>
`;

const passwordUserMenu = `
    <div id="passwordUserMenu" class="view default">
        <h1 class="menu-title" translate="passwordProtectedTaskTitle">Password Protected Task</h1>
        <input type="password" id="inputPasswordUser" placeholder="Enter Password" translate="inputPassword">
        <div id="buttonsContainer">
            <button id="confirmPassworUserdBtn" translate="confirmPasswordBtn">Confirm</button>
        </div>
        <div id="buttonsContainer">
            <button id="backUserPassword" translate="backBtn">Back</button>
        </div>
    </div>
`;

export { registerUserMenu, loginUserMenu, passwordUserMenu, profileUserMenu };