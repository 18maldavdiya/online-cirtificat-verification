// ==============================
// Selecting HTML Elements
// ==============================

const form = document.getElementById("loginForm");

const email = document.getElementById("email");

const password = document.getElementById("password");

const loginError = document.getElementById("loginError");

const submitBtn = document.getElementById("loginSubmitBtn");

const ROLE_REDIRECTS = {
    admin: "../Admin/dashboard.html",
    organization: "../Organization/dashboard.html",
    user: "../User/dashboard.html",
};

// If already logged in, skip straight to the right dashboard.
(function redirectIfAlreadyLoggedIn() {
    const existingUser = CV.getUser();
    if (CV.getToken() && existingUser && ROLE_REDIRECTS[existingUser.role]) {
        window.location.href = ROLE_REDIRECTS[existingUser.role];
    }
})();

// ==============================
// Login Event
// ==============================

form.addEventListener("submit", async function (event) {

    // Stop page from refreshing
    event.preventDefault();

    loginError.textContent = "";

    // Get user input

    const userEmail = email.value.trim();

    const userPassword = password.value.trim();

    // Empty Validation

    if (userEmail === "" || userPassword === "") {

        loginError.textContent = "Please fill all fields.";

        return;

    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
        const data = await CV.apiFetch("/auth/login", {
            method: "POST",
            body: { email: userEmail, password: userPassword },
        });

        CV.setSession(data.token, data.user);

        const destination = ROLE_REDIRECTS[data.user.role];
        window.location.href = destination || "../LangingPage/index.html";
    } catch (error) {
        loginError.textContent = error.message || "Invalid Email or Password";
        submitBtn.disabled = false;
        submitBtn.textContent = "Login";
    }

});
