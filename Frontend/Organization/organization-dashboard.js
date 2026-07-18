document.addEventListener('DOMContentLoaded', function () {
    const dashboardBody = document.getElementById('dashboardTableBody');
    const certificateBody = document.getElementById('certificateTableBody');
    const verificationBody = document.getElementById('verificationTableBody');

    if (dashboardBody) {
        dashboardBody.innerHTML = `
            <tr>
                <td>CERT-1024</td>
                <td>Sarah Khan</td>
                <td>Advanced Cybersecurity</td>
                <td>2026-07-18</td>
                <td><span class="verified">Verified</span></td>
            </tr>
            <tr>
                <td>CERT-1025</td>
                <td>Daniel Silva</td>
                <td>Cloud Computing</td>
                <td>2026-07-16</td>
                <td><span class="pending">Pending</span></td>
            </tr>
        `;
    }

    if (certificateBody) {
        certificateBody.innerHTML = `
            <tr>
                <td>CERT-1024</td>
                <td>Sarah Khan</td>
                <td>Advanced Cybersecurity</td>
                <td>2026-07-18</td>
                <td><span class="verified">Verified</span></td>
                <td><a href="#" class="link-btn">View</a></td>
            </tr>
            <tr>
                <td>CERT-1025</td>
                <td>Daniel Silva</td>
                <td>Cloud Computing</td>
                <td>2026-07-16</td>
                <td><span class="pending">Pending</span></td>
                <td><a href="#" class="link-btn">View</a></td>
            </tr>
        `;
    }

    if (verificationBody) {
        verificationBody.innerHTML = `
            <tr>
                <td>REQ-4401</td>
                <td>CERT-1024</td>
                <td>System Checker</td>
                <td>2026-07-18</td>
                <td><span class="verified">Valid</span></td>
            </tr>
            <tr>
                <td>REQ-4402</td>
                <td>CERT-1025</td>
                <td>Org Reviewer</td>
                <td>2026-07-16</td>
                <td><span class="pending">Pending</span></td>
            </tr>
        `;
    }
});
