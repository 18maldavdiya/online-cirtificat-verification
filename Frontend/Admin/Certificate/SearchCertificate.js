// ======================================
// SearchCertificate.js
// ======================================

const searchCertificate = document.getElementById("searchCertificate");

const certificateSearchTable = document.getElementById("certificateTable");

searchCertificate.addEventListener("keyup", function(){

    const value = searchCertificate.value.toLowerCase();

    const rows = certificateSearchTable.getElementsByTagName("tr");

    for(let i = 0; i < rows.length; i++){

        const certificateId = rows[i].cells[0].innerText.toLowerCase();

        const studentName = rows[i].cells[1].innerText.toLowerCase();

        if(
            certificateId.includes(value) ||
            studentName.includes(value)
        ){

            rows[i].style.display = "";

        }else{

            rows[i].style.display = "none";

        }

    }

});