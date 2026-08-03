// ======================================
// settings.js
// ======================================

const settingsForm = document.getElementById("settingsForm");

const adminNameInput = document.getElementById("adminName");

const adminEmailInput = document.getElementById("adminEmail");

const newPassword = document.getElementById("newPassword");

const confirmPassword = document.getElementById("confirmPassword");

// ==============================
// Load current admin data
// ==============================

// Populated once the real admin profile loads, so the Reset button can
// restore these actual values instead of the hardcoded HTML defaults.
let loadedAdminName = adminNameInput.value;
let loadedAdminEmail = adminEmailInput.value;

(async function loadCurrentAdmin() {
    try {
        const currentUser = CV.getUser();
        const data = await CV.apiFetch("/users/" + currentUser.id);
        adminNameInput.value = data.user.name;
        adminEmailInput.value = data.user.email;
        loadedAdminName = data.user.name;
        loadedAdminEmail = data.user.email;
        // Phone is not part of the User model yet, so it can't be loaded or
        // saved from here - left as-is (see final report for this limitation).
    } catch (error) {
        console.error("Failed to load current admin profile", error);
    }
})();

// ==============================
// Save Settings
// ==============================

settingsForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const adminName = adminNameInput.value.trim();

    const adminEmail = adminEmailInput.value.trim();

    if (
        adminName === "" ||
        adminEmail === ""
    ) {

        alert("Please fill all required fields.");

        return;

    }

    if (newPassword.value !== confirmPassword.value) {

        alert("Passwords do not match!");

        return;

    }

    const submitBtn = settingsForm.querySelector(".save-btn");
    const originalHtml = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    const payload = { name: adminName, email: adminEmail };
    if (newPassword.value.trim() !== "") {
        payload.password = newPassword.value.trim();
    }

    try {
        const currentUser = CV.getUser();
        const data = await CV.apiFetch("/users/" + currentUser.id, { method: "PUT", body: payload });

        // Keep the cached session in sync so the name shown in the topbar
        // (set by admin.js on every page) stays accurate immediately.
        CV.setSession(CV.getToken(), { ...currentUser, name: data.user.name, email: data.user.email });

        newPassword.value = "";
        confirmPassword.value = "";
        confirmPassword.style.borderColor = "#d1d5db";

        alert("Settings Saved Successfully!");
    } catch (error) {
        alert(error.message || "Failed to save settings.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHtml;
    }

});

// ==============================
// Reset Form
// ==============================

settingsForm.addEventListener("reset", function () {

    setTimeout(function () {

        // Native reset reverts to the hardcoded HTML defaults, not the real
        // admin profile - restore the actually-loaded values instead.
        adminNameInput.value = loadedAdminName;
        adminEmailInput.value = loadedAdminEmail;

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

// ==============================
// Theme Change (persisted in localStorage - purely client-side preference,
// there is no backend field for this)
// ==============================

const theme = document.getElementById("theme");

const THEME_STORAGE_KEY = "cv_admin_theme";

function applyTheme(value) {
    if (value === "Dark") {
        document.body.classList.add("dark-mode");
    } else {
        document.body.classList.remove("dark-mode");
    }
}

const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
if (savedTheme) {
    theme.value = savedTheme;
    applyTheme(savedTheme);
}

theme.addEventListener("change", function () {

    applyTheme(theme.value);
    localStorage.setItem(THEME_STORAGE_KEY, theme.value);

});
