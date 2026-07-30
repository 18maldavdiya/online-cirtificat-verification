// ======================================
// DeleteCertificate.js
// ======================================

document.getElementById("certificateTable").addEventListener("click", async function(event){

    if(event.target.closest(".delete")){

        const row = event.target.closest("tr");
        const id = row.dataset.id;

        const confirmDelete = confirm("Are you sure you want to delete this certificate?");

        if(confirmDelete){

            try {
                await CV.apiFetch("/certificates/" + id, { method: "DELETE" });
                alert("Certificate Deleted Successfully!");
                loadCertificateStats();
                loadCertificates();
            } catch (error) {
                alert(error.message || "Failed to delete certificate.");
            }

        }

    }

});
