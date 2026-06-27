// ======================================
// Filter Users
// ======================================

const roleFilter = document.getElementById("roleFilter");

const statusFilter = document.getElementById("statusFilter");

function filterUsers() {

    const roleValue = roleFilter.value;

    const statusValue = statusFilter.value;

    const rows = userTable.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {

        const role = rows[i].cells[3].innerText.trim();

        const status = rows[i].cells[4].innerText.trim();

        const roleMatch =
            roleValue === "All Roles" || role === roleValue;

        const statusMatch =
            statusValue === "All Status" || status === statusValue;

        if (roleMatch && statusMatch) {

            rows[i].style.display = "";

        }

        else {

            rows[i].style.display = "none";

        }

    }

}

roleFilter.addEventListener("change", filterUsers);

statusFilter.addEventListener("change", filterUsers);