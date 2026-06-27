// ======================================
// DeleteOrganization.js
// ======================================

const organizationTable = document.getElementById("organizationTable");

// Event Delegation

organizationTable.addEventListener("click", function(event){

    // Delete Button Click

    if(event.target.closest(".delete")){

        const confirmDelete = confirm("Are you sure you want to delete this organization?");

        if(confirmDelete){

            const row = event.target.closest("tr");

            row.remove();

            alert("Organization Deleted Successfully!");

        }

    }

});