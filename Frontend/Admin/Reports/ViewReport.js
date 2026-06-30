// ======================================
// ViewReport.js
// ======================================

const reportTable = document.getElementById("reportsTable");

const reportViewModal = document.getElementById("reportModal");

reportTable.addEventListener("click", function(event){

    if(event.target.closest(".view")){

        const row = event.target.closest("tr");

        document.getElementById("viewReportId").innerText =
        row.cells[0].innerText;

        document.getElementById("viewReportName").innerText =
        row.cells[1].innerText;

        document.getElementById("viewCategory").innerText =
        row.cells[2].innerText;

        document.getElementById("viewGeneratedBy").innerText =
        row.cells[3].innerText;

        document.getElementById("viewDate").innerText =
        row.cells[4].innerText;

        reportViewModal.style.display = "flex";

    }

});