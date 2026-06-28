// ======================================
// Search Organization
// ======================================

const searchOrganization =
document.getElementById("searchOrganization");

searchOrganization.addEventListener("keyup", function(){

    const value =
    searchOrganization.value.toLowerCase();

    const rows =
    organizationTable.getElementsByTagName("tr");

    for(let i=0;i<rows.length;i++){

        const id =
        rows[i].cells[0].innerText.toLowerCase();

        const name =
        rows[i].cells[1].innerText.toLowerCase();

        if(id.includes(value) || name.includes(value)){

            rows[i].style.display="";

        }
        else{

            rows[i].style.display="none";

        }

    }

});