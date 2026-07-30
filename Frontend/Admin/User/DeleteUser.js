// ======================================
// Delete User
// ======================================

document.getElementById("userTable").addEventListener("click", async function(event){

    if(event.target.closest(".delete")){

        const row = event.target.closest("tr");
        const id = row.dataset.id;

        const confirmDelete = confirm("Are you sure you want to delete this user?");

        if(confirmDelete){

            try {
                await CV.apiFetch("/users/" + id, { method: "DELETE" });
                alert("User Deleted Successfully!");
                loadUserStats();
                loadUsers();
            } catch (error) {
                alert(error.message || "Failed to delete user.");
            }

        }

    }

});
