// ======================================
// Search Organization (server-side, debounced)
// ======================================

let organizationSearchDebounce = null;

document.getElementById("searchOrganization").addEventListener("keyup", function(){

    clearTimeout(organizationSearchDebounce);
    organizationSearchDebounce = setTimeout(loadOrganizations, 300);

});
