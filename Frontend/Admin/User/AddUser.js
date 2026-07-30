// ======================================
// AddUser.js
// Add New User / Save edits (shared form submit)
// ======================================

const userForm = document.getElementById("userForm");

// Form Submit

userForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    // Get Form Data

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const password = document.getElementById("password").value.trim();

    const roleDisplay = document.getElementById("role").value;

    const statusDisplay = document.getElementById("status").value;


    // Validation

    if (name === "" || email === "" || (!editingUserId && password === "")) {

        alert("Please fill all fields.");

        return;

    }

    const submitBtn = userForm.querySelector(".save-btn");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    const payload = {
        name,
        email,
        role: ROLE_DISPLAY_TO_API[roleDisplay],
        status: statusDisplay,
    };

    if (password !== "") {
        payload.password = password;
    }

    try {
        if (editingUserId) {
            await CV.apiFetch("/users/" + editingUserId, { method: "PUT", body: payload });
            alert("User Updated Successfully!");
        } else {
            await CV.apiFetch("/users", { method: "POST", body: payload });
            alert("User Saved Successfully!");
        }

        userForm.reset();
        document.getElementById("modalTitle").innerText = "Add New User";
        editingUserId = null;
        modal.style.display = "none";

        loadUserStats();
        loadUsers();
    } catch (error) {
        alert(error.message || "Something went wrong. Please try again.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }

});
