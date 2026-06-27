// ======================================
// Delete User
// ======================================

userTable.addEventListener("click", function(event){

    if(event.target.closest(".delete")){

        const row = event.target.closest("tr");

        const confirmDelete = confirm("Are you sure you want to delete this user?");

        if(confirmDelete){

            row.remove();

            alert("User Deleted Successfully!");

        }

    }

});