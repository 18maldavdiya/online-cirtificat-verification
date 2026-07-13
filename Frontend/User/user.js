const certificates = [
  { id: 'CERT-101', course: 'Advanced Java', organization: 'TechNova', issueDate: '2024-01-15', expiryDate: '2025-01-15', status: 'Verified', verification: 'Verified by QR' },
  { id: 'CERT-102', course: 'Web Development', organization: 'CodeSphere', issueDate: '2024-02-10', expiryDate: '2025-02-10', status: 'Active', verification: 'Pending Review' },
  { id: 'CERT-103', course: 'Data Science', organization: 'DataHub', issueDate: '2023-11-05', expiryDate: '2024-11-05', status: 'Expired', verification: 'Expired' },
  { id: 'CERT-104', course: 'Cloud Computing', organization: 'CloudWorks', issueDate: '2024-03-20', expiryDate: '2026-03-20', status: 'Active', verification: 'Verified by QR' },
  { id: 'CERT-105', course: 'Cyber Security', organization: 'SecureNet', issueDate: '2024-04-12', expiryDate: '2025-04-12', status: 'Verified', verification: 'Verified by QR' },
  { id: 'CERT-106', course: 'UI/UX Design', organization: 'DesignHub', issueDate: '2024-05-08', expiryDate: '2026-05-08', status: 'Active', verification: 'Pending Review' },
  { id: 'CERT-107', course: 'Machine Learning', organization: 'AICampus', issueDate: '2023-09-18', expiryDate: '2024-09-18', status: 'Expired', verification: 'Expired' },
  { id: 'CERT-108', course: 'Blockchain Basics', organization: 'ChainLab', issueDate: '2024-06-22', expiryDate: '2026-06-22', status: 'Active', verification: 'Verified by QR' },
  { id: 'CERT-109', course: 'Digital Marketing', organization: 'MarketPro', issueDate: '2024-07-01', expiryDate: '2025-07-01', status: 'Verified', verification: 'Verified by QR' },
  { id: 'CERT-110', course: 'Python Programming', organization: 'CodeSphere', issueDate: '2024-08-14', expiryDate: '2026-08-14', status: 'Active', verification: 'Pending Review' }
];

const notifications = [
  { title: 'Certificate successfully verified', message: 'CERT-101 was verified successfully.', unread: true, time: '2 hours ago' },
  { title: 'New certificate issued', message: 'A new certificate was added to your account.', unread: false, time: 'Yesterday' },
  { title: 'Certificate expiry reminder', message: 'CERT-103 is expiring soon.', unread: true, time: '3 days ago' },
  { title: 'Profile updated successfully', message: 'Your profile information was saved.', unread: false, time: '1 week ago' }
];

function renderCertificates(targetBody, limit) {
  const filtered = certificates.slice(0, limit || certificates.length);
  targetBody.innerHTML = filtered.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.course}</td>
      <td>${item.organization}</td>
      <td>${item.issueDate}</td>
      <td><span class="status-badge ${item.status.toLowerCase()}">${item.status}</span></td>
      <td><a href="certificate-details.html?id=${item.id}" class="link-btn">View</a></td>
    </tr>
  `).join('');
}

function getSearchQuery() {
  return new URLSearchParams(window.location.search).get('search') || '';
}

function applyCertificateFilter() {
  const searchInput = document.getElementById('certificateSearch');
  const search = (searchInput?.value || getSearchQuery()).toLowerCase();
  const filter = document.getElementById('certificateFilter')?.value || 'all';
  const body = document.getElementById('certificateTableBody');
  if (!body) return;

  const filtered = certificates.filter(item => {
    const matchesSearch = [item.id, item.course, item.organization].join(' ').toLowerCase().includes(search);
    const matchesFilter = filter === 'all' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  body.innerHTML = filtered.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.course}</td>
      <td>${item.organization}</td>
      <td>${item.issueDate}</td>
      <td><span class="status-badge ${item.status.toLowerCase()}">${item.status}</span></td>
      <td><a href="certificate-details.html?id=${item.id}" class="link-btn">View</a></td>
    </tr>
  `).join('');
}

function initProfile() {
  const form = document.getElementById('profileForm');
  const editBtn = document.getElementById('editProfileBtn');
  const saveBtn = document.getElementById('saveProfileBtn');
  const inputs = ['fullName','email','phone','studentId','dob','college','course'];
  const values = {
    fullName: 'Hanish Maldavdiya',
    email: 'hanish@example.com',
    phone: '+91 98765 43210',
    studentId: 'STU-202401',
    dob: '2001-05-14',
    college: 'ABC Institute of Technology',
    course: 'B.Tech Computer Science'
  };

  inputs.forEach(key => {
    const el = document.getElementById(key);
    if (el) el.value = values[key];
  });

  const nameEl = document.getElementById('profileName');
  const emailEl = document.getElementById('profileEmail');
  if (nameEl) nameEl.textContent = values.fullName;
  if (emailEl) emailEl.textContent = values.email;

  const toggleInputs = () => inputs.forEach(key => {
    const el = document.getElementById(key);
    if (el) el.disabled = !el.disabled;
  });

  if (editBtn) editBtn.addEventListener('click', toggleInputs);
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const updatedName = document.getElementById('fullName')?.value || values.fullName;
    const updatedEmail = document.getElementById('email')?.value || values.email;
    if (nameEl) nameEl.textContent = updatedName;
    if (emailEl) emailEl.textContent = updatedEmail;
    alert('Profile updated successfully');
    toggleInputs();
  });

  if (saveBtn) saveBtn.style.display = 'inline-block';
}

function initDetails() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const cert = certificates.find(item => item.id === id) || certificates[0];
  if (!cert) return;
  document.getElementById('detailCourse').textContent = cert.course;
  document.getElementById('detailOrg').textContent = cert.organization;
  document.getElementById('detailStatus').textContent = cert.status;
  document.getElementById('detailStatus').className = `status-badge ${cert.status.toLowerCase()}`;
  document.getElementById('detailId').textContent = cert.id;
  document.getElementById('detailIssue').textContent = cert.issueDate;
  document.getElementById('detailExpiry').textContent = cert.expiryDate;
  document.getElementById('detailVerification').textContent = cert.verification;
  document.getElementById('detailOrg2').textContent = cert.organization;

  document.getElementById('downloadBtn')?.addEventListener('click', () => alert('Certificate download demo'));
  document.getElementById('verifyBtn')?.addEventListener('click', () => alert('Certificate verification demo'));
}

function initNotifications() {
  const list = document.getElementById('notificationsList');
  if (!list) return;
  list.innerHTML = notifications.map(item => `
    <div class="notification-item ${item.unread ? 'unread' : ''}">
      <div>
        <strong>${item.title}</strong>
        <p>${item.message}</p>
      </div>
      <span>${item.time}</span>
    </div>
  `).join('');
}

const dashboardBody = document.getElementById('dashboardTableBody');
if (dashboardBody) renderCertificates(dashboardBody, 5);

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
if (logoutItem) logoutItem.addEventListener('click', () => {
  window.location.href = '../Login/Login.html';
});
