// ======================================
// Filter Organization
// ======================================

const statusFilter = document.getElementById("statusFilter");

statusFilter.addEventListener("change", function(){

    const selectedStatus = statusFilter.value;

    const rows = organizationTable.getElementsByTagName("tr");

    for(let i=0;i<rows.length;i++){

        const status = rows[i].cells[4].innerText.trim();

        if(selectedStatus === "All Status" || status === selectedStatus){

            rows[i].style.display = "";

        }
        else{

            rows[i].style.display = "none";

        }

    }

});