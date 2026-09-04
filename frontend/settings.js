/* =========================================================
   REVPILOT AI — SETTINGS
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       AUTHENTICATION
       ===================================================== */

    const authenticated =
        sessionStorage.getItem("revpilot_authenticated") === "true";

    if (!authenticated) {
        window.location.href = "index.html";
        return;
    }


    /* =====================================================
       NAVIGATION
       ===================================================== */

    const pages = {
        overview: "dashboard.html",
        recovery: "recovery.html",
        transactions: "transactions.html",
        customers: "customers.html",
        boardroom: "boardroom.html",
        analytics: "analytics.html",
        audit: "audit.html",
        settings: "settings.html"
    };


    document
        .querySelectorAll(".nav-item")
        .forEach((item) => {

            item.addEventListener("click", (event) => {

                event.preventDefault();

                const page =
                    item.dataset.page;

                if (page && pages[page]) {
                    window.location.href =
                        pages[page];
                }

            });

        });


    /* =====================================================
       LOGOUT
       ===================================================== */

    const logoutBtn =
        document.getElementById("logoutBtn");


    if (logoutBtn) {

        logoutBtn.addEventListener("click", () => {

            sessionStorage.removeItem(
                "revpilot_authenticated"
            );

            sessionStorage.removeItem(
                "revpilot_user"
            );

            sessionStorage.removeItem(
                "selected_transaction"
            );

            sessionStorage.removeItem(
                "selected_customer"
            );

            window.location.href =
                "index.html";

        });

    }


    /* =====================================================
       SETTINGS NAVIGATION
       ===================================================== */

    const settingsNavItems =
        document.querySelectorAll(
            ".settings-nav-item"
        );

    const settingsSections =
        document.querySelectorAll(
            ".settings-section"
        );


    settingsNavItems.forEach((item) => {

        item.addEventListener("click", () => {

            const selectedSection =
                item.dataset.section;


            settingsNavItems.forEach(
                (navItem) => {

                    navItem.classList.remove(
                        "active"
                    );

                }
            );


            item.classList.add(
                "active"
            );


            settingsSections.forEach(
                (section) => {

                    const sectionName =
                        section.dataset.sectionContent;

                    section.classList.toggle(
                        "active",
                        sectionName === selectedSection
                    );

                }
            );

        });

    });


    /* =====================================================
       SETTINGS REFERENCES
       ===================================================== */

    const automaticRecovery =
        document.getElementById(
            "automaticRecovery"
        );

    const maxRetries =
        document.getElementById(
            "maxRetries"
        );

    const retryWindow =
        document.getElementById(
            "retryWindow"
        );

    const blockHighRisk =
        document.getElementById(
            "blockHighRisk"
        );

    const maxDiscount =
        document.getElementById(
            "maxDiscount"
        );

    const minimumRecovery =
        document.getElementById(
            "minimumRecovery"
        );

    const financialValidation =
        document.getElementById(
            "financialValidation"
        );


    /* =====================================================
       LOAD SAVED SETTINGS
       ===================================================== */

    function loadSettings() {

        try {

            const savedSettings =
                JSON.parse(
                    localStorage.getItem(
                        "revpilot_settings"
                    )
                );


            if (!savedSettings) {
                return;
            }


            if (
                automaticRecovery &&
                typeof savedSettings.automaticRecovery ===
                    "boolean"
            ) {

                automaticRecovery.checked =
                    savedSettings.automaticRecovery;

            }


            if (
                maxRetries &&
                savedSettings.maxRetries
            ) {

                maxRetries.value =
                    savedSettings.maxRetries;

            }


            if (
                retryWindow &&
                savedSettings.retryWindow
            ) {

                retryWindow.value =
                    savedSettings.retryWindow;

            }


            if (
                blockHighRisk &&
                typeof savedSettings.blockHighRisk ===
                    "boolean"
            ) {

                blockHighRisk.checked =
                    savedSettings.blockHighRisk;

            }


            if (
                maxDiscount &&
                savedSettings.maxDiscount !== undefined
            ) {

                maxDiscount.value =
                    savedSettings.maxDiscount;

            }


            if (
                minimumRecovery &&
                savedSettings.minimumRecovery !== undefined
            ) {

                minimumRecovery.value =
                    savedSettings.minimumRecovery;

            }


            if (
                financialValidation &&
                typeof savedSettings.financialValidation ===
                    "boolean"
            ) {

                financialValidation.checked =
                    savedSettings.financialValidation;

            }

        }

        catch (error) {

            console.error(
                "Could not load RevPilot settings:",
                error
            );

        }

    }


    loadSettings();


    /* =====================================================
       COLLECT SETTINGS
       ===================================================== */

    function collectSettings() {

        return {

            automaticRecovery:
                automaticRecovery
                    ? automaticRecovery.checked
                    : true,

            maxRetries:
                maxRetries
                    ? maxRetries.value
                    : "2",

            retryWindow:
                retryWindow
                    ? retryWindow.value
                    : "12",

            blockHighRisk:
                blockHighRisk
                    ? blockHighRisk.checked
                    : true,

            maxDiscount:
                maxDiscount
                    ? Number(maxDiscount.value)
                    : 10,

            minimumRecovery:
                minimumRecovery
                    ? Number(minimumRecovery.value)
                    : 70,

            financialValidation:
                financialValidation
                    ? financialValidation.checked
                    : true

        };

    }


    /* =====================================================
       SAVE SETTINGS
       ===================================================== */

    const saveBtn =
        document.getElementById(
            "saveSettingsBtn"
        );


    if (saveBtn) {

        saveBtn.addEventListener(
            "click",
            () => {

                const settings =
                    collectSettings();


                /* -----------------------------------------
                   Validation
                   ----------------------------------------- */

                if (
                    settings.maxDiscount < 0 ||
                    settings.maxDiscount > 100
                ) {

                    showToast(
                        "Invalid discount",
                        "Maximum discount must be between 0% and 100%."
                    );

                    return;

                }


                if (
                    settings.minimumRecovery < 0 ||
                    settings.minimumRecovery > 100
                ) {

                    showToast(
                        "Invalid threshold",
                        "Minimum recovery must be between 0% and 100%."
                    );

                    return;

                }


                /* -----------------------------------------
                   Save
                   ----------------------------------------- */

                localStorage.setItem(
                    "revpilot_settings",
                    JSON.stringify(settings)
                );


                /* -----------------------------------------
                   UI feedback
                   ----------------------------------------- */

                const originalHTML =
                    saveBtn.innerHTML;


                saveBtn.disabled =
                    true;


                saveBtn.innerHTML =
                    "✓ Saved";


                setTimeout(() => {

                    saveBtn.disabled =
                        false;

                    saveBtn.innerHTML =
                        originalHTML;

                }, 1200);


                showToast(
                    "Settings saved",
                    "RevPilot configuration updated successfully."
                );

            }
        );

    }


    /* =====================================================
       RESET SETTINGS
       ===================================================== */

    const resetBtn =
        document.getElementById(
            "resetSettingsBtn"
        );


    if (resetBtn) {

        resetBtn.addEventListener(
            "click",
            () => {

                const confirmed =
                    window.confirm(
                        "Reset RevPilot settings to the recommended defaults?"
                    );


                if (!confirmed) {
                    return;
                }


                localStorage.removeItem(
                    "revpilot_settings"
                );


                /* Default values */

                if (automaticRecovery) {
                    automaticRecovery.checked = true;
                }

                if (maxRetries) {
                    maxRetries.value = "2";
                }

                if (retryWindow) {
                    retryWindow.value = "12";
                }

                if (blockHighRisk) {
                    blockHighRisk.checked = true;
                }

                if (maxDiscount) {
                    maxDiscount.value = "10";
                }

                if (minimumRecovery) {
                    minimumRecovery.value = "70";
                }

                if (financialValidation) {
                    financialValidation.checked = true;
                }


                showToast(
                    "Settings reset",
                    "Recommended RevPilot defaults have been restored."
                );

            }
        );

    }


    /* =====================================================
       GUARDRAIL LIVE PREVIEW
       ===================================================== */

    function updateGuardrailPreview() {

        const callout =
            document.querySelector(
                ".guardrail-callout"
            );


        if (!callout) {
            return;
        }


        const enabled =
            financialValidation
                ? financialValidation.checked
                : true;


        const title =
            callout.querySelector(
                "strong"
            );

        const description =
            callout.querySelector(
                "span"
            );

        const icon =
            callout.querySelector(
                ".callout-icon"
            );


        if (enabled) {

            if (title) {
                title.textContent =
                    "Finance Guardrail enabled";
            }

            if (description) {
                description.textContent =
                    "Uneconomic recovery offers will be rejected before execution.";
            }

            if (icon) {
                icon.textContent =
                    "✓";
            }

            callout.classList.remove(
                "guardrail-disabled"
            );

        }

        else {

            if (title) {
                title.textContent =
                    "Finance Guardrail disabled";
            }

            if (description) {
                description.textContent =
                    "Financial validation is currently disabled in this workspace.";
            }

            if (icon) {
                icon.textContent =
                    "!";
            }

            callout.classList.add(
                "guardrail-disabled"
            );

        }

    }


    if (financialValidation) {

        financialValidation.addEventListener(
            "change",
            updateGuardrailPreview
        );

    }


    updateGuardrailPreview();


    /* =====================================================
       NOTIFICATIONS
       ===================================================== */

    const notificationBtn =
        document.getElementById(
            "notificationBtn"
        );


    if (notificationBtn) {

        notificationBtn.addEventListener(
            "click",
            () => {

                showToast(
                    "Notifications",
                    "No new critical configuration alerts."
                );

            }
        );

    }


    /* =====================================================
       TOAST
       ===================================================== */

    function showToast(
        title,
        message
    ) {

        const existing =
            document.querySelector(
                ".revpilot-toast"
            );


        if (existing) {
            existing.remove();
        }


        const toast =
            document.createElement(
                "div"
            );


        toast.className =
            "revpilot-toast";


        toast.innerHTML = `
            <div class="toast-icon">
                ✓
            </div>

            <div class="toast-content">

                <strong>
                    ${title}
                </strong>

                <span>
                    ${message}
                </span>

            </div>

            <button
                class="toast-close"
                type="button"
                aria-label="Close"
            >
                ×
            </button>
        `;


        document.body.appendChild(
            toast
        );


        requestAnimationFrame(() => {

            toast.classList.add(
                "show"
            );

        });


        const closeButton =
            toast.querySelector(
                ".toast-close"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                () => {

                    removeToast(
                        toast
                    );

                }
            );

        }


        setTimeout(() => {

            removeToast(
                toast
            );

        }, 3500);

    }


    function removeToast(
        toast
    ) {

        if (!toast) {
            return;
        }


        toast.classList.remove(
            "show"
        );


        setTimeout(() => {

            if (toast.parentNode) {
                toast.remove();
            }

        }, 250);

    }


    /* =====================================================
       EXTRA UI STYLE
       ===================================================== */

    const style =
        document.createElement(
            "style"
        );


    style.textContent = `

        .guardrail-callout.guardrail-disabled {
            border-color: #f0d7da;
            background: #fff8f9;
        }

        .guardrail-callout.guardrail-disabled
        .callout-icon {
            background: #fff0f2;
            color: #c83d4d;
        }

    `;


    document.head.appendChild(
        style
    );


    /* =====================================================
       INITIALIZE
       ===================================================== */

    console.log(
        "RevPilot Settings initialized successfully."
    );

});