// ===============================
// Active Sidebar Menu
// ===============================

const menuItems = document.querySelectorAll(".sidebar ul li");

menuItems.forEach((item)=>{

    item.addEventListener("click",()=>{

        menuItems.forEach((menu)=>{

            menu.classList.remove("active");

        });

        item.classList.add("active");

    });

});


// ===============================
// Logout
// ===============================

const logout = menuItems[8];

logout.addEventListener("click",()=>{

    const answer = confirm("Are you sure you want to logout?");

    if(answer){

        window.location.href="../Login/Login.html";

    }

});