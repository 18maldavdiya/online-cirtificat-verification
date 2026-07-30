// ======================================
// DeleteOrganization.js
// ======================================

document.getElementById("organizationTable").addEventListener("click", async function(event){

    if(event.target.closest(".delete")){

        const row = event.target.closest("tr");
        const id = row.dataset.id;

        const confirmDelete = confirm("Are you sure you want to delete this organization?");

        if(confirmDelete){

            try {
                await CV.apiFetch("/organizations/" + id, { method: "DELETE" });
                alert("Organization Deleted Successfully!");
                loadOrganizationStats();
                loadOrganizations();
            } catch (error) {
                alert(error.message || "Failed to delete organization.");
            }

        }

    }

});
