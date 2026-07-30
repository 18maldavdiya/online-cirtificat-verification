const currentStudentUser = CV.requireAuth(["user"], "../Login/Login.html");

if (currentStudentUser) {
  const profileNameEl = document.querySelector(".admin-profile span");
  if (profileNameEl) {
    profileNameEl.textContent = currentStudentUser.name;
  }
}

let currentCertificates = [];
const orgNameCache = {};

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

// Certificates fetched for the logged-in student never include the
// organization's name (only its internal id) - and students aren't
// authorized to call GET /api/organizations to resolve it. The public
// verification endpoint already returns the organization name though, so
// it's reused here purely as a read-only lookup (no backend change needed).
async function resolveOrgName(certificateId) {
  if (orgNameCache[certificateId] !== undefined) {
    return orgNameCache[certificateId];
  }
  try {
    const res = await CV.apiFetch("/verify/" + encodeURIComponent(certificateId));
    const name = (res.certificate && res.certificate.organization) || "Unknown Organization";
    orgNameCache[certificateId] = name;
    return name;
  } catch (error) {
    orgNameCache[certificateId] = "Unknown Organization";
    return "Unknown Organization";
  }
}

async function fetchMyCertificates(extraParams) {
  const params = new URLSearchParams({ limit: "100" });
  if (extraParams) {
    Object.keys(extraParams).forEach((key) => {
      if (extraParams[key]) params.set(key, extraParams[key]);
    });
  }
  const data = await CV.apiFetch("/certificates?" + params.toString());
  return data.certificates;
}

async function renderCertificateRows(targetBody, certs) {
  if (!certs.length) {
    targetBody.innerHTML = '<tr><td colspan="6">No certificates found.</td></tr>';
    return;
  }

  const rows = await Promise.all(
    certs.map(async (cert) => {
      const orgName = await resolveOrgName(cert.certificateId);
      const statusClass = (cert.status || "").toLowerCase();
      return `
        <tr>
          <td>${cert.certificateId}</td>
          <td>${cert.course}</td>
          <td>${orgName}</td>
          <td>${formatDateDMY(cert.issueDate)}</td>
          <td><span class="status-badge ${statusClass}">${cert.status}</span></td>
          <td><a href="certificate-details.html?id=${cert.id}" class="link-btn">View</a></td>
        </tr>
      `;
    })
  );

  targetBody.innerHTML = rows.join("");
}

function getSearchQuery() {
  return new URLSearchParams(window.location.search).get('search') || '';
}

async function applyCertificateFilter() {
  const searchInput = document.getElementById('certificateSearch');
  const search = (searchInput ? searchInput.value.trim() : getSearchQuery()).toLowerCase();
  const filter = document.getElementById('certificateFilter')?.value || 'all';
  const body = document.getElementById('certificateTableBody');
  if (!body) return;

  body.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

  try {
    const params = {};
    if (filter !== 'all') params.status = filter;
    if (search) params.search = search;

    currentCertificates = await fetchMyCertificates(params);
    await renderCertificateRows(body, currentCertificates);
  } catch (error) {
    body.innerHTML = `<tr><td colspan="6" style="color:#dc2626;">${error.message || 'Failed to load certificates.'}</td></tr>`;
  }
}

async function initDashboard() {
  const welcomeHeading = document.querySelector('.welcome-box h1');
  if (welcomeHeading && currentStudentUser) {
    welcomeHeading.textContent = `Welcome back, ${currentStudentUser.name}`;
  }

  const dashboardBody = document.getElementById('dashboardTableBody');
  if (!dashboardBody) return;

  dashboardBody.innerHTML = '<tr><td colspan="6">Loading...</td></tr>';

  try {
    const certs = await fetchMyCertificates();
    const now = Date.now();

    const total = certs.length;
    const verified = certs.filter((c) => c.status === "Verified").length;
    const active = certs.filter(
      (c) => c.status === "Verified" && (!c.expiryDate || new Date(c.expiryDate).getTime() > now)
    ).length;
    const expired = certs.filter(
      (c) => c.status === "Expired" || (c.expiryDate && new Date(c.expiryDate).getTime() <= now)
    ).length;

    document.getElementById("statTotalCertificates").textContent = total;
    document.getElementById("statVerifiedCertificates").textContent = verified;
    document.getElementById("statActiveCertificates").textContent = active;
    document.getElementById("statExpiredCertificates").textContent = expired;

    const sortedByRecent = certs.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    await renderCertificateRows(dashboardBody, sortedByRecent.slice(0, 5));

    const activityList = document.querySelector('.activity-list');
    if (activityList) {
      const recentEvents = sortedByRecent
        .slice(0, 3)
        .map((cert) => `<li><strong>Certificate for ${cert.course}</strong><span>${timeAgo(cert.createdAt)}</span></li>`);
      activityList.innerHTML = recentEvents.join("") || '<li><strong>No recent activity yet.</strong></li>';
    }
  } catch (error) {
    dashboardBody.innerHTML = `<tr><td colspan="6" style="color:#dc2626;">${error.message || 'Failed to load certificates.'}</td></tr>`;
  }
}

