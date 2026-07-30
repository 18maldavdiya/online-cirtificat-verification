// ======================================
// Search User (server-side, debounced)
// ======================================

let userSearchDebounce = null;

document.getElementById("searchUser").addEventListener("keyup", function () {

    clearTimeout(userSearchDebounce);
    userSearchDebounce = setTimeout(loadUsers, 300);

});
