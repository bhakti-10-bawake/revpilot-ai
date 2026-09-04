/* =========================================================
   REVPILOT AI — ANALYTICS
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
       ANALYTICS PERIOD
       ===================================================== */

    const analyticsPeriod =
        document.getElementById(
            "analyticsPeriod"
        );


    if (analyticsPeriod) {

        analyticsPeriod.addEventListener(
            "change",
            () => {

                const selectedPeriod =
                    analyticsPeriod.value;

                updatePeriod(selectedPeriod);

            }
        );

    }


    function updatePeriod(period) {

        const trendArea =
            document.querySelector(
                ".trend-area"
            );

        const trendLine =
            document.querySelector(
                ".trend-line"
            );


        /*
         * The prototype currently uses synthetic
         * visual data. We change the chart shape
         * to reflect the selected period.
         */

        if (!trendArea || !trendLine) {
            return;
        }


        trendArea.style.opacity = "0.35";

        trendLine.style.opacity = "0.35";


        setTimeout(() => {

            if (period === "7") {

                trendArea.style.clipPath =
                    "polygon(0 65%, 16% 54%, 32% 60%, 48% 36%, 64% 46%, 82% 27%, 100% 10%, 100% 100%, 0 100%)";

                trendLine.style.clipPath =
                    "polygon(0 65%, 16% 54%, 32% 60%, 48% 36%, 64% 46%, 82% 27%, 100% 10%)";

            }

            else if (period === "90") {

                trendArea.style.clipPath =
                    "polygon(0 82%, 14% 75%, 28% 72%, 42% 61%, 56% 55%, 70% 42%, 84% 29%, 100% 20%, 100% 100%, 0 100%)";

                trendLine.style.clipPath =
                    "polygon(0 82%, 14% 75%, 28% 72%, 42% 61%, 56% 55%, 70% 42%, 84% 29%, 100% 20%)";

            }

            else {

                trendArea.style.clipPath =
                    "polygon(0 74%, 14% 65%, 28% 70%, 42% 47%, 56% 56%, 70% 34%, 84% 44%, 100% 16%, 100% 100%, 0 100%)";

                trendLine.style.clipPath =
                    "polygon(0 74%, 14% 65%, 28% 70%, 42% 47%, 56% 56%, 70% 34%, 84% 44%, 100% 16%)";

            }


            trendArea.style.opacity = "0.9";
            trendLine.style.opacity = "1";


            showToast(
                "Analytics updated",
                `Showing the last ${period} days of recovery intelligence.`
            );

        }, 220);

    }


    /* =====================================================
       EXPORT REPORT
       ===================================================== */

    const exportBtn =
        document.getElementById(
            "exportAnalyticsBtn"
        );


    if (exportBtn) {

        exportBtn.addEventListener(
            "click",
            exportAnalytics
        );

    }


    function exportAnalytics() {

        const report = [
            [
                "RevPilot AI Analytics Report"
            ],

            [],

            [
                "Metric",
                "Value"
            ],

            [
                "Revenue at Risk",
                "₹24.8L"
            ],

            [
                "AI-Recovered Revenue",
                "₹6.84L"
            ],

            [
                "Recovery Rate",
                "73.2%"
            ],

            [
                "Revenue Protected",
                "₹11.6L"
            ],

            [
                "Unnecessary Retries Reduced",
                "18.4%"
            ],

            [
                "Decision Speed Improvement",
                "2.7x"
            ],

            [
                "Decision Traceability",
                "100%"
            ]

        ];


        const csv =
            report
                .map(row =>
                    row
                        .map(value =>
                            `"${String(value)
                                .replaceAll('"', '""')}"`
                        )
                        .join(",")
                )
                .join("\n");


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(blob);


        const link =
            document.createElement("a");


        link.href =
            url;

        link.download =
            "revpilot-analytics-report.csv";


        document.body.appendChild(
            link
        );


        link.click();

        link.remove();


        URL.revokeObjectURL(
            url
        );


        showToast(
            "Report exported",
            "Analytics report downloaded as CSV."
        );

    }


    /* =====================================================
       GLOBAL SEARCH
       ===================================================== */

    const globalSearchBtn =
        document.getElementById(
            "globalSearchBtn"
        );


    if (globalSearchBtn) {

        globalSearchBtn.addEventListener(
            "click",
            () => {

                showToast(
                    "Global search",
                    "Search will connect to transactions and customers."
                );

            }
        );

    }


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
                    "No new critical analytics alerts."
                );

            }
        );

    }


    /* =====================================================
       METRIC CARD INTERACTIONS
       ===================================================== */

    document
        .querySelectorAll(".metric-card")
        .forEach((card) => {

            card.addEventListener(
                "click",
                () => {

                    card.classList.add(
                        "metric-highlight"
                    );


                    setTimeout(() => {

                        card.classList.remove(
                            "metric-highlight"
                        );

                    }, 500);

                }
            );

        });


    /* =====================================================
       AGENT IMPACT INTERACTION
       ===================================================== */

    document
        .querySelectorAll(".agent-impact-item")
        .forEach((item) => {

            item.addEventListener(
                "click",
                () => {

                    const agentName =
                        item.querySelector(
                            ".agent-name-wrap strong"
                        )?.textContent.trim();


                    if (!agentName) {
                        return;
                    }


                    showToast(
                        agentName,
                        "Agent contribution details are available in the AI Boardroom."
                    );

                }
            );

        });


    /* =====================================================
       FAILURE BAR INTERACTION
       ===================================================== */

    document
        .querySelectorAll(".bar-row")
        .forEach((row) => {

            row.addEventListener(
                "click",
                () => {

                    const failure =
                        row.querySelector(
                            ".bar-label span"
                        )?.textContent.trim();


                    if (!failure) {
                        return;
                    }


                    showToast(
                        failure,
                        "Failure-specific recovery analysis will appear with live data."
                    );

                }
            );

        });


    /* =====================================================
       TOAST
       ===================================================== */

    function showToast(
        title,
        message
    ) {

        const existingToast =
            document.querySelector(
                ".revpilot-toast"
            );


        if (existingToast) {
            existingToast.remove();
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
       EXTRA MICRO-INTERACTION STYLE
       ===================================================== */

    const interactionStyle =
        document.createElement("style");


    interactionStyle.textContent = `

        .metric-card {
            cursor: pointer;
        }

        .agent-impact-item,
        .bar-row {
            cursor: pointer;
        }

        .metric-highlight {
            transform: translateY(-3px) !important;

            border-color: #cbd6f8 !important;

            box-shadow:
                0 0 0 3px rgba(49, 94, 251, 0.06),
                0 8px 22px rgba(16, 24, 40, 0.06) !important;
        }

        .agent-impact-item,
        .bar-row {
            transition:
                background 0.18s ease,
                transform 0.18s ease;
        }

        .agent-impact-item:hover,
        .bar-row:hover {
            transform: translateX(2px);
        }

    `;


    document.head.appendChild(
        interactionStyle
    );


    /* =====================================================
       INITIALIZE
       ===================================================== */

    console.log(
        "RevPilot Analytics initialized successfully."
    );

});