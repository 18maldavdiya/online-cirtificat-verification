// ======================================
// settings.js
// ======================================

const settingsForm = document.getElementById("settingsForm");

const newPassword = document.getElementById("newPassword");

const confirmPassword = document.getElementById("confirmPassword");

// ==============================
// Save Settings
// ==============================

settingsForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const adminName = document.getElementById("adminName").value.trim();

    const adminEmail = document.getElementById("adminEmail").value.trim();

    const adminPhone = document.getElementById("adminPhone").value.trim();

    if (
        adminName === "" ||
        adminEmail === "" ||
        adminPhone === ""
    ) {

        alert("Please fill all required fields.");

        return;

    }

    if (newPassword.value !== confirmPassword.value) {

        alert("Passwords do not match!");

        return;

    }

    alert("Settings Saved Successfully!");

});

// ==============================
// Reset Form
// ==============================

settingsForm.addEventListener("reset", function () {

    setTimeout(function () {

        alert("Settings Reset Successfully!");

    }, 100);

});

// ==============================
// Password Match Check
// ==============================

confirmPassword.addEventListener("keyup", function () {

    if (confirmPassword.value === "") {

        confirmPassword.style.borderColor = "#d1d5db";

        return;

    }

    if (newPassword.value === confirmPassword.value) {

        confirmPassword.style.borderColor = "green";

    } else {

        confirmPassword.style.borderColor = "red";

    }

});
// Theme Change

const theme = document.getElementById("theme");

theme.addEventListener("change", function () {

    if (theme.value === "Dark") {

        document.body.classList.add("dark-mode");

    } 
    
    else {

        document.body.classList.remove("dark-mode");

    }

});