function initProfile() {
  const form = document.getElementById('profileForm');
  const editBtn = document.getElementById('editProfileBtn');
  const saveBtn = document.getElementById('saveProfileBtn');
  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');

  const toggleEditableInputs = () => {
    ['fullName', 'email'].forEach((key) => {
      const el = document.getElementById(key);
      if (el) el.disabled = !el.disabled;
    });
  };

  (async function loadProfile() {
    try {
      const data = await CV.apiFetch('/users/' + currentStudentUser.id);
      document.getElementById('fullName').value = data.user.name;
      document.getElementById('email').value = data.user.email;
      nameEl.textContent = data.user.name;
      emailEl.textContent = data.user.email;
      // Phone/Student ID/DOB/College/Course have no field on the User model
      // yet, so they stay blank and disabled (see final report).
    } catch (error) {
      nameEl.textContent = 'Unable to load profile';
    }
  })();

  if (editBtn) editBtn.addEventListener('click', toggleEditableInputs);

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const updatedName = document.getElementById('fullName').value.trim();
      const updatedEmail = document.getElementById('email').value.trim();

      if (!updatedName || !updatedEmail) {
        alert('Name and email are required.');
        return;
      }

      try {
        const data = await CV.apiFetch('/users/' + currentStudentUser.id, {
          method: 'PUT',
          body: { name: updatedName, email: updatedEmail },
        });

        CV.setSession(CV.getToken(), { ...currentStudentUser, name: data.user.name, email: data.user.email });
        nameEl.textContent = data.user.name;
        emailEl.textContent = data.user.email;

        alert('Profile updated successfully');
        toggleEditableInputs();
      } catch (error) {
        alert(error.message || 'Failed to update profile.');
      }
    });
  }

  if (saveBtn) saveBtn.style.display = 'inline-block';
}

async function initDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    document.getElementById('detailCourse').textContent = 'No certificate specified';
    return;
  }

  try {
    const data = await CV.apiFetch('/certificates/' + id);
    const cert = data.certificate;

    document.getElementById('detailCourse').textContent = cert.course;
    document.getElementById('detailRecipientName').textContent = cert.recipientName;
    document.getElementById('detailId').textContent = cert.certificateId;
    document.getElementById('detailIssue').textContent = formatDateDMY(cert.issueDate);
    document.getElementById('detailExpiry').textContent = cert.expiryDate ? formatDateDMY(cert.expiryDate) : 'No expiry';
    document.getElementById('detailStatus').textContent = cert.status;
    document.getElementById('detailStatus').className = `status-badge ${(cert.status || '').toLowerCase()}`;

    const qrBox = document.querySelector('.qr-box');
    if (qrBox && cert.qrCode) {
      qrBox.innerHTML = `<img src="${cert.qrCode}" alt="Certificate QR Code" style="max-width:120px;"><p>Scan to verify</p>`;
    }

    let orgName = "Unknown Organization";
    let verifyRes = null;
    try {
      verifyRes = await CV.apiFetch('/verify/' + encodeURIComponent(cert.certificateId));
      orgName = (verifyRes.certificate && verifyRes.certificate.organization) || orgName;
    } catch (error) {
      console.error("Failed to resolve organization / live verification status", error);
    }

    document.getElementById('detailOrg').textContent = orgName;
    document.getElementById('detailOrg2').textContent = orgName;
    document.getElementById('detailVerification').textContent = verifyRes
      ? verifyRes.message
      : 'Unable to verify right now';

    document.getElementById('downloadBtn').addEventListener('click', async function () {
      const btn = this;
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = 'Downloading...';
      try {
        await CV.downloadPdf(`/certificates/${cert.id}/pdf`, `${cert.certificateId}.pdf`);
      } catch (error) {
        alert(error.message || 'Failed to download certificate.');
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });

    document.getElementById('verifyBtn').addEventListener('click', async function () {
      try {
        const res = await CV.apiFetch('/verify/' + encodeURIComponent(cert.certificateId));
        alert(res.message || (res.valid ? 'Certificate is valid' : 'Certificate is not valid'));
      } catch (error) {
        alert(error.message || 'Failed to verify certificate.');
      }
    });
  } catch (error) {
    document.getElementById('detailCourse').textContent = 'Unable to load certificate';
    document.getElementById('detailOrg').textContent = error.message || 'Please try again later.';
  }
}

function initNotifications() {
  const list = document.getElementById('notificationsList');
  if (!list) return;
  // There is no Notifications model/API in the backend yet (see final report).
  list.innerHTML =
    '<div class="notification-item"><div><strong>Notifications are coming soon</strong>' +
    '<p>This feature isn\'t connected to live data yet.</p></div></div>';
}

if (document.getElementById('dashboardTableBody')) initDashboard();

const searchInput = document.getElementById('certificateSearch');
const dashboardSearchInput = document.getElementById('dashboardSearch');
if (searchInput) {
  const queryValue = getSearchQuery();
  if (queryValue) searchInput.value = queryValue;
  searchInput.addEventListener('input', applyCertificateFilter);
}
if (dashboardSearchInput) {
  dashboardSearchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const value = dashboardSearchInput.value.trim();
      if (value) {
        window.location.href = `certificates.html?search=${encodeURIComponent(value)}`;
      }
    }
  });
}
const filterSelect = document.getElementById('certificateFilter');
if (filterSelect) filterSelect.addEventListener('change', applyCertificateFilter);
if (searchInput || filterSelect) applyCertificateFilter();

if (document.getElementById('profileForm')) initProfile();
if (document.getElementById('detailCourse')) initDetails();
if (document.getElementById('notificationsList')) initNotifications();

const logoutItem = document.querySelector('.logout-item');
if (logoutItem) logoutItem.addEventListener('click', (event) => {
  event.preventDefault();
  if (confirm('Are you sure you want to logout?')) {
    CV.logout('../Login/Login.html');
  }
});
