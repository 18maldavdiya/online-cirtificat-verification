// ======================================
// user.js
// Handles Modal Open & Close
// ======================================

// Select Modal Elements

const modal = document.getElementById("userModal");

const addBtn = document.querySelector(".add-user");

const closeBtn = document.querySelector(".close");

const cancelBtn = document.querySelector(".cancel-btn");


// Open Modal

addBtn.addEventListener("click", function(){

    document.getElementById("modalTitle").innerText = "Add New User";

    modal.style.display = "flex";

});


// Close Modal

function closeModal(){

    modal.style.display = "none";

    document.getElementById("userForm").reset();

    document.getElementById("modalTitle").innerText = "Add New User";

}


// X Button

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