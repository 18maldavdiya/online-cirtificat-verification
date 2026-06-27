// ======================================
// AddOrganization.js
// ======================================

const organizationForm = document.getElementById("organizationForm");
const organizationTable = document.getElementById("organizationTable");

let organizationCount = 11;

organizationForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const name = document.getElementById("organizationName").value.trim();
    const email = document.getElementById("organizationEmail").value.trim();
    const phone = document.getElementById("organizationPhone").value.trim();
    const address = document.getElementById("organizationAddress").value.trim();
    const status = document.getElementById("organizationStatus").value;

    if (name === "" || email === "" || phone === "" || address === "") {

        alert("Please fill all fields.");
        return;

    }

    let statusClass = "";

    if (status === "Verified") {

        statusClass = "verified";

    } else if (status === "Pending") {

        statusClass = "pending";

    } else {

        statusClass = "inactive";

    }

    const newRow = document.createElement("tr");

    newRow.innerHTML = `
        <td>ORG${organizationCount}</td>
        <td>${name}</td>
        <td>${email}</td>
        <td>${phone}</td>
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

    organizationTable.appendChild(newRow);

    organizationCount++;

    organizationForm.reset();

    modal.style.display = "none";

    alert("Organization Added Successfully!");

});