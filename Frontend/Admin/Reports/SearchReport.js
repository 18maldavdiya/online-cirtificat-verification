// ======================================
// SearchReport.js
// ======================================

const reportSearch = document.getElementById("searchLogs");

const reportSearchTable = document.getElementById("reportsTable");

reportSearch.addEventListener("keyup", function () {

    const value = reportSearch.value.toLowerCase();

    const reportRows = reportSearchTable.getElementsByTagName("tr");

    for (let i = 0; i < reportRows.length; i++) {

        const reportId = reportRows[i].cells[0].innerText.toLowerCase();

        const reportName = reportRows[i].cells[1].innerText.toLowerCase();

        const category = reportRows[i].cells[2].innerText.toLowerCase();

        if (
            reportId.includes(value) ||
            reportName.includes(value) ||
            category.includes(value)
        ) {

            reportRows[i].style.display = "";

        } else {

            reportRows[i].style.display = "none";

        }

    }

});