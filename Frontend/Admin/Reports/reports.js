// ======================================
// reports.js
// ======================================

const reportModal = document.getElementById("reportModal");

const reportCloseIcon = document.querySelector(".close-view");

const reportCloseBtn = document.querySelector(".close-report");

reportCloseIcon.addEventListener("click", function () {

    reportModal.style.display = "none";

});

reportCloseBtn.addEventListener("click", function () {

    reportModal.style.display = "none";

});

window.addEventListener("click", function (event) {

    if (event.target === reportModal) {

        reportModal.style.display = "none";

    }

});