// ======================================
// Search User (ID + Name)
// ======================================

const searchInput = document.getElementById("searchUser");

searchInput.addEventListener("keyup", function () {

    const filter = searchInput.value.toLowerCase();

    const rows = userTable.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {

        const userId = rows[i].cells[0].innerText.toLowerCase();

        const name = rows[i].cells[1].innerText.toLowerCase();

        if (userId.includes(filter) || name.includes(filter)) {

            rows[i].style.display = "";

        } else {

            rows[i].style.display = "none";

        }

    }

});