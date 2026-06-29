// ======================================
// verificationLogs.js
// ======================================

const viewModal = document.getElementById("viewModal");

const closeView = document.querySelector(".close-view");

closeView.addEventListener("click", function () {

    viewModal.style.display = "none";

});

window.addEventListener("click", function (event) {

    if (event.target === viewModal) {

        viewModal.style.display = "none";

    }

});