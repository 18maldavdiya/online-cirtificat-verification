// ======================================
// EditUser.js
// Edit Existing User
// ======================================

document.getElementById("userTable").addEventListener("click", function (event) {

    if (event.target.closest(".edit")) {

        const row = event.target.closest("tr");
        const id = row.dataset.id;
        const user = currentUsers.find((u) => u.id === id);

        if (!user) {
            return;
        }

        editingUserId = id;

        document.getElementById("name").value = user.name;

        document.getElementById("email").value = user.email;

        document.getElementById("password").value = "";
        document.getElementById("password").required = false;
        document.getElementById("password").placeholder = "Leave blank to keep current password";

        document.getElementById("role").value = ROLE_API_TO_DISPLAY[user.role] || "Student";

        document.getElementById("status").value = user.status;

        document.getElementById("modalTitle").innerText = "Edit User";

        modal.style.display = "flex";

    }

});
