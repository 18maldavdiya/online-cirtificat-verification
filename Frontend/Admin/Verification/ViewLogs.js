// ======================================
// ViewLogs.js
// ======================================

const viewLogsTable = document.getElementById("logsTable");

const logsViewModal = document.getElementById("viewModal");

viewLogsTable.addEventListener("click", function(event){

    if(event.target.closest(".view")){

        const row = event.target.closest("tr");

        document.getElementById("viewLogId").innerText =
        row.cells[0].innerText;

        document.getElementById("viewCertificateId").innerText =
        row.cells[1].innerText;

        document.getElementById("viewVerifiedBy").innerText =
        row.cells[2].innerText;

        document.getElementById("viewVerificationDate").innerText =
        row.cells[3].innerText;

        document.getElementById("viewResult").innerText =
        row.cells[4].innerText;

        logsViewModal.style.display = "flex";

    }

});