// ======================================
// View Organization
// ======================================

const viewModal = document.getElementById("viewModal");

const closeView = document.querySelector(".close-view");

document.getElementById("organizationTable").addEventListener("click", function(event){

    if(event.target.closest(".view")){

        const row = event.target.closest("tr");
        const id = row.dataset.id;
        const org = currentOrganizations.find((o) => o.id === id);

        if (!org) {
            return;
        }

        document.getElementById("viewOrganizationId").innerText = "#" + org.id.slice(-8).toUpperCase();
        document.getElementById("viewOrganizationName").innerText = org.name;
        document.getElementById("viewOrganizationEmail").innerText = org.email;
        document.getElementById("viewOrganizationPhone").innerText = org.phone;
        document.getElementById("viewOrganizationStatus").innerText = org.status;

        viewModal.style.display = "flex";

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
