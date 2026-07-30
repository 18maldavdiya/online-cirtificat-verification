// ======================================
// AddOrganization.js
// Add New Organization / Save edits (shared form submit)
// ======================================

const organizationForm = document.getElementById("organizationForm");

organizationForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("organizationName").value.trim();
    const email = document.getElementById("organizationEmail").value.trim();
    const phone = document.getElementById("organizationPhone").value.trim();
    const address = document.getElementById("organizationAddress").value.trim();
    const type = document.getElementById("organizationType").value;
    const status = document.getElementById("organizationStatus").value;

    if (name === "" || email === "" || phone === "") {

        alert("Please fill all fields.");
        return;

    }

    const submitBtn = organizationForm.querySelector(".save-btn");
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    const payload = { name, email, phone, address, type, status };

    try {
        if (editingOrganizationId) {
            await CV.apiFetch("/organizations/" + editingOrganizationId, { method: "PUT", body: payload });
            alert("Organization Updated Successfully!");
        } else {
            await CV.apiFetch("/organizations", { method: "POST", body: payload });
            alert("Organization Added Successfully!");
        }

        editingOrganizationId = null;
        organizationForm.reset();
        document.getElementById("modalTitle").innerText = "Add Organization";
        modal.style.display = "none";

        loadOrganizationStats();
        loadOrganizations();
    } catch (error) {
        alert(error.message || "Something went wrong. Please try again.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }

});
