// ======================================
// ViewCertificate.js
// ======================================

const viewModal = document.getElementById("viewModal");

const closeView = document.querySelector(".close-view");

let viewingCertificateRecord = null;

document.getElementById("certificateTable").addEventListener("click", function(event){

    if(event.target.closest(".view")){

        const row = event.target.closest("tr");
        const id = row.dataset.id;
        const cert = currentCertificates.find((c) => c.id === id);

        if (!cert) {
            return;
        }

        viewingCertificateRecord = cert;

        document.getElementById("viewCertificateId").innerText = cert.certificateId;
        document.getElementById("viewStudentName").innerText = cert.recipientName;
        document.getElementById("viewCourse").innerText = cert.course;
        document.getElementById("viewOrganization").innerText = organizationsMap[cert.organization] || "Unknown Organization";
        document.getElementById("viewIssueDate").innerText = formatDateDMY(cert.issueDate);
        document.getElementById("viewStatus").innerText = cert.status;

        const qrImg = document.getElementById("viewQrCode");
        if (cert.qrCode) {
            qrImg.src = cert.qrCode;
            qrImg.style.display = "inline-block";
        } else {
            qrImg.style.display = "none";
        }

        viewModal.style.display = "flex";

    }

});

document.getElementById("downloadPdfBtn").addEventListener("click", async function () {

    if (!viewingCertificateRecord) {
        return;
    }

    const btn = this;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Downloading...";

    try {
        await CV.downloadPdf(
            `/certificates/${viewingCertificateRecord.id}/pdf`,
            `${viewingCertificateRecord.certificateId}.pdf`
        );
    } catch (error) {
        alert(error.message || "Failed to download certificate PDF.");
    } finally {
        btn.disabled = false;
        btn.textContent = originalText;
    }

});

closeView.addEventListener("click", function(){

    viewModal.style.display = "none";

});

window.addEventListener("click", function(event){

    if(event.target === viewModal){

        viewModal.style.display = "none";

    }

});
