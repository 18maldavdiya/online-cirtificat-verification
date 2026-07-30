// ======================================
// SearchCertificate.js (server-side, debounced)
// ======================================

let certificateSearchDebounce = null;

document.getElementById("searchCertificate").addEventListener("keyup", function(){

    clearTimeout(certificateSearchDebounce);
    certificateSearchDebounce = setTimeout(loadCertificates, 300);

});
