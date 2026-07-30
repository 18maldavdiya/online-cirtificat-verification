// ==========================================================================
// Shared API client for the whole frontend. Single source of truth for the
// backend base URL, auth-token storage, the fetch wrapper (JSON + auth
// header + error normalization), PDF download, output-escaping, and page
// route-guarding (including session-expiry and cross-tab/back-button sync).
// Loaded first, in <head>, on every page.
// ==========================================================================
(function (global) {
    const API_BASE_URL = "http://localhost:5000/api";

    const TOKEN_KEY = "cv_token";
    const USER_KEY = "cv_user";

    function getToken() {
        return localStorage.getItem(TOKEN_KEY);
    }

    function getUser() {
        const raw = localStorage.getItem(USER_KEY);
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function setSession(token, user) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    function clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    }

    function logout(loginPath) {
        clearSession();
        window.location.href = loginPath || computeLoginPath();
    }

    // Works out the relative path back to Login.html from wherever this page
    // lives (Admin/, Admin/Certificate/, Organization/, User/, ...) so the
    // rest of this file can redirect on session expiry without every caller
    // having to know/pass its own depth.
    function computeLoginPath() {
        const path = window.location.pathname;
        const markers = ["/Admin/", "/Organization/", "/User/", "/Login/", "/LangingPage/"];

        for (const marker of markers) {
            const idx = path.indexOf(marker);
            if (idx !== -1) {
                const after = path.slice(idx + marker.length);
                const depth = after.split("/").length - 1;
                return "../".repeat(depth + 1) + "Login/Login.html";
            }
        }

        return "Login/Login.html";
    }

    function isOnLoginPage() {
        return window.location.pathname.includes("/Login/");
    }

    // Redirects to loginPath if there is no session, or if allowedRoles is
    // given and the logged-in user's role isn't in it. Returns the user object
    // so pages can use it immediately, or null if a redirect just happened.
    // Intended to be called as early as possible (ideally from <head>, before
    // the page body renders) so an unauthorized visitor never sees so much as
    // the page shell of a dashboard that isn't theirs.
    function requireAuth(allowedRoles, loginPath) {
        const token = getToken();
        const user = getUser();
        const path = loginPath || computeLoginPath();

        if (!token || !user) {
            window.location.replace(path);
            return null;
        }

        if (allowedRoles && allowedRoles.length && !allowedRoles.includes(user.role)) {
            window.location.replace(path);
            return null;
        }

        return user;
    }

    // Escapes a value for safe interpolation into innerHTML. Every place that
    // builds table rows/lists from server data (recipient names, course
    // titles, organization names, emails, ...) must run untrusted strings
    // through this before concatenating them into an HTML template - those
    // values come from other, lower-privileged accounts (e.g. an Organization
    // issuing a certificate that an Admin later views) and are not safe to
    // treat as markup.
    function escapeHtml(value) {
        if (value === null || value === undefined) {
            return "";
        }
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    // A 401 with a token attached means the session itself is invalid/expired
    // (as opposed to e.g. a login attempt with the wrong password, which also
    // returns 401 but never sends a token) - in that case the current page
    // can no longer function, so redirect immediately instead of leaving the
    // user stuck looking at a dashboard that can't load anything.
    function handleUnauthorized(hadToken) {
        clearSession();
        if (hadToken && !isOnLoginPage()) {
            window.location.href = computeLoginPath();
        }
    }

    // JSON request wrapper. Attaches the bearer token automatically when
    // present.
    async function apiFetch(path, options = {}) {
        const token = getToken();
        const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
        if (token) {
            headers.Authorization = "Bearer " + token;
        }

        let response;
        try {
            response = await fetch(API_BASE_URL + path, {
                method: options.method || "GET",
                headers,
                body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
            });
        } catch (networkError) {
            const err = new Error("Unable to reach the server. Please check your connection and try again.");
            err.status = 0;
            throw err;
        }

        let data = null;
        try {
            data = await response.json();
        } catch (e) {
            data = null;
        }

        if (response.status === 401) {
            handleUnauthorized(!!token);
        }

        if (!response.ok) {
            const err = new Error((data && data.message) || `Request failed (${response.status})`);
            err.status = response.status;
            err.data = data;
            throw err;
        }

        return data;
    }

    // Downloads a binary PDF response and triggers a browser save dialog.
    async function downloadPdf(path, filename) {
        const token = getToken();
        const headers = {};
        if (token) {
            headers.Authorization = "Bearer " + token;
        }

        let response;
        try {
            response = await fetch(API_BASE_URL + path, { headers });
        } catch (networkError) {
            const err = new Error("Unable to reach the server. Please check your connection and try again.");
            err.status = 0;
            throw err;
        }

        if (!response.ok) {
            let data = null;
            try {
                data = await response.json();
            } catch (e) {
                data = null;
            }
            if (response.status === 401) {
                handleUnauthorized(!!token);
            }
            const err = new Error((data && data.message) || `Download failed (${response.status})`);
            err.status = response.status;
            throw err;
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename || "certificate.pdf";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }

    // ---- Session hygiene: back/forward cache and cross-tab logout sync ----

    // If this page is restored from the browser's back/forward cache (e.g.
    // via the Back button right after logging out), its JS does not re-run,
    // so a guard that only checked auth on the original load would never
    // catch a session that has since been cleared. Force a real reload so
    // every guard on the page re-evaluates against current storage.
    window.addEventListener("pageshow", function (event) {
        if (event.persisted && !getToken()) {
            window.location.reload();
        }
    });

    // localStorage changes made in one tab fire a "storage" event in every
    // *other* open tab. If the session was just cleared (logout, or a 401
    // handled elsewhere), reload so this tab's guards re-run too, instead of
    // leaving a second tab logged in and usable after the user logged out.
    window.addEventListener("storage", function (event) {
        if (event.key === TOKEN_KEY && !event.newValue) {
            window.location.reload();
        }
    });

    global.CV = {
        API_BASE_URL,
        getToken,
        getUser,
        setSession,
        clearSession,
        logout,
        requireAuth,
        apiFetch,
        downloadPdf,
        escapeHtml,
    };
})(window);
