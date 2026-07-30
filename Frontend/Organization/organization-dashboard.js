const currentOrgUser = CV.requireAuth(["organization"], "../Login/Login.html");

let myOrganization = null;
let currentOrgCertificates = [];

function formatDateDMY(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return "";
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    return `${day}-${month}-${d.getFullYear()}`;
}

function timeAgo(dateStr) {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return diffMin + (diffMin === 1 ? " min ago" : " mins ago");
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return diffHour + (diffHour === 1 ? " hour ago" : " hours ago");
    const diffDay = Math.floor(diffHour / 24);
    return diffDay + (diffDay === 1 ? " day ago" : " days ago");
}

async function loadMyOrganization() {
    if (myOrganization) return myOrganization;
    try {
        const data = await CV.apiFetch("/organizations?limit=1");
        myOrganization = data.organizations[0] || null;
    } catch (error) {
        console.error("Failed to load organization profile", error);
    }
    return myOrganization;
}

document.addEventListener('DOMContentLoaded', async function () {

    const profileNameEl = document.querySelector(".admin-profile span");
    if (profileNameEl && currentOrgUser) {
        profileNameEl.textContent = currentOrgUser.name;
    }

    const dashboardBody = document.getElementById('dashboardTableBody');
    const certificateBody = document.getElementById('certificateTableBody');
    const verificationBody = document.getElementById('verificationTableBody');
    const issueForm = document.getElementById('issueCertificateForm');
    const profileOrgName = document.getElementById('profileOrgName');
    const settingsForm = document.getElementById('orgSettingsForm');

    // ================= DASHBOARD =================
    if (dashboardBody) {
        dashboardBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

        try {
            const [totalRes, verifiedRes, pendingRes, recentRes, logsRes] = await Promise.all([
                CV.apiFetch("/certificates?limit=1"),
                CV.apiFetch("/certificates?status=Verified&limit=1"),
                CV.apiFetch("/certificates?status=Pending&limit=1"),
                CV.apiFetch("/certificates?limit=100"),
                CV.apiFetch("/verification-logs?limit=5").catch(() => ({ logs: [] })),
            ]);

            document.getElementById("statTotalCertificates").textContent = totalRes.total;
            document.getElementById("statVerifiedCertificates").textContent = verifiedRes.total;
            document.getElementById("statPendingCertificates").textContent = pendingRes.total;

            const now = Date.now();
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;
            const expiringSoon = recentRes.certificates.filter((c) => {
                if (!c.expiryDate) return false;
                const expiry = new Date(c.expiryDate).getTime();
                return expiry > now && expiry - now <= thirtyDays;
            }).length;
            document.getElementById("statExpiringSoon").textContent = expiringSoon;

            const recentCerts = recentRes.certificates.slice(0, 5);
            if (!recentCerts.length) {
                dashboardBody.innerHTML = '<tr><td colspan="5">No certificates issued yet.</td></tr>';
            } else {
                dashboardBody.innerHTML = recentCerts
                    .map((cert) => {
                        const statusClass = cert.status === "Verified" ? "verified" : cert.status === "Pending" ? "pending" : "";
                        return `
                            <tr>
                                <td>${cert.certificateId}</td>
                                <td>${cert.recipientName}</td>
                                <td>${cert.course}</td>
                                <td>${formatDateDMY(cert.issueDate)}</td>
                                <td><span class="${statusClass}">${cert.status}</span></td>
                            </tr>
                        `;
                    })
                    .join("");
            }

            const activityList = document.getElementById("recentActivityList");
            const events = [];
            recentRes.certificates.slice(0, 3).forEach((cert) => {
                events.push({ text: `Certificate issued to <strong>${cert.recipientName}</strong>`, time: cert.createdAt });
            });
            (logsRes.logs || []).forEach((log) => {
                const certLabel = log.certificate ? log.certificate.certificateId : log.attemptedCode || "unknown code";
                events.push({
                    text: log.result === "Success" ? `Certificate <strong>${certLabel}</strong> verified` : `Verification failed for <strong>${certLabel}</strong>`,
                    time: log.createdAt,
                });
            });
            events.sort((a, b) => new Date(b.time) - new Date(a.time));

            activityList.innerHTML = events.length
                ? events.slice(0, 4).map((e) => `<li><strong>${e.text}</strong><span>${timeAgo(e.time)}</span></li>`).join("")
                : '<li><strong>No recent activity yet.</strong></li>';
        } catch (error) {
            dashboardBody.innerHTML = `<tr><td colspan="5" style="color:#dc2626;">${error.message || "Failed to load dashboard data."}</td></tr>`;
        }
    }

    // ================= ISSUE CERTIFICATE =================
    if (issueForm) {
        const errorEl = document.getElementById("issueCertificateError");
        const STATUS_MAP = { "Pending Review": "Pending", Verified: "Verified", Draft: "Draft" };

        function generateCertificateId() {
            return (
                "CERT-" +
                Date.now().toString(36).toUpperCase() +
                "-" +
                Math.random().toString(36).slice(2, 6).toUpperCase()
            );
        }

        async function submitCertificate(statusOverride) {
            errorEl.textContent = "";

            const recipientName = document.getElementById("recipientName").value.trim();
            const recipientEmail = document.getElementById("recipientEmail").value.trim();
            const course = document.getElementById("course").value.trim();
            const issueDate = document.getElementById("issueDate").value;
            const certificateType = document.getElementById("certificateType").value;
            const statusDisplay = statusOverride || document.getElementById("certificateStatus").value;

            if (!recipientName || !recipientEmail || !course || !issueDate) {
                errorEl.textContent = "Please fill all required fields.";
                return;
            }

            try {
                await CV.apiFetch("/certificates", {
                    method: "POST",
                    body: {
                        certificateId: generateCertificateId(),
                        recipientName,
                        recipientEmail,
                        course,
                        issueDate,
                        certificateType,
                        status: STATUS_MAP[statusDisplay] || "Pending",
                    },
                });

                alert("Certificate saved successfully!");
                window.location.href = "manageCertificates.html";
            } catch (error) {
                errorEl.textContent = error.message || "Failed to save certificate.";
            }
        }

        issueForm.addEventListener("submit", function (event) {
            event.preventDefault();
            submitCertificate();
        });

        document.getElementById("saveDraftBtn").addEventListener("click", function () {
            submitCertificate("Draft");
        });
    }

    // ================= MANAGE CERTIFICATES =================
    if (certificateBody) {
        certificateBody.innerHTML = '<tr><td colspan="6">Loading certificates...</td></tr>';

        try {
            const data = await CV.apiFetch("/certificates?limit=100");
            currentOrgCertificates = data.certificates;

            const countLabel = document.getElementById("certificateCountLabel");
            if (countLabel) countLabel.textContent = `${data.total} record${data.total === 1 ? "" : "s"}`;

            if (!currentOrgCertificates.length) {
                certificateBody.innerHTML = '<tr><td colspan="6">No certificates issued yet.</td></tr>';
            } else {
                certificateBody.innerHTML = currentOrgCertificates
                    .map((cert) => {
                        const statusClass = cert.status === "Verified" ? "verified" : cert.status === "Pending" ? "pending" : "";
                        return `
                            <tr data-id="${cert.id}">
                                <td>${cert.certificateId}</td>
                                <td>${cert.recipientName}</td>
                                <td>${cert.course}</td>
                                <td>${formatDateDMY(cert.issueDate)}</td>
                                <td><span class="${statusClass}">${cert.status}</span></td>
                                <td><button class="link-btn" data-action="download" style="background:none;border:none;cursor:pointer;">Download PDF</button></td>
                            </tr>
                        `;
                    })
                    .join("");

                certificateBody.addEventListener("click", async function (event) {
                    const btn = event.target.closest('[data-action="download"]');
                    if (!btn) return;

                    const row = btn.closest("tr");
                    const id = row.dataset.id;
                    const cert = currentOrgCertificates.find((c) => c.id === id);
                    if (!cert) return;

                    const originalText = btn.textContent;
                    btn.disabled = true;
                    btn.textContent = "Downloading...";
                    try {
                        await CV.downloadPdf(`/certificates/${id}/pdf`, `${cert.certificateId}.pdf`);
                    } catch (error) {
                        alert(error.message || "Failed to download certificate PDF.");
                    } finally {
                        btn.disabled = false;
                        btn.textContent = originalText;
                    }
                });
            }
        } catch (error) {
            certificateBody.innerHTML = `<tr><td colspan="6" style="color:#dc2626;">${error.message || "Failed to load certificates."}</td></tr>`;
        }
    }

    // ================= PROFILE =================
    if (profileOrgName) {
        try {
            const org = await loadMyOrganization();

            if (!org) {
                profileOrgName.textContent = "No organization profile linked yet";
            } else {
                profileOrgName.textContent = org.name;
                document.getElementById("profileOrgType").textContent = org.type || "Organization";
                document.getElementById("profileOrgEmail").textContent = org.email;
                document.getElementById("profileOrgPhone").textContent = org.phone;
                document.getElementById("profileOrgAddress").textContent = org.address || "Not provided";
                document.getElementById("profileOrgStatus").textContent = org.status;
                document.getElementById("profileOrgUpdated").textContent = timeAgo(org.updatedAt);

                const verifiedRes = await CV.apiFetch("/certificates?status=Verified&limit=1");
                document.getElementById("profileOrgVerifiedCount").textContent = verifiedRes.total;
            }
        } catch (error) {
            profileOrgName.textContent = "Unable to load organization profile";
        }
    }

    // ================= SETTINGS =================
    if (settingsForm) {
        const errorEl = document.getElementById("orgSettingsError");

        try {
            const org = await loadMyOrganization();
            if (org) {
                document.getElementById("settingsOrgName").value = org.name;
                document.getElementById("settingsOrgPhone").value = org.phone;
                document.getElementById("settingsOrgEmail").value = org.email;
                document.getElementById("settingsOrgAddress").value = org.address || "";
            } else {
                errorEl.textContent = "No organization profile is linked to your account yet.";
            }

            const savedPref = localStorage.getItem("cv_org_notification_pref");
            if (savedPref) {
                document.getElementById("settingsNotificationPreference").value = savedPref;
            }
        } catch (error) {
            errorEl.textContent = error.message || "Failed to load organization settings.";
        }

        document.getElementById("settingsNotificationPreference").addEventListener("change", function () {
            localStorage.setItem("cv_org_notification_pref", this.value);
        });

        settingsForm.addEventListener("submit", async function (event) {
            event.preventDefault();
            errorEl.textContent = "";

            if (!myOrganization) {
                errorEl.textContent = "No organization profile is linked to your account yet.";
                return;
            }

            const name = document.getElementById("settingsOrgName").value.trim();
            const phone = document.getElementById("settingsOrgPhone").value.trim();
            const email = document.getElementById("settingsOrgEmail").value.trim();
            const address = document.getElementById("settingsOrgAddress").value.trim();

            if (!name || !phone || !email) {
                errorEl.textContent = "Please fill all required fields.";
                return;
            }

            const submitBtn = document.getElementById("orgSettingsSaveBtn");
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = "Saving...";

            try {
                const data = await CV.apiFetch("/organizations/" + myOrganization.id, {
                    method: "PUT",
                    body: { name, phone, email, address },
                });
                myOrganization = data.organization;
                alert("Settings Saved Successfully!");
            } catch (error) {
                errorEl.textContent = error.message || "Failed to save settings.";
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        });
    }

    // ================= VERIFICATION HISTORY =================
    if (verificationBody) {
        verificationBody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';

        try {
            const data = await CV.apiFetch("/verification-logs?limit=100");

            if (!data.logs.length) {
                verificationBody.innerHTML = '<tr><td colspan="5">No verification attempts recorded yet.</td></tr>';
            } else {
                verificationBody.innerHTML = data.logs
                    .map((log) => {
                        const certificateId = log.certificate ? log.certificate.certificateId : log.attemptedCode || "Unknown";
                        const statusClass = log.result === "Success" ? "verified" : "pending";
                        return `
                            <tr>
                                <td>#${log.id.slice(-8).toUpperCase()}</td>
                                <td>${certificateId}</td>
                                <td>${log.verifierName || "Public User"}</td>
                                <td>${formatDateDMY(log.createdAt)}</td>
                                <td><span class="${statusClass}">${log.result}</span></td>
                            </tr>
                        `;
                    })
                    .join("");
            }
        } catch (error) {
            verificationBody.innerHTML = `<tr><td colspan="5" style="color:#dc2626;">${error.message || "Failed to load verification history."}</td></tr>`;
        }
    }

    // ================= LOGOUT =================
    const logoutItem = document.querySelector('.logout-item');
    if (logoutItem) {
        logoutItem.addEventListener('click', function (event) {
            event.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                CV.logout('../Login/Login.html');
            }
        });
    }
});
