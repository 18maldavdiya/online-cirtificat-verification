// ======================================
// SearchLogs.js
// ======================================

let logsSearchDebounce = null;

document.getElementById("searchLogs").addEventListener("keyup", function () {

    clearTimeout(logsSearchDebounce);
    logsSearchDebounce = setTimeout(loadLogs, 300);

});
