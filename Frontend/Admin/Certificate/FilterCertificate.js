// ======================================
// FilterCertificate.js
// ======================================

const courseFilter = document.getElementById("roleFilter");
const statusFilter = document.getElementById("filterStatus");
const filterTable = document.getElementById("certificateTable");

function filterCertificates() {

    const selectedCourse = courseFilter.value.toLowerCase();
    const selectedStatus = statusFilter.value.toLowerCase();

    const rows = filterTable.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {

        const course = rows[i].cells[2].innerText.toLowerCase().trim();
        const status = rows[i].cells[5].innerText.toLowerCase().trim();

        const courseMatch =
            selectedCourse === "all courses" || course === selectedCourse;

        const statusMatch =
            selectedStatus === "all status" || status === selectedStatus;

        rows[i].style.display = (courseMatch && statusMatch) ? "" : "none";
    }
}

courseFilter.addEventListener("change", filterCertificates);
statusFilter.addEventListener("change", filterCertificates);