// ======================================
// DeleteCertificate.js
// ======================================

console.log("Delete JS Loaded");


certificateTable.addEventListener("click", function(event){

    if(event.target.closest(".delete")){

        const confirmDelete = confirm("Are you sure you want to delete this certificate?");

        if(confirmDelete){

            event.target.closest("tr").remove();

            alert("Certificate Deleted Successfully!");

        }

    }

});