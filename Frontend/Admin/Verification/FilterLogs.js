// ======================================
// FilterLogs.js
// ======================================

const resultFilter = document.getElementById("resultFilter");
const dateFilter = document.getElementById("dateFilter");
const filterLogsTable = document.getElementById("logsTable");

function filterLogs() {

    const selectedResult = resultFilter.value.toLowerCase();
    const selectedDate = dateFilter.value.toLowerCase();

    const rows = filterLogsTable.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {

        const result = rows[i].cells[4].innerText.toLowerCase();

        let showRow = true;

        // Result Filter
        if (
            selectedResult !== "all results" &&
            result !== selectedResult
        ) {
            showRow = false;
        }

        // Date Filter
        // (Abhi sample data same date ka hai,
        // isliye sirf UI ke liye rakha hai)

        rows[i].style.display = showRow ? "" : "none";
    }

}

resultFilter.addEventListener("change", filterLogs);
dateFilter.addEventListener("change", filterLogs);