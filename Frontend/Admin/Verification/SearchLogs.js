// ======================================
// SearchLogs.js
// ======================================

const searchLogs = document.getElementById("searchLogs");

const searchLogsTable = document.getElementById("logsTable");

searchLogs.addEventListener("keyup", function () {

    const value = searchLogs.value.toLowerCase();

    const logRows = searchLogsTable.getElementsByTagName("tr");

    for (let i = 0; i < logRows.length; i++) {

        const logId = logRows[i].cells[0].innerText.toLowerCase();

        const certificateId = logRows[i].cells[1].innerText.toLowerCase();

        const verifiedBy = logRows[i].cells[2].innerText.toLowerCase();

        if (
            logId.includes(value) ||
            certificateId.includes(value) ||
            verifiedBy.includes(value)
        ) {

            logRows[i].style.display = "";

        } else {

            logRows[i].style.display = "none";

        }

    }

});