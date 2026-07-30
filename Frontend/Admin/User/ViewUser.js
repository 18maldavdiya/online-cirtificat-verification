// ======================================
// View User
// ======================================

const viewModal = document.getElementById("viewModal");

const closeView = document.querySelector(".close-view");

document.getElementById("userTable").addEventListener("click", function(event){

    if(event.target.closest(".view")){

        const row = event.target.closest("tr");
        const id = row.dataset.id;
        const user = currentUsers.find((u) => u.id === id);

        if (!user) {
            return;
        }

        document.getElementById("viewId").innerText = "#" + user.id.slice(-8).toUpperCase();
        document.getElementById("viewName").innerText = user.name;
        document.getElementById("viewEmail").innerText = user.email;
        document.getElementById("viewRole").innerText = ROLE_API_TO_DISPLAY[user.role] || user.role;
        document.getElementById("viewStatus").innerText = user.status;

        viewModal.style.display = "flex";

    }

});

closeView.addEventListener("click", function(){

    viewModal.style.display = "none";

});

window.addEventListener("click", function(event){

    if(event.target === viewModal){

        viewModal.style.display = "none";

    }

});
