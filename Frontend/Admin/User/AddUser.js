// ======================================
// AddUser.js
// Add New User
// ======================================

const userForm = document.getElementById("userForm");
const userTable = document.getElementById("userTable");

let userCount = 11;

// Form Submit

userForm.addEventListener("submit", function (event) {

    event.preventDefault();

    // Get Form Data

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();

    const role = document.getElementById("role").value;

    const status = document.getElementById("status").value;


    // Validation

    if (name === "" || email === "" || password === "") {

        alert("Please fill all fields.");

        return;

    }


    // Status Class

    let statusClass = "";

    if (status === "Active") {

        statusClass = "active";

    }

    else if (status === "Inactive") {

        statusClass = "inactive";

    }

    else {

        statusClass = "pending";

    }


    // Create Row

    const newRow = document.createElement("tr");

    newRow.innerHTML = `

        <td>U${userCount}</td>

        <td>${name}</td>

        <td>${email}</td>

        <td>${role}</td>

        <td>

            <span class="status ${statusClass}">

                ${status}

            </span>

        </td>

        <td>

            <button class="view">

                <i class="fa-solid fa-eye"></i>

            </button>

            <button class="edit">

                <i class="fa-solid fa-pen"></i>

            </button>

            <button class="delete">

                <i class="fa-solid fa-trash"></i>

            </button>

        </td>

    `;


    // Add Row

    // Add or Update User

    if (editRow === null) {

        userTable.appendChild(newRow);

        userCount++;

    }
    else {

        editRow.cells[1].innerText = name;

        editRow.cells[2].innerText = email;

        editRow.cells[3].innerText = role;

        editRow.cells[4].innerHTML =

            `<span class="status ${statusClass}">
            ${status}
        </span>`;

        editRow = null;

    }


    userForm.reset();

    document.getElementById("modalTitle").innerText = "Add New User";

    modal.style.display = "none";

    alert("User Saved Successfully!");

});