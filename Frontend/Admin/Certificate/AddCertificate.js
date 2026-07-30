// ======================================
// AddCertificate.js
// Issue New Certificate / Save edits (shared form submit)
// ======================================

const certificateForm = document.getElementById("certificateForm");

function generateCertificateId() {
    return (
        "CERT-" +
        Date.now().toString(36).toUpperCase() +
        "-" +
        Math.random().toString(36).slice(2, 6).toUpperCase()
    );
}

certificateForm.addEventListener("submit", async function(event){

    event.preventDefault();

    const recipientName = document.getElementById("studentName").value.trim();
    const recipientEmail = document.getElementById("studentEmail").value.trim();
    const course = document.getElementById("courseName").value;
    const organization = document.getElementById("organizationName").value;
    const issueDate = document.getElementById("issueDate").value;
    const status = document.getElementById("certificateStatus").value;

    if(recipientName==="" || recipientEmail==="" || course==="" || organization==="" || issueDate===""){

        alert("Please fill all fields.");
        return;

    }

    const submitBtn = certificateForm.querySelector(".save-btn");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    const payload = { recipientName, recipientEmail, course, organization, issueDate, status };

    try {
        if (editingCertificateId) {
            await CV.apiFetch("/certificates/" + editingCertificateId, { method: "PUT", body: payload });
            alert("Certificate Updated Successfully!");
        } else {
            payload.certificateId = generateCertificateId();
            await CV.apiFetch("/certificates", { method: "POST", body: payload });
            alert("Certificate Issued Successfully!");
        }

        certificateForm.reset();
        document.getElementById("modalTitle").innerText = "Issue Certificate";
        editingCertificateId = null;
        modal.style.display="none";

        loadCertificateStats();
        loadCertificates();
    } catch (error) {
        alert(error.message || "Something went wrong. Please try again.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }

});
