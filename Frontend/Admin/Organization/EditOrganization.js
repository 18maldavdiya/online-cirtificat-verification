// ======================================
// Edit Organization
// ======================================

document.getElementById("organizationTable").addEventListener("click", function(event){

    if(event.target.closest(".edit")){

        const row = event.target.closest("tr");
        const id = row.dataset.id;
        const org = currentOrganizations.find((o) => o.id === id);

        if (!org) {
            return;
        }

        editingOrganizationId = id;

        document.getElementById("organizationName").value = org.name;

        document.getElementById("organizationEmail").value = org.email;

        document.getElementById("organizationPhone").value = org.phone;

        document.getElementById("organizationAddress").value = org.address || "";

        document.getElementById("organizationType").value = org.type;

        document.getElementById("organizationStatus").value = org.status;

        document.getElementById("modalTitle").innerText = "Edit Organization";

        modal.style.display = "flex";

    }

});
