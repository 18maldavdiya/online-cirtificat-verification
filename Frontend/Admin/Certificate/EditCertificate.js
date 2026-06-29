// ======================================
// EditCertificate.js
// ======================================

let editRow = null;

const editTable = document.getElementById("certificateTable");

editTable.addEventListener("click", function(event){

    if(event.target.closest(".edit")){

        editRow = event.target.closest("tr");

        document.getElementById("studentName").value =
        editRow.cells[1].innerText;

        document.getElementById("courseName").value =
        editRow.cells[2].innerText;

        document.getElementById("organizationName").value =
        editRow.cells[3].innerText;

        document.getElementById("issueDate").value =
        editRow.cells[4].innerText;

        document.getElementById("certificateStatus").value =
        editRow.cells[5].innerText.trim();

        modal.style.display = "flex";

    }

});