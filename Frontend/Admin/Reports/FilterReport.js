// ======================================
// FilterReport.js
// ======================================

const reportCategoryFilter = document.getElementById("resultFilter");
const reportDateFilter = document.getElementById("dateFilter");
const reportsTable = document.getElementById("reportsTable");

function filterReports() {

    const selectedCategory = reportCategoryFilter.value.trim().toLowerCase();
    const selectedDate = reportDateFilter.value.trim().toLowerCase();

    const reportRows = reportsTable.getElementsByTagName("tr");

    const today = new Date();

    for (let i = 0; i < reportRows.length; i++) {

        const category = reportRows[i].cells[2].innerText.trim().toLowerCase();

        const dateText = reportRows[i].cells[4].innerText.trim();

        const parts = dateText.split("-");

        const rowDate = new Date(parts[2], parts[1] - 1, parts[0]);

        // ---------- Category Filter ----------

        let categoryMatch =
            selectedCategory === "all categories" ||
            category === selectedCategory;

        // ---------- Date Filter ----------

        let dateMatch = true;

        if (selectedDate === "today") {

            dateMatch =
                rowDate.toDateString() === today.toDateString();

        }

        else if (selectedDate === "last 7 days") {

            const diff =
                (today - rowDate) / (1000 * 60 * 60 * 24);

            dateMatch = diff >= 0 && diff <= 7;

        }

        else if (selectedDate === "this month") {

            dateMatch =
                rowDate.getMonth() === today.getMonth() &&
                rowDate.getFullYear() === today.getFullYear();

        }

        reportRows[i].style.display =
            (categoryMatch && dateMatch) ? "" : "none";

    }

}

reportCategoryFilter.addEventListener("change", filterReports);

reportDateFilter.addEventListener("change", filterReports);