// ======================================
// ViewLogs.js
// ======================================

document.getElementById("logsTable").addEventListener("click", function(event){

    if(event.target.closest(".view")){

        const row = event.target.closest("tr");
        const id = row.dataset.id;
        const log = currentLogs.find((l) => l.id === id);

        if (!log) {
            return;
        }

        document.getElementById("viewLogId").innerText = "#" + log.id.slice(-8).toUpperCase();
        document.getElementById("viewCertificateId").innerText = log.certificate ? log.certificate.certificateId : (log.attemptedCode || "Unknown");
        document.getElementById("viewVerifiedBy").innerText = log.verifierName || "Public User";
        document.getElementById("viewVerificationDate").innerText = formatLogDate(log.createdAt);
        document.getElementById("viewResult").innerText = log.result;

        document.getElementById("viewModal").style.display = "flex";

    }

});
