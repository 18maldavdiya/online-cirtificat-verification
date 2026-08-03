// ======================================
// reports.js
// ======================================

const reportModal = document.getElementById("reportModal");

const reportCloseIcon = document.querySelector(".close-view");

const reportCloseBtn = document.querySelector(".close-report");

reportCloseIcon.addEventListener("click", function () {

    reportModal.style.display = "none";

});

reportCloseBtn.addEventListener("click", function () {

    reportModal.style.display = "none";

});

window.addEventListener("click", function (event) {

    if (event.target === reportModal) {

        reportModal.style.display = "none";

    }

});

// ======================================
// Live report data
// ======================================
// There is no dedicated "Report" model/endpoint in the backend. Each row
// below is a real system event (certificate issued, organization
// registered, user registered, verification attempt) assembled from the
// existing certificates/organizations/users/verification-logs endpoints,
// reusing the same table structure the static markup used to have - so
// SearchReport.js / FilterReport.js / ViewReport.js keep working unchanged.

function formatReportDate(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}-${d.getFullYear()}`;
}

async function loadReports() {
    const tbody = document.getElementById("reportsTable");

    try {
        const [certRes, orgRes, userRes, logRes] = await Promise.all([
            CV.apiFetch("/certificates?limit=100"),
            CV.apiFetch("/organizations?limit=100"),
            CV.apiFetch("/users?role=user&limit=100"),
            CV.apiFetch("/verification-logs?limit=100"),
        ]);

        const orgNameById = {};
        orgRes.organizations.forEach((org) => {
            orgNameById[org.id] = org.name;
        });

        const events = [];

        certRes.certificates.forEach((cert) => {
            events.push({
                category: "Certificate",
                name: `Certificate Issued: ${cert.course}`,
                generatedBy: orgNameById[cert.organization] || "Organization",
                date: cert.createdAt,
            });
        });

        orgRes.organizations.forEach((org) => {
            events.push({
                category: "Organization",
                name: `Organization Registered: ${org.name}`,
                generatedBy: "Admin",
                date: org.createdAt,
            });
        });

        userRes.users.forEach((user) => {
            events.push({
                category: "User",
                name: `User Registered: ${user.name}`,
                generatedBy: "Admin",
                date: user.createdAt,
            });
        });

        (logRes.logs || []).forEach((log) => {
            const label = log.certificate ? log.certificate.certificateId : log.attemptedCode || "Unknown";
            events.push({
                category: "System",
                name: `Verification ${log.result}: ${label}`,
                generatedBy: "System",
                date: log.createdAt,
            });
        });

        events.sort((a, b) => new Date(b.date) - new Date(a.date));

        document.getElementById("statTotalReports").textContent = events.length;
        document.getElementById("statCertificateReports").textContent = certRes.total;
        document.getElementById("statOrganizationReports").textContent = orgRes.total;
        document.getElementById("statUserReports").textContent = userRes.total;
        document.getElementById("reportsTotalLabel").textContent = `Total : ${events.length} Reports`;

        if (!events.length) {
            tbody.innerHTML = '<tr><td colspan="6">No reports available yet.</td></tr>';
            return;
        }

        tbody.innerHTML = events
            .map((event, index) => {
                const reportId = "REP" + String(index + 1).padStart(3, "0");
                return `
                    <tr>
                        <td>${CV.escapeHtml(reportId)}</td>
                        <td>${CV.escapeHtml(event.name)}</td>
                        <td>${CV.escapeHtml(event.category)}</td>
                        <td>${CV.escapeHtml(event.generatedBy)}</td>
                        <td>${formatReportDate(event.date)}</td>
                        <td><button class="view"><i class="fa-solid fa-eye"></i></button></td>
                    </tr>
                `;
            })
            .join("");
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" style="color:#dc2626;">${CV.escapeHtml(error.message || "Failed to load reports.")}</td></tr>`;
    }
}

loadReports();