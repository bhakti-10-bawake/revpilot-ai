/* =========================================================
   REVPILOT AI — DASHBOARD
   Live Backend Dashboard
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // CONFIG
    // =====================================================

    const API_BASE_URL = "http://127.0.0.1:8000";


    // =====================================================
    // AUTHENTICATION
    // =====================================================

    const authenticated =
        sessionStorage.getItem(
            "revpilot_authenticated"
        ) === "true";


    if (!authenticated) {
        window.location.href = "index.html";
        return;
    }


    // =====================================================
    // PAGE ROUTES
    // =====================================================

    const pages = {

        overview: "dashboard.html",

        recovery: "recovery.html",

        "batch-recovery":
            "batch-recovery.html",

        transactions:
            "transactions.html",

        customers:
            "customers.html",

        boardroom:
            "boardroom.html",

        analytics:
            "analytics.html",

        audit:
            "audit.html",

        settings:
            "settings.html"

    };


    // =====================================================
    // ELEMENTS
    // =====================================================

    const runRecoveryButton =
        document.getElementById(
            "runRecoveryButton"
        );

    const openBoardroomButton =
        document.getElementById(
            "openBoardroom"
        );

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );

    const searchButton =
        document.getElementById(
            "dashboardSearchButton"
        );

    const notificationButton =
        document.getElementById(
            "dashboardNotificationButton"
        );

    const periodSelect =
        document.querySelector(
            ".period-select"
        );

    const dashboardBatchButton =
        document.getElementById(
            "dashboardBatchButton"
        );

    const dashboardQueueButton =
        document.getElementById(
            "dashboardQueueButton"
        );


    // =====================================================
    // SIDEBAR NAVIGATION
    // =====================================================

    document
        .querySelectorAll(".nav-item")
        .forEach((item) => {

            item.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    const page =
                        item.dataset.page;


                    if (
                        page &&
                        pages[page]
                    ) {

                        window.location.href =
                            pages[page];

                    }

                }
            );

        });


    // =====================================================
    // LOGOUT
    // =====================================================

    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            () => {

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

                sessionStorage.removeItem(
                    "last_boardroom_result"
                );

                sessionStorage.removeItem(
                    "last_batch_result"
                );

                window.location.href =
                    "index.html";

            }
        );

    }


    // =====================================================
    // HELPERS
    // =====================================================

    function formatNumber(value) {

        const number =
            Number(value);


        if (!Number.isFinite(number)) {
            return "0";
        }


        return number.toLocaleString(
            "en-IN"
        );

    }


    function formatCurrency(value) {

        const amount =
            Number(value);


        if (!Number.isFinite(amount)) {
            return "₹0";
        }


        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(amount);

    }


    function formatPercent(value) {

        const number =
            Number(value);


        if (!Number.isFinite(number)) {
            return "—";
        }


        return `${number.toFixed(2)}%`;

    }


    function escapeHtml(value) {

        return String(
            value ?? ""
        )
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );

    }


    // =====================================================
    // LOAD LIVE BATCH DATA
    // =====================================================

    async function loadDashboardData() {

        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/batch-recovery`
                );


            if (!response.ok) {

                throw new Error(
                    `Backend returned HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            // Save latest result

            sessionStorage.setItem(
                "last_batch_result",
                JSON.stringify(data)
            );


            // Update dashboard

            updateDashboard(
                data
            );


            console.log(
                "RevPilot Dashboard: live batch data loaded."
            );

        }

        catch (error) {

            console.error(
                "Dashboard API error:",
                error
            );


            // ---------------------------------------------
            // FALLBACK TO LAST STORED BATCH
            // ---------------------------------------------

            try {

                const stored =
                    sessionStorage.getItem(
                        "last_batch_result"
                    );


                if (stored) {

                    const data =
                        JSON.parse(
                            stored
                        );


                    updateDashboard(
                        data
                    );

                }

                else {

                    showToast(
                        "Backend unavailable",
                        "Start FastAPI to load live recovery data."
                    );

                }

            }

            catch (fallbackError) {

                console.error(
                    "Dashboard fallback error:",
                    fallbackError
                );

            }

        }

    }


    // =====================================================
    // UPDATE DASHBOARD
    // =====================================================

    function updateDashboard(
        data
    ) {

        if (!data) {
            return;
        }


        const summary =
            data.summary || {};


        const outcomes =
            data.outcomes || {};


        // =================================================
        // REVENUE AT RISK
        // =================================================

        const revenueAtRisk =
            document.getElementById(
                "dashboardRevenueAtRisk"
            );


        if (revenueAtRisk) {

            revenueAtRisk.textContent =
                formatCurrency(
                    summary.revenue_at_risk
                );

        }


        // =================================================
        // SIMULATED RECOVERY
        // =================================================

        const recoveredRevenue =
            document.getElementById(
                "dashboardRecoveredRevenue"
            );


        if (recoveredRevenue) {

            recoveredRevenue.textContent =
                formatCurrency(
                    summary.recovered_revenue
                );

        }


        // =================================================
        // FAILED PAYMENTS
        // =================================================

        const failedPayments =
            document.getElementById(
                "dashboardFailedPayments"
            );


        if (failedPayments) {

            failedPayments.textContent =
                formatNumber(
                    summary.failed_payments
                );

        }


        // =================================================
        // RECOVERY RATE
        // =================================================

        const recoveryRate =
            document.getElementById(
                "dashboardRecoveryRate"
            );


        if (recoveryRate) {

            recoveryRate.textContent =
                formatPercent(
                    summary.recovery_rate
                );

        }


        // =================================================
        // PAGE DESCRIPTION
        // =================================================

        const pageDescription =
            document.querySelector(
                ".page-heading p"
            );


        if (pageDescription) {

            pageDescription.textContent =
                `${formatNumber(
                    summary.failed_payments || 0
                )} failed-payment cases are being evaluated through the RevPilot recovery engine.`;

        }


        // =================================================
        // AI STATUS
        // =================================================

        const aiTitle =
            document.getElementById(
                "dashboardAiTitle"
            );


        const aiDescription =
            document.getElementById(
                "dashboardAiDescription"
            );


        if (aiTitle) {

            aiTitle.textContent =
                "Live recovery analysis is ready.";

        }


        if (aiDescription) {

            aiDescription.textContent =
                `${formatNumber(
                    summary.failed_payments || 0
                )} failed payments were evaluated under the current recovery policy.`;

        }


        // =================================================
        // RECOVERY QUEUE BADGE
        // =================================================

        const recoveryBadge =
            document.querySelector(
                ".nav-item[data-page='recovery'] .nav-badge"
            );


        if (recoveryBadge) {

            const reviewCount =
                Number(
                    outcomes.review
                ) || 0;


            recoveryBadge.textContent =
                formatNumber(
                    reviewCount
                );

        }


        // =================================================
        // LIVE BATCH BADGE
        // =================================================

        addBatchBadge();

    }


    // =====================================================
    // BATCH BADGE
    // =====================================================

    function addBatchBadge() {

        const heading =
            document.querySelector(
                ".page-heading"
            );


        if (!heading) {
            return;
        }


        if (
            heading.querySelector(
                ".batch-live-badge"
            )
        ) {

            return;

        }


        const badge =
            document.createElement(
                "span"
            );


        badge.className =
            "batch-live-badge";


        badge.textContent =
            "LIVE BATCH DATA";


        badge.style.cssText = `
            display: inline-flex;
            align-items: center;
            width: fit-content;
            margin-top: 10px;
            padding: 6px 9px;
            border-radius: 20px;
            background: #eef2ff;
            color: #315efb;
            font-size: 8px;
            font-weight: 700;
            letter-spacing: 0.4px;
        `;


        const container =
            heading.firstElementChild;


        if (container) {

            container.appendChild(
                badge
            );

        }

    }


    // =====================================================
    // RUN RECOVERY ANALYSIS
    // =====================================================

    if (runRecoveryButton) {

        runRecoveryButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "batch-recovery.html";

            }
        );

    }


    // =====================================================
    // OPEN BATCH RECOVERY
    // =====================================================

    if (dashboardBatchButton) {

        dashboardBatchButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "batch-recovery.html";

            }
        );

    }


    // =====================================================
    // RECOVERY QUEUE OPEN BUTTON
    // =====================================================

    if (dashboardQueueButton) {

        dashboardQueueButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "batch-recovery.html";

            }
        );

    }


    // =====================================================
    // OPEN AI BOARDROOM
    // =====================================================

    if (openBoardroomButton) {

        openBoardroomButton.addEventListener(
            "click",
            () => {

                let selected =
                    sessionStorage.getItem(
                        "selected_transaction"
                    );


                if (!selected) {

                    selected =
                        "TXN-00001";


                    sessionStorage.setItem(
                        "selected_transaction",
                        selected
                    );

                }


                window.location.href =
                    "boardroom.html";

            }
        );

    }


    // =====================================================
    // PERIOD SELECTOR
    // =====================================================

    if (periodSelect) {

        periodSelect.addEventListener(
            "change",
            () => {

                showToast(
                    "View updated",
                    `Performance view changed to ${periodSelect.value}.`
                );

            }
        );

    }


    // =====================================================
    // SEARCH
    // =====================================================

    if (searchButton) {

        searchButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "transactions.html";

            }
        );

    }


    // =====================================================
    // NOTIFICATIONS
    // =====================================================

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            () => {

                const stored =
                    sessionStorage.getItem(
                        "last_batch_result"
                    );


                if (!stored) {

                    showToast(
                        "No batch yet",
                        "Run Batch Recovery to generate live portfolio analysis."
                    );

                    return;

                }


                try {

                    const data =
                        JSON.parse(
                            stored
                        );


                    const summary =
                        data.summary || {};


                    showToast(
                        "Latest recovery analysis",
                        `${formatCurrency(
                            summary.recovered_revenue
                        )} simulated recovery from the latest batch.`
                    );

                }

                catch {

                    showToast(
                        "Recovery analysis available",
                        "The latest batch result is available."
                    );

                }

            }
        );

    }


    // =====================================================
    // TOAST
    // =====================================================

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
                    ${escapeHtml(
                        title
                    )}
                </strong>


                <span>
                    ${escapeHtml(
                        message
                    )}
                </span>

            </div>


            <button
                type="button"
                class="toast-close"
                aria-label="Close"
            >
                ×
            </button>

        `;


        document.body.appendChild(
            toast
        );


        requestAnimationFrame(
            () => {

                toast.classList.add(
                    "show"
                );

            }
        );


        const closeButton =
            toast.querySelector(
                ".toast-close"
            );


        if (closeButton) {

            closeButton.addEventListener(
                "click",
                () => {

                    toast.classList.remove(
                        "show"
                    );


                    setTimeout(
                        () => toast.remove(),
                        250
                    );

                }
            );

        }


        setTimeout(
            () => {

                if (
                    document.body.contains(
                        toast
                    )
                ) {

                    toast.classList.remove(
                        "show"
                    );


                    setTimeout(
                        () => toast.remove(),
                        250
                    );

                }

            },
            3500
        );

    }


    // =====================================================
    // INITIAL LOAD
    // =====================================================

    loadDashboardData();


    console.log(
        "RevPilot Dashboard initialized."
    );

});