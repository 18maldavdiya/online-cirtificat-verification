// ======================================
// Search User
// ======================================

const searchInput = document.getElementById("searchUser");

searchInput.addEventListener("keyup", function () {

    const searchValue = searchInput.value.toLowerCase();

    const rows = userTable.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {

        const name = rows[i].cells[1].innerText.toLowerCase();

        const email = rows[i].cells[2].innerText.toLowerCase();

        const role = rows[i].cells[3].innerText.toLowerCase();

        if (
            name.includes(searchValue) ||
            email.includes(searchValue) ||
            role.includes(searchValue)
        ) {

            rows[i].style.display = "";

        } else {

            rows[i].style.display = "none";

        }

    }

});