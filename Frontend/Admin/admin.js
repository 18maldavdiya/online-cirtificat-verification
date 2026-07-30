// ===============================
// Current User
// ===============================

// The auth guard itself already ran in <head> (before this page's body even
// rendered) via CV.requireAuth - by the time this script runs we're already
// confirmed to be an authenticated admin, so this is just a data read.
const currentAdminUser = CV.getUser();

// admin.js is shared by every Admin page at every nesting depth (Admin/,
// Admin/Certificate/, Admin/User/, ...), so the relative path back to Login
// is computed from the current URL rather than hardcoded.
function getLoginPath() {
    const marker = "/Admin/";
    const path = window.location.pathname;
    const idx = path.indexOf(marker);
    if (idx === -1) {
        return "../Login/Login.html";
    }
    const afterAdmin = path.slice(idx + marker.length);
    const depth = afterAdmin.split("/").length - 1;
    return "../".repeat(depth + 1) + "Login/Login.html";
}

const LOGIN_PATH = getLoginPath();

if (currentAdminUser) {
    const profileNameEl = document.querySelector(".admin-profile span");
    if (profileNameEl) {
        profileNameEl.textContent = currentAdminUser.name;
    }
}

// ===============================
// Active Sidebar Menu
// ===============================

const menuItems = document.querySelectorAll(".sidebar ul li");

menuItems.forEach((item)=>{

    item.addEventListener("click",()=>{

        menuItems.forEach((menu)=>{

            menu.classList.remove("active");

        });

        item.classList.add("active");

    });

});


// ===============================
// Logout
// ===============================

const logout = document.querySelector(".logout-item");

logout.addEventListener("click",(event)=>{

    event.preventDefault();

    const answer = confirm("Are you sure you want to logout?");

    if(answer){

        CV.logout(LOGIN_PATH);

    }

});
