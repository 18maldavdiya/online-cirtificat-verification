// ======================================
// ViewCertificate.js
// ======================================

const table = document.getElementById("certificateTable");

const viewModal = document.getElementById("viewModal");

const closeView = document.querySelector(".close-view");

table.addEventListener("click", function(event){

    if(event.target.closest(".view")){

        const row = event.target.closest("tr");

        document.getElementById("viewCertificateId").innerText = row.cells[0].innerText;
        document.getElementById("viewStudentName").innerText = row.cells[1].innerText;
        document.getElementById("viewCourse").innerText = row.cells[2].innerText;
        document.getElementById("viewOrganization").innerText = row.cells[3].innerText;
        document.getElementById("viewIssueDate").innerText = row.cells[4].innerText;
        document.getElementById("viewStatus").innerText = row.cells[5].innerText;

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