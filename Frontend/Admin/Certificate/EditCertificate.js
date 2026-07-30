// ======================================
// EditCertificate.js
// ======================================

document.getElementById("certificateTable").addEventListener("click", async function(event){

    if(event.target.closest(".edit")){

        const row = event.target.closest("tr");
        const id = row.dataset.id;
        const cert = currentCertificates.find((c) => c.id === id);

        if (!cert) {
            return;
        }

        editingCertificateId = id;

        await loadOrganizationsForForm();

        document.getElementById("studentName").value = cert.recipientName;

        document.getElementById("studentEmail").value = cert.recipientEmail;

        document.getElementById("courseName").value = cert.course;

        document.getElementById("organizationName").value = cert.organization;

        document.getElementById("issueDate").value = cert.issueDate ? cert.issueDate.slice(0, 10) : "";

        document.getElementById("certificateStatus").value = cert.status;

        document.getElementById("modalTitle").innerText = "Edit Certificate";

        modal.style.display = "flex";

    }

});
