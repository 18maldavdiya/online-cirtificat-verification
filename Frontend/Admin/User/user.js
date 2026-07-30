// ======================================
// user.js
// Handles Modal Open & Close + Live Data Loading
// ======================================

const ROLE_DISPLAY_TO_API = { Student: "user", Organization: "organization", Admin: "admin" };
const ROLE_API_TO_DISPLAY = { user: "Student", organization: "Organization", admin: "Admin" };

let currentUsers = [];
let editingUserId = null;

// Select Modal Elements

const modal = document.getElementById("userModal");

const addBtn = document.querySelector(".add-user");

const closeBtn = document.querySelector(".close");

const cancelBtn = document.querySelector(".cancel-btn");


// Open Modal

addBtn.addEventListener("click", function(){

    editingUserId = null;
    document.getElementById("userForm").reset();
    document.getElementById("password").required = true;
    document.getElementById("password").placeholder = "Enter Password";
    document.getElementById("modalTitle").innerText = "Add New User";

    modal.style.display = "flex";

});


// Close Modal

function closeModal(){

    modal.style.display = "none";

    document.getElementById("userForm").reset();

    document.getElementById("modalTitle").innerText = "Add New User";

    editingUserId = null;

}


// X Button

closeBtn.addEventListener("click", function(){

    closeModal();

});


// Cancel Button

cancelBtn.addEventListener("click", function(){

    closeModal();

});


// Click Outside Modal

window.addEventListener("click", function(event){

    if(event.target === modal){

        closeModal();

    }

});


// ======================================
// Live Data Loading
// ======================================

async function loadUserStats() {
    try {
        const [totalRes, studentRes, orgRes, adminRes] = await Promise.all([
            CV.apiFetch("/users?limit=1"),
            CV.apiFetch("/users?role=user&limit=1"),
            CV.apiFetch("/users?role=organization&limit=1"),
            CV.apiFetch("/users?role=admin&limit=1"),
        ]);

        document.getElementById("statTotalUsers").textContent = totalRes.total;
        document.getElementById("statTotalStudents").textContent = studentRes.total;
        document.getElementById("statTotalOrganizations").textContent = orgRes.total;
        document.getElementById("statTotalAdmins").textContent = adminRes.total;
    } catch (error) {
        console.error("Failed to load user stats", error);
    }
}

async function loadUsers() {
    const tbody = document.getElementById("userTable");
    tbody.innerHTML = '<tr><td colspan="6">Loading users...</td></tr>';

    const search = document.getElementById("searchUser").value.trim();
    const roleDisplay = document.getElementById("roleFilter").value;
    const statusDisplay = document.getElementById("statusFilter").value;

    const params = new URLSearchParams({ limit: "100" });
    if (search) params.set("search", search);
    if (roleDisplay !== "All Roles") params.set("role", ROLE_DISPLAY_TO_API[roleDisplay]);
    if (statusDisplay !== "All Status") params.set("status", statusDisplay);

    try {
        const data = await CV.apiFetch("/users?" + params.toString());
        currentUsers = data.users;

        document.getElementById("userCountLabel").textContent = `Total : ${data.total} Users`;

        if (!currentUsers.length) {
            tbody.innerHTML = '<tr><td colspan="6">No users found.</td></tr>';
            return;
        }

        tbody.innerHTML = currentUsers
            .map(
                (user) => `
                    <tr data-id="${CV.escapeHtml(user.id)}">
                        <td>#${CV.escapeHtml(user.id.slice(-8).toUpperCase())}</td>
                        <td>${CV.escapeHtml(user.name)}</td>
                        <td>${CV.escapeHtml(user.email)}</td>
                        <td>${CV.escapeHtml(ROLE_API_TO_DISPLAY[user.role] || user.role)}</td>
                        <td><span class="status ${CV.escapeHtml(user.status.toLowerCase())}">${CV.escapeHtml(user.status)}</span></td>
                        <td>
                            <button class="view"><i class="fa-solid fa-eye"></i></button>
                            <button class="edit"><i class="fa-solid fa-pen"></i></button>
                            <button class="delete"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `
            )
            .join("");
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" style="color:#dc2626;">${CV.escapeHtml(error.message || "Failed to load users.")}</td></tr>`;
    }
}

loadUserStats();
loadUsers();
