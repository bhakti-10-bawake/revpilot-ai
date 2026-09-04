/* =========================================================
   REV PILOT AI
   Login Controller
   ========================================================= */

const loginForm = document.getElementById("loginForm");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const forgotPassword = document.getElementById("forgotPassword");
const ssoButton = document.getElementById("ssoButton");


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

if (togglePassword) {
    togglePassword.addEventListener("click", () => {

        const isPassword =
            passwordInput.type === "password";

        passwordInput.type =
            isPassword ? "text" : "password";

        togglePassword.textContent =
            isPassword ? "Hide" : "Show";

    });
}


/* =========================================================
   LOGIN
   ========================================================= */

if (loginForm) {

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            passwordInput.value.trim();

        if (!email || !password) {
            return;
        }

        /*
         * Prototype authentication.
         *
         * This is intentionally frontend-only for the
         * Buildathon demo. A production version would
         * authenticate against a secure backend/SSO provider.
         */

        sessionStorage.setItem(
            "revpilot_authenticated",
            "true"
        );

        sessionStorage.setItem(
            "revpilot_user",
            email
        );

        /*
         * Move into the application.
         *
         * dashboard.html will be created in the next step.
         */

        window.location.href = "dashboard.html";

    });

}


/* =========================================================
   SSO BUTTON
   ========================================================= */

if (ssoButton) {

    ssoButton.addEventListener("click", () => {

        /*
         * Placeholder for enterprise SSO.
         * Production implementation can use
         * Google Workspace / Microsoft Entra ID / Okta.
         */

        alert(
            "Enterprise SSO will be connected in the production version."
        );

    });

}


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

if (forgotPassword) {

    forgotPassword.addEventListener("click", () => {

        alert(
            "Please contact your workspace administrator to reset your access."
        );

    });

}