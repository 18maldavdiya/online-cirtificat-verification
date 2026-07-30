// ======================================
// organization.js
// Handles Organization Modal + Live Data Loading
// ======================================

let currentOrganizations = [];
let editingOrganizationId = null;

// Select Elements

const modal = document.getElementById("organizationModal");

const addBtn = document.querySelector(".add-organization");

const closeBtn = document.querySelector(".close");

const cancelBtn = document.querySelector(".cancel-btn");


// Open Modal

addBtn.addEventListener("click", function () {

    editingOrganizationId = null;
    document.getElementById("organizationForm").reset();
    document.getElementById("modalTitle").innerText = "Add Organization";

    modal.style.display = "flex";

});


// Close Function

function closeModal(){

    modal.style.display = "none";

    document.getElementById("organizationForm").reset();

    document.getElementById("modalTitle").innerText = "Add Organization";

    editingOrganizationId = null;

}


// Close Button

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

async function loadOrganizationStats() {
    try {
        const [totalRes, verifiedRes, pendingRes, inactiveRes] = await Promise.all([
            CV.apiFetch("/organizations?limit=1"),
            CV.apiFetch("/organizations?status=Verified&limit=1"),
            CV.apiFetch("/organizations?status=Pending&limit=1"),
            CV.apiFetch("/organizations?status=Inactive&limit=1"),
        ]);

        document.getElementById("statTotalOrganizations").textContent = totalRes.total;
        document.getElementById("statVerifiedOrganizations").textContent = verifiedRes.total;
        document.getElementById("statPendingOrganizations").textContent = pendingRes.total;
        document.getElementById("statInactiveOrganizations").textContent = inactiveRes.total;
    } catch (error) {
        console.error("Failed to load organization stats", error);
    }
}

async function loadOrganizations() {
    const tbody = document.getElementById("organizationTable");
    tbody.innerHTML = '<tr><td colspan="6">Loading organizations...</td></tr>';

    const search = document.getElementById("searchOrganization").value.trim();
    const type = document.getElementById("typeFilter").value;
    const status = document.getElementById("statusFilter").value;

    const params = new URLSearchParams({ limit: "100" });
    if (search) params.set("search", search);
    if (type !== "All Types") params.set("type", type);
    if (status !== "All Status") params.set("status", status);

    try {
        const data = await CV.apiFetch("/organizations?" + params.toString());
        currentOrganizations = data.organizations;

        document.getElementById("organizationCountLabel").textContent = `Total : ${data.total} Organizations`;

        if (!currentOrganizations.length) {
            tbody.innerHTML = '<tr><td colspan="6">No organizations found.</td></tr>';
            return;
        }

        tbody.innerHTML = currentOrganizations
            .map(
                (org) => `
                    <tr data-id="${org.id}">
                        <td>#${org.id.slice(-8).toUpperCase()}</td>
                        <td>${org.name}</td>
                        <td>${org.email}</td>
                        <td>${org.phone}</td>
                        <td><span class="status ${org.status.toLowerCase()}">${org.status}</span></td>
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
        tbody.innerHTML = `<tr><td colspan="6" style="color:#dc2626;">${error.message || "Failed to load organizations."}</td></tr>`;
    }
}

loadOrganizationStats();
loadOrganizations();
