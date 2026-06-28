// ======================================
// View Organization
// ======================================

const viewModal = document.getElementById("viewModal");

const closeView = document.querySelector(".close-view");

organizationTable.addEventListener("click", function(event){

    if(event.target.closest(".view")){

        const row = event.target.closest("tr");

        document.getElementById("viewOrganizationId").innerText =
        row.cells[0].innerText;

        document.getElementById("viewOrganizationName").innerText =
        row.cells[1].innerText;

        document.getElementById("viewOrganizationEmail").innerText =
        row.cells[2].innerText;

        document.getElementById("viewOrganizationPhone").innerText =
        row.cells[3].innerText;

        document.getElementById("viewOrganizationStatus").innerText =
        row.cells[4].innerText;

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