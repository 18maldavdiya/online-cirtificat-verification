// ==============================
// Selecting HTML Elements
// ==============================

const form = document.getElementById("loginForm");

const email = document.getElementById("email");

const password = document.getElementById("password");


// ==============================
// Login Event
// ==============================

form.addEventListener("submit", function(event){

    // Stop page from refreshing
    event.preventDefault();


    // Get user input

    const userEmail = email.value.trim();

    const userPassword = password.value.trim();


    // Empty Validation

    if(userEmail === "" || userPassword === ""){

        alert("Please fill all fields.");

        return;

    }


    // ==============================
    // Dummy Login
    // ==============================

    if(userEmail === "admin@gmail.com"
        &&
        userPassword === "12345"){

        alert("Welcome Admin");

        window.location.href="../Admin/dashboard.html";

    }

    else if(userEmail === "college@gmail.com"
        &&
        userPassword === "12345"){

        alert("Welcome Organization");

        window.location.href="../Admin/Organization/organizations.html";

    }

    else if(userEmail === "student@gmail.com"
        &&
        userPassword === "12345"){

        alert("Welcome Student");

        window.location.href="../Admin/dashboard.html";

    }

    else{

        alert("Invalid Email or Password");

    }

});

