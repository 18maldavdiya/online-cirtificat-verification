// ======================================
// certificate.js
// Handles Certificate Modal + Live Data Loading
// ======================================

let currentCertificates = [];
let editingCertificateId = null;
let organizationsMap = {};
let organizationsList = [];

const modal = document.getElementById("certificateModal");

const addBtn = document.querySelector(".add-certificate");

const closeBtn = document.querySelector(".close");

const cancelBtn = document.querySelector(".cancel-btn");


// Populates the Organization <select> from live data and keeps an id->name
// lookup map for displaying organization names in the table/view modal
// (the certificates API intentionally returns the raw organization id).
async function loadOrganizationsForForm() {
    try {
        const data = await CV.apiFetch("/organizations?limit=100");
        organizationsList = data.organizations;

        organizationsMap = {};
        organizationsList.forEach((org) => {
            organizationsMap[org.id] = org.name;
        });

        const select = document.getElementById("organizationName");
        const currentValue = select.value;
        select.innerHTML =
            '<option value="">Select Organization</option>' +
            organizationsList.map((org) => `<option value="${org.id}">${org.name}</option>`).join("");
        if (currentValue) {
            select.value = currentValue;
        }
    } catch (error) {
        console.error("Failed to load organizations for form", error);
    }
}

addBtn.addEventListener("click", async function(){

    editingCertificateId = null;
    document.getElementById("certificateForm").reset();
    document.getElementById("modalTitle").innerText = "Issue Certificate";

    await loadOrganizationsForForm();

    modal.style.display = "flex";

});

function closeModal(){

    modal.style.display = "none";

    document.getElementById("certificateForm").reset();

    document.getElementById("modalTitle").innerText = "Issue Certificate";

    editingCertificateId = null;

}

closeBtn.addEventListener("click", closeModal);

cancelBtn.addEventListener("click", closeModal);

window.addEventListener("click", function(event){

    if(event.target === modal){

        closeModal();

    }

});


// ======================================
// Live Data Loading
// ======================================

function formatDateDMY(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}-${d.getFullYear()}`;
}

async function loadCertificateStats() {
    try {
        const [totalRes, verifiedRes, pendingRes, revokedRes] = await Promise.all([
            CV.apiFetch("/certificates?limit=1"),
            CV.apiFetch("/certificates?status=Verified&limit=1"),
            CV.apiFetch("/certificates?status=Pending&limit=1"),
            CV.apiFetch("/certificates?status=Revoked&limit=1"),
        ]);

        document.getElementById("statTotalCertificates").textContent = totalRes.total;
        document.getElementById("statVerifiedCertificates").textContent = verifiedRes.total;
        document.getElementById("statPendingCertificates").textContent = pendingRes.total;
        document.getElementById("statRevokedCertificates").textContent = revokedRes.total;
    } catch (error) {
        console.error("Failed to load certificate stats", error);
    }
}

async function loadCertificates() {
    const tbody = document.getElementById("certificateTable");
    tbody.innerHTML = '<tr><td colspan="7">Loading certificates...</td></tr>';

    const search = document.getElementById("searchCertificate").value.trim();
    const course = document.getElementById("courseFilter").value;
    const status = document.getElementById("statusFilter").value;

    const params = new URLSearchParams({ limit: "100" });
    if (search) params.set("search", search);
    if (status !== "All Status") params.set("status", status);

    try {
        if (!organizationsList.length) {
            await loadOrganizationsForForm();
        }

        const data = await CV.apiFetch("/certificates?" + params.toString());

        // The course filter is applied client-side: course is free text on
        // the backend (not an enum), so there is no dedicated API filter for it.
        let certs = data.certificates;
        if (course !== "All Courses") {
            certs = certs.filter((c) => c.course === course);
        }

        currentCertificates = certs;

        document.getElementById("certificateCountLabel").textContent = `Total : ${certs.length} Certificates`;

        if (!certs.length) {
            tbody.innerHTML = '<tr><td colspan="7">No certificates found.</td></tr>';
            return;
        }

        tbody.innerHTML = certs
            .map((cert) => {
                const orgName = organizationsMap[cert.organization] || "Unknown Organization";
                return `
                    <tr data-id="${cert.id}">
                        <td>${cert.certificateId}</td>
                        <td>${cert.recipientName}</td>
                        <td>${cert.course}</td>
                        <td>${orgName}</td>
                        <td>${formatDateDMY(cert.issueDate)}</td>
                        <td><span class="status ${cert.status.toLowerCase()}">${cert.status}</span></td>
                        <td>
                            <button class="view"><i class="fa-solid fa-eye"></i></button>
                            <button class="edit"><i class="fa-solid fa-pen"></i></button>
                            <button class="delete"><i class="fa-solid fa-trash"></i></button>
                        </td>
                    </tr>
                `;
            })
            .join("");
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="7" style="color:#dc2626;">${error.message || "Failed to load certificates."}</td></tr>`;
    }
}

loadCertificateStats();
loadCertificates();
