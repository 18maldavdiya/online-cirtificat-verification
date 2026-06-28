// ======================================
// Edit Organization
// ======================================

let editRow = null;

organizationTable.addEventListener("click", function(event){

    if(event.target.closest(".edit")){

        editRow = event.target.closest("tr");

        document.getElementById("organizationName").value =
        editRow.cells[1].innerText;

        document.getElementById("organizationEmail").value =
        editRow.cells[2].innerText;

        document.getElementById("organizationPhone").value =
        editRow.cells[3].innerText;

        document.getElementById("organizationStatus").value =
        editRow.cells[4].innerText.trim();

        modal.style.display = "flex";

    }

});