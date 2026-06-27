// ======================================
// organization.js
// Handles Organization Modal
// ======================================

// Select Elements

const modal = document.getElementById("organizationModal");

const addBtn = document.querySelector(".add-organization");

const closeBtn = document.querySelector(".close");

const cancelBtn = document.querySelector(".cancel-btn");


// Open Modal

addBtn.addEventListener("click", function () {

    modal.style.display = "flex";

});


// Close Function

function closeModal(){

    modal.style.display = "none";

    document.getElementById("organizationForm").reset();

}


// Close Button

closeBtn.addEventListener("click", function(){

    closeModal();

});


// Cancel Button

cancelBtn.addEventListener("click", function(){

    closeModal();

});


// Click Outside Modal

window.addEventListener("click", function(event){

    if(event.target === modal){

        closeModal();

    }

});