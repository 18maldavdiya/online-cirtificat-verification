// ==========================================================================
// Shared API client for the whole frontend. Single source of truth for the
// backend base URL, auth-token storage, the fetch wrapper (JSON + auth
// header + error normalization), PDF download, and page route-guarding.
// Loaded before every page's own script via <script src=".../api.js"></script>.
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
        window.location.href = loginPath;
    }

    // Redirects to loginPath if there is no session, or if allowedRoles is
    // given and the logged-in user's role isn't in it. Returns the user object
    // so pages can use it immediately, or null if a redirect just happened.
    function requireAuth(allowedRoles, loginPath) {
        const token = getToken();
        const user = getUser();

        if (!token || !user) {
            window.location.href = loginPath;
            return null;
        }

        if (allowedRoles && allowedRoles.length && !allowedRoles.includes(user.role)) {
            window.location.href = loginPath;
            return null;
        }

        return user;
    }

    // JSON request wrapper. Attaches the bearer token automatically when
    // present. On 401 the stored session is cleared (token expired/invalid)
    // so the next requireAuth() call redirects to login; callers can also
    // catch err.status === 401 to redirect immediately from the current page.
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
            clearSession();
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
                clearSession();
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
    };
})(window);
