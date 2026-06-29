// ======================================
// AddCertificate.js
// ======================================

const certificateForm = document.getElementById("certificateForm");
const certificateTable = document.getElementById("certificateTable");

let certificateCount = 11;

certificateForm.addEventListener("submit", function(event){

    event.preventDefault();

    const studentName = document.getElementById("studentName").value.trim();
    const studentEmail = document.getElementById("studentEmail").value.trim();
    const course = document.getElementById("courseName").value.trim();
    const organization = document.getElementById("organizationName").value.trim();
    const issueDate = document.getElementById("issueDate").value;
    const status = document.getElementById("certificateStatus").value;

    if(studentName==="" || studentEmail==="" || course==="" || organization==="" || issueDate===""){

        alert("Please fill all fields.");
        return;

    }

    let statusClass="";

    if(status==="Verified"){

        statusClass="verified";

    }else if(status==="Pending"){

        statusClass="pending";

    }else{

        statusClass="inactive";

    }

    const newRow=document.createElement("tr");

    newRow.innerHTML=`

        <td>CERT${certificateCount}</td>

        <td>${studentName}</td>

        <td>${course}</td>

        <td>${organization}</td>

        <td>${issueDate}</td>

        <td><span class="status ${statusClass}">${status}</span></td>

        <td>

            <button class="view"><i class="fa-solid fa-eye"></i></button>

            <button class="edit"><i class="fa-solid fa-pen"></i></button>

            <button class="delete"><i class="fa-solid fa-trash"></i></button>

        </td>

    `;

    certificateTable.appendChild(newRow);

    certificateCount++;

    certificateForm.reset();

    modal.style.display="none";

    alert("Certificate Issued Successfully!");

});