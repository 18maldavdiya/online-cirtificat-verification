const questions = document.querySelectorAll(".faq-question");

questions.forEach((question)=>{

    question.addEventListener("click",()=>{

        const answer = question.nextElementSibling;

        if(answer.style.display==="block"){

            answer.style.display="none";

        }

        else{

            answer.style.display="block";

        }

    });

});


// ===============================
// Verify Certificate (public, no login required)
// ===============================

const verifyCertificateForm = document.getElementById("verifyCertificateForm");
const verifyCertificateInput = document.getElementById("verifyCertificateInput");
const verifyCertificateResult = document.getElementById("verifyCertificateResult");

if (verifyCertificateForm) {

    verifyCertificateForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const code = verifyCertificateInput.value.trim();

        verifyCertificateResult.className = "";

        if (code === "") {
            verifyCertificateResult.textContent = "Please enter a Certificate ID.";
            verifyCertificateResult.className = "invalid";
            return;
        }

        const submitBtn = verifyCertificateForm.querySelector("button");
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = "Verifying...";
        verifyCertificateResult.textContent = "Checking certificate...";

        try {
            const data = await CV.apiFetch("/verify/" + encodeURIComponent(code));

            if (data.valid) {
                verifyCertificateResult.textContent =
                    `✔ ${data.message} — issued to ${data.certificate.recipientName} by ${data.certificate.organization} for ${data.certificate.course}.`;
                verifyCertificateResult.className = "valid";
            } else {
                verifyCertificateResult.textContent = `✘ ${data.message}`;
                verifyCertificateResult.className = "invalid";
            }
        } catch (error) {
            verifyCertificateResult.textContent = error.message || "Unable to verify this certificate right now.";
            verifyCertificateResult.className = "invalid";
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }

    });

}