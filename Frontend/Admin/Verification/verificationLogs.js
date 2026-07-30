// ======================================
// verificationLogs.js
// Modal close + Live Data Loading
// ======================================

let currentLogs = [];

const viewModal = document.getElementById("viewModal");

const closeView = document.querySelector(".close-view");

closeView.addEventListener("click", function () {

    viewModal.style.display = "none";

});

window.addEventListener("click", function (event) {

    if (event.target === viewModal) {

        viewModal.style.display = "none";

    }

});


// ======================================
// Live Data Loading
// ======================================

function formatLogDate(dateStr) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}-${month}-${d.getFullYear()} ${String(hours).padStart(2, "0")}:${minutes} ${ampm}`;
}

function isWithinDateFilter(dateStr, filter) {
    if (filter === "All Dates") return true;

    const date = new Date(dateStr);
    const now = new Date();

    if (filter === "Today") {
        return date.toDateString() === now.toDateString();
    }
    if (filter === "This Week") {
        const diffDays = (now - date) / (1000 * 60 * 60 * 24);
        return diffDays >= 0 && diffDays <= 7;
    }
    if (filter === "This Month") {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    return true;
}

async function loadLogStats() {
    try {
        const [totalRes, successRes, failedRes] = await Promise.all([
            CV.apiFetch("/verification-logs?limit=1"),
            CV.apiFetch("/verification-logs?result=Success&limit=1"),
            CV.apiFetch("/verification-logs?result=Failed&limit=1"),
        ]);

        document.getElementById("statTotalLogs").textContent = totalRes.total;
        document.getElementById("statSuccessLogs").textContent = successRes.total;
        document.getElementById("statFailedLogs").textContent = failedRes.total;

        // No dedicated "today" endpoint - approximated from the most recent
        // batch of logs already available to the page.
        const recentRes = await CV.apiFetch("/verification-logs?limit=100");
        const today = new Date().toDateString();
        const todayCount = recentRes.logs.filter((log) => new Date(log.createdAt).toDateString() === today).length;
        document.getElementById("statTodayLogs").textContent = todayCount;
    } catch (error) {
        console.error("Failed to load verification log stats", error);
    }
}

async function loadLogs() {
    const tbody = document.getElementById("logsTable");
    tbody.innerHTML = '<tr><td colspan="6">Loading verification logs...</td></tr>';

    const search = document.getElementById("searchLogs").value.trim().toLowerCase();
    const resultFilterValue = document.getElementById("resultFilter").value;
    const dateFilterValue = document.getElementById("dateFilter").value;

    const params = new URLSearchParams({ limit: "100" });
    if (resultFilterValue !== "All Results") params.set("result", resultFilterValue);

    try {
        const data = await CV.apiFetch("/verification-logs?" + params.toString());
        let logs = data.logs;

        logs = logs.filter((log) => isWithinDateFilter(log.createdAt, dateFilterValue));

        if (search) {
            logs = logs.filter((log) => {
                const certificateId = log.certificate ? log.certificate.certificateId : log.attemptedCode || "";
                return (
                    log.id.toLowerCase().includes(search) ||
                    certificateId.toLowerCase().includes(search) ||
                    (log.verifierName || "").toLowerCase().includes(search)
                );
            });
        }

        currentLogs = logs;

        document.getElementById("logsCountLabel").textContent = `Total : ${logs.length} Logs`;

        if (!logs.length) {
            tbody.innerHTML = '<tr><td colspan="6">No verification logs found.</td></tr>';
            return;
        }

        tbody.innerHTML = logs
            .map((log) => {
                const certificateId = log.certificate ? log.certificate.certificateId : log.attemptedCode || "Unknown";
                const statusClass = log.result === "Success" ? "verified" : "pending";
                return `
                    <tr data-id="${log.id}">
                        <td>#${log.id.slice(-8).toUpperCase()}</td>
                        <td>${certificateId}</td>
                        <td>${log.verifierName || "Public User"}</td>
                        <td>${formatLogDate(log.createdAt)}</td>
                        <td><span class="status ${statusClass}">${log.result}</span></td>
                        <td>
                            <button class="view"><i class="fa-solid fa-eye"></i></button>
                        </td>
                    </tr>
                `;
            })
            .join("");
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" style="color:#dc2626;">${error.message || "Failed to load verification logs."}</td></tr>`;
    }
}

loadLogStats();
loadLogs();
