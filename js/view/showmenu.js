// view/showmenu.js
import { mainMenu, editMenu, optionsMenu, archiveMenu, trashMenu, viewTaskMenu, passwordMenu } from "./taskmenu.js";
import { registerUserMenu, loginUserMenu, profileUserMenu, passwordUserMenu } from "./usermenu.js";
import { buttonUserProfile } from '../controller/userprofile.js';

const app = document.getElementById('app');
app.innerHTML = `
${mainMenu}
${editMenu}
${optionsMenu}
${archiveMenu}
${trashMenu}
${viewTaskMenu}
${passwordMenu}
${passwordUserMenu}
${registerUserMenu}
${loginUserMenu}
${profileUserMenu}
`;

// Show menu by ID
function showMenu(menuId) {

    buttonUserProfile();

    console.log('Showing menu:', menuId);
    document.querySelectorAll('.view').forEach(menu => menu.classList.remove('active'));

    const menuToShow = document.getElementById(menuId);
    if (menuToShow) {
        menuToShow.classList.add('active');
    } else {
        console.error('Menu not found:', menuId);
    }
}

export { showMenu };
