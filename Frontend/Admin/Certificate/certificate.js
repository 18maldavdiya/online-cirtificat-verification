// ======================================
// certificate.js
// ======================================

const modal = document.getElementById("certificateModal");

const addBtn = document.querySelector(".add-certificate");

const closeBtn = document.querySelector(".close");

const cancelBtn = document.querySelector(".cancel-btn");

addBtn.addEventListener("click", function(){

    modal.style.display = "flex";

});

function closeModal(){

    modal.style.display = "none";

    document.getElementById("certificateForm").reset();

}

closeBtn.addEventListener("click", closeModal);

cancelBtn.addEventListener("click", closeModal);

window.addEventListener("click", function(event){

    if(event.target === modal){

        closeModal();

    }

});