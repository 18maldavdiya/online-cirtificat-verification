// ======================================
// EditUser.js
// Edit Existing User
// ======================================

let editRow = null;

userTable.addEventListener("click", function (event) {

    if (event.target.closest(".edit")) {

        editRow = event.target.closest("tr");

        const data = editRow.querySelectorAll("td");

        document.getElementById("name").value = data[1].innerText;

        document.getElementById("email").value = data[2].innerText;

        document.getElementById("role").value = data[3].innerText;

        document.getElementById("status").value =
            data[4].innerText.trim();

        document.getElementById("modalTitle").innerText = "Edit User";

        modal.style.display = "flex";

    }

});