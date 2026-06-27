// ======================================
// View User
// ======================================

const viewModal = document.getElementById("viewModal");

const closeView = document.querySelector(".close-view");

userTable.addEventListener("click", function(event){

    if(event.target.closest(".view")){

        const row = event.target.closest("tr");

        const data = row.querySelectorAll("td");

        document.getElementById("viewId").innerText = data[0].innerText;

        document.getElementById("viewName").innerText = data[1].innerText;

        document.getElementById("viewEmail").innerText = data[2].innerText;

        document.getElementById("viewRole").innerText = data[3].innerText;

        document.getElementById("viewStatus").innerText = data[4].innerText;

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