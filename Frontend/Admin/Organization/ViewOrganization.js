// ======================================
// ViewOrganization.js
// ======================================

const organizationTable = document.getElementById("organizationTable");

organizationTable.addEventListener("click", function(event){

    if(event.target.closest(".view")){

        const row = event.target.closest("tr");

        const organizationID = row.cells[0].innerText;
        const organizationName = row.cells[1].innerText;
        const email = row.cells[2].innerText;
        const phone = row.cells[3].innerText;
        const status = row.cells[4].innerText;

        alert(
`Organization Details

Organization ID : ${organizationID}

Organization Name : ${organizationName}

Email : ${email}

Phone : ${phone}

Status : ${status}`
        );

    }

});