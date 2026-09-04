/* =========================================================
   REVPILOT AI — AUDIT TRAIL
   Backend Audit API Integration
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const API_BASE_URL = "http://127.0.0.1:8000";

    let auditEvents = [];


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const timeline =
        document.getElementById("auditTimeline");

    const searchInput =
        document.getElementById("auditSearch");

    const typeFilter =
        document.getElementById("auditTypeFilter");

    const statusFilter =
        document.getElementById("auditStatusFilter");

    const periodFilter =
        document.getElementById("auditPeriodFilter");

    const emptyState =
        document.getElementById("emptyAuditState");

    const exportButton =
        document.getElementById("exportAuditBtn");

    const logoutButton =
        document.getElementById("logoutBtn");

    const globalSearchButton =
        document.getElementById("globalSearchBtn");

    const notificationButton =
        document.getElementById("notificationBtn");


    /* =====================================================
       AUTHENTICATION
       ===================================================== */

    const authenticated =
        sessionStorage.getItem(
            "revpilot_authenticated"
        ) === "true";


    if (!authenticated) {

        /*
         * Temporarily disabled for prototype testing.
         *
         * Enable when final login flow is locked.
         */

        // window.location.href = "index.html";

    }


    /* =====================================================
       NAVIGATION
       ===================================================== */

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


    /* =====================================================
       LOGOUT
       ===================================================== */

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


    /* =====================================================
       HELPERS
       ===================================================== */

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


    function formatLabel(value) {

        return String(
            value ?? ""
        )
        .replaceAll(
            "_",
            " "
        )
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

    }


    function formatCurrency(value) {

        const number =
            Number(value);


        if (!Number.isFinite(number)) {
            return "₹0";
        }


        return new Intl.NumberFormat(
            "en-IN",
            {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0
            }
        ).format(number);

    }


    function formatConfidence(value) {

        const number =
            Number(value);


        if (!Number.isFinite(number)) {
            return "—";
        }


        const percentage =
            number <= 1
                ? number * 100
                : number;


        return `${Math.round(
            percentage
        )}%`;

    }


    function formatDateTime(
        timestamp
    ) {

        if (!timestamp) {

            return {
                time: "—",
                date: "—"
            };

        }


        const date =
            new Date(timestamp);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return {
                time: "—",
                date: "—"
            };

        }


        return {

            time:
                date.toLocaleTimeString(
                    "en-IN",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false
                    }
                ),

            date:
                date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                )

        };

    }


    function normalize(value) {

        return String(
            value ?? ""
        )
        .toLowerCase()
        .trim();

    }


    /* =====================================================
       MAP BACKEND EVENT TO UI EVENT
       ===================================================== */

    function mapAuditEvent(
        event
    ) {

        const details =
            event.details || {};


        const eventType =
            normalize(
                event.event_type
            );


        let uiType =
            "orchestrator";


        let marker =
            "✦";


        let markerClass =
            "orchestrator";


        if (
            eventType.includes(
                "batch"
            )
        ) {

            uiType =
                "orchestrator";

            marker =
                "B";

            markerClass =
                "orchestrator";

        }

        else if (
            eventType.includes(
                "recovery_decision"
            )
        ) {

            uiType =
                "orchestrator";

            marker =
                "✦";

            markerClass =
                "orchestrator";

        }


        const finalAction =
            details.final_action;


        const expectedRecovery =
            details.expected_recovery;


        const confidence =
            details.confidence;


        let metaOne =
            "";


        let metaTwo =
            "";


        if (
            event.event_type ===
            "BATCH_RECOVERY"
        ) {

            metaOne =
                `${Number(
                    details.total_transactions || 0
                ).toLocaleString("en-IN")} transactions`;

            metaTwo =
                `Modeled recovery: ${formatCurrency(
                    details.recovered_revenue
                )}`;

        }

        else {

            metaOne =
                finalAction
                    ? `Action: ${formatLabel(
                        finalAction
                    )}`
                    : "Recovery decision";

            metaTwo =
                confidence !== undefined
                    ? `Confidence: ${formatConfidence(
                        confidence
                    )}`
                    : "";

        }


        return {

            id:
                event.audit_id,

            type:
                uiType,

            status:
                normalize(
                    event.status || "completed"
                ),

            period:
                "all",

            timestamp:
                event.timestamp,

            title:
                event.title ||
                "Audit event",

            transactionId:
                event.transaction_id ||
                "—",

            description:
                event.description ||
                "Audit event recorded by RevPilot.",

            metaOne,
            metaTwo,

            marker,
            markerClass,

            searchText:
                normalize(
                    [
                        event.title,
                        event.description,
                        event.transaction_id,
                        event.event_type,
                        finalAction,
                        details.guardrail_status,
                        details.total_transactions
                    ].join(" ")
                )

        };

    }


    /* =====================================================
       LOAD AUDIT EVENTS
       ===================================================== */

    async function loadAuditEvents() {

        showLoading();


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/audit`
                );


            if (!response.ok) {

                throw new Error(
                    `Audit API returned HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            auditEvents =
                Array.isArray(
                    data.events
                )
                    ? data.events.map(
                        mapAuditEvent
                    )
                    : [];


            /*
             * If backend has no events yet, we don't
             * invent new ones. This is important for
             * audit integrity.
             */

            renderAudit();


            updateMetrics();


            console.log(
                `Loaded ${auditEvents.length} backend audit events.`
            );

        }

        catch (error) {

            console.error(
                "Audit API error:",
                error
            );


            auditEvents = [];


            showError(
                error.message
            );

        }

    }


    /* =====================================================
       RENDER AUDIT
       ===================================================== */

    function renderAudit() {

        if (!timeline) {
            return;
        }


        timeline.innerHTML = "";


        if (
            !auditEvents.length
        ) {

            showEmptyState();

            return;

        }


        auditEvents
            .forEach(
                (event) => {

                    const time =
                        formatDateTime(
                            event.timestamp
                        );


                    const article =
                        document.createElement(
                            "article"
                        );


                    article.className =
                        "audit-event";


                    article.dataset.type =
                        event.type;


                    article.dataset.status =
                        event.status;


                    article.dataset.period =
                        event.period;


                    article.dataset.search =
                        event.searchText;


                    article.dataset.auditId =
                        event.id;


                    article.innerHTML = `

                        <div class="event-time">

                            <strong>
                                ${escapeHtml(
                                    time.time
                                )}
                            </strong>

                            <span>
                                ${escapeHtml(
                                    time.date
                                )}
                            </span>

                        </div>


                        <div
                            class="event-marker ${escapeHtml(
                                event.markerClass
                            )}"
                        >
                            ${escapeHtml(
                                event.marker
                            )}
                        </div>


                        <div class="event-content">


                            <div class="event-header">


                                <div>

                                    <strong>
                                        ${escapeHtml(
                                            event.title
                                        )}
                                    </strong>


                                    <span>
                                        ${escapeHtml(
                                            event.transactionId
                                        )}
                                    </span>

                                </div>


                                <span
                                    class="event-status ${getStatusClass(
                                        event.status
                                    )}"
                                >
                                    ${escapeHtml(
                                        getStatusLabel(
                                            event.status
                                        )
                                    )}
                                </span>


                            </div>


                            <p>
                                ${escapeHtml(
                                    event.description
                                )}
                            </p>


                            <div class="event-meta">

                                <span>
                                    ${escapeHtml(
                                        event.metaOne
                                    )}
                                </span>


                                <span>
                                    ${escapeHtml(
                                        event.metaTwo
                                    )}
                                </span>

                            </div>


                        </div>

                    `;


                    timeline.appendChild(
                        article
                    );

                }
            );


        filterAuditEvents();

    }


    /* =====================================================
       STATUS HELPERS
       ===================================================== */

    function getStatusClass(
        status
    ) {

        const value =
            normalize(status);


        if (
            value.includes("blocked")
        ) {

            return "blocked";

        }


        if (
            value.includes("review")
        ) {

            return "review";

        }


        return "approved";

    }


    function getStatusLabel(
        status
    ) {

        const value =
            normalize(status);


        if (
            value.includes("blocked")
        ) {

            return "Blocked";

        }


        if (
            value.includes("review")
        ) {

            return "Review";

        }


        return "Completed";

    }


    /* =====================================================
       FILTERS
       ===================================================== */

    function filterAuditEvents() {

        if (!timeline) {
            return;
        }


        const search =
            searchInput
                ? normalize(
                    searchInput.value
                )
                : "";


        const selectedType =
            typeFilter
                ? normalize(
                    typeFilter.value
                )
                : "all";


        const selectedStatus =
            statusFilter
                ? normalize(
                    statusFilter.value
                )
                : "all";


        const selectedPeriod =
            periodFilter
                ? normalize(
                    periodFilter.value
                )
                : "all";


        let visible =
            0;


        document
            .querySelectorAll(
                ".audit-event"
            )
            .forEach(
                (event) => {

                    const eventType =
                        normalize(
                            event.dataset.type
                        );


                    const eventStatus =
                        normalize(
                            event.dataset.status
                        );


                    const searchData =
                        normalize(
                            event.dataset.search
                        );


                    const matchesSearch =
                        !search ||
                        searchData.includes(
                            search
                        );


                    /*
                     * Type:
                     *
                     * Transaction / Agent / Guardrail /
                     * Orchestrator.
                     *
                     * Backend currently records the
                     * completed recovery decision and
                     * batch event directly.
                     */

                    const matchesType =
                        selectedType ===
                            "all" ||
                        eventType ===
                            selectedType;


                    const matchesStatus =
                        selectedStatus ===
                            "all" ||
                        eventStatus.includes(
                            selectedStatus
                        );


                    let matchesPeriod =
                        true;


                    if (
                        selectedPeriod !==
                        "all"
                    ) {

                        const timestamp =
                            event
                                .querySelector(
                                    ".event-time span"
                                )
                                ?.textContent ||
                            "";


                        /*
                         * Backend timestamp filtering
                         * is handled below using the
                         * original auditEvents array.
                         */

                        const originalEvent =
                            auditEvents.find(
                                item =>
                                    item.id ===
                                    event.dataset.auditId
                            );


                        if (
                            originalEvent &&
                            originalEvent.timestamp
                        ) {

                            const eventDate =
                                new Date(
                                    originalEvent.timestamp
                                );


                            const now =
                                new Date();


                            const difference =
                                now.getTime() -
                                eventDate.getTime();


                            const day =
                                24 *
                                60 *
                                60 *
                                1000;


                            if (
                                selectedPeriod ===
                                "today"
                            ) {

                                matchesPeriod =
                                    eventDate.toDateString() ===
                                    now.toDateString();

                            }


                            else if (
                                selectedPeriod ===
                                "7days"
                            ) {

                                matchesPeriod =
                                    difference >= 0 &&
                                    difference <=
                                        7 * day;

                            }


                            else if (
                                selectedPeriod ===
                                "30days"
                            ) {

                                matchesPeriod =
                                    difference >= 0 &&
                                    difference <=
                                        30 * day;

                            }

                        }

                    }


                    const shouldShow =
                        matchesSearch &&
                        matchesType &&
                        matchesStatus &&
                        matchesPeriod;


                    event.style.display =
                        shouldShow
                            ? ""
                            : "grid";


                    if (
                        shouldShow
                    ) {

                        visible++;

                    }

                }
            );


        if (visible === 0) {

            showEmptyState();

        }

        else {

            hideEmptyState();

        }

    }


    /* =====================================================
       EMPTY STATE
       ===================================================== */

    function showEmptyState() {

        if (emptyState) {

            emptyState.style.display =
                "flex";

        }

    }


    function hideEmptyState() {

        if (emptyState) {

            emptyState.style.display =
                "none";

        }

    }


    /* =====================================================
       LOADING
       ===================================================== */

    function showLoading() {

        if (!timeline) {
            return;
        }


        timeline.innerHTML = `

            <div class="empty-state visible">

                <div class="empty-icon">
                    ↻
                </div>

                <strong>
                    Loading audit events...
                </strong>

                <span>
                    Reading governance records from RevPilot.
                </span>

            </div>

        `;


        hideEmptyState();

    }


    /* =====================================================
       ERROR
       ===================================================== */

    function showError(
        message
    ) {

        if (!timeline) {
            return;
        }


        timeline.innerHTML = `

            <div class="empty-state visible">

                <div class="empty-icon">
                    !
                </div>

                <strong>
                    Unable to load audit trail
                </strong>

                <span>
                    ${escapeHtml(
                        message ||
                        "Check that FastAPI is running on port 8000."
                    )}
                </span>

            </div>

        `;


        hideEmptyState();

    }


    /* =====================================================
       UPDATE METRICS
       ===================================================== */

    function updateMetrics() {

        const metricValues =
            document.querySelectorAll(
                ".metric-value"
            );


        if (!metricValues.length) {
            return;
        }


        /*
         * Decisions logged
         */

        if (metricValues[0]) {

            metricValues[0].textContent =
                auditEvents.length.toLocaleString(
                    "en-IN"
                );

        }


        /*
         * Guardrail interventions
         */

        const guardrailCount =
            auditEvents.filter(
                event =>
                    normalize(
                        event.searchText
                    ).includes(
                        "guardrail"
                    )
            ).length;


        if (metricValues[1]) {

            metricValues[1].textContent =
                guardrailCount.toLocaleString(
                    "en-IN"
                );

        }


        /*
         * Recovery actions stopped
         */

        const stoppedCount =
            auditEvents.filter(
                event =>
                    event.status ===
                        "blocked" ||
                    event.searchText.includes(
                        "stopped"
                    )
            ).length;


        if (metricValues[2]) {

            metricValues[2].textContent =
                stoppedCount.toLocaleString(
                    "en-IN"
                );

        }


        /*
         * Traceability
         */

        if (metricValues[3]) {

            metricValues[3].textContent =
                auditEvents.length > 0
                    ? "100%"
                    : "—";

        }

    }


    /* =====================================================
       EVENT CLICK
       ===================================================== */

    if (timeline) {

        timeline.addEventListener(
            "click",
            (event) => {

                const article =
                    event.target.closest(
                        ".audit-event"
                    );


                if (!article) {
                    return;
                }


                const transactionId =
                    article
                        .querySelector(
                            ".event-header > div > span"
                        )
                        ?.textContent.trim();


                if (
                    transactionId &&
                    transactionId !== "BATCH"
                ) {

                    sessionStorage.setItem(
                        "selected_transaction",
                        transactionId
                    );

                }


                document
                    .querySelectorAll(
                        ".audit-event"
                    )
                    .forEach(
                        item =>
                            item.classList.remove(
                                "selected"
                            )
                    );


                article.classList.add(
                    "selected"
                );

            }
        );

    }


    /* =====================================================
       EXPORT
       ===================================================== */

    if (exportButton) {

        exportButton.addEventListener(
            "click",
            exportAudit
        );

    }


    function exportAudit() {

        if (!auditEvents.length) {

            showToast(
                "Nothing to export",
                "There are no backend audit events yet."
            );

            return;

        }


        const rows = [

            [
                "Timestamp",
                "Event",
                "Transaction",
                "Type",
                "Status",
                "Description"
            ]

        ];


        auditEvents.forEach(
            (event) => {

                const time =
                    formatDateTime(
                        event.timestamp
                    );


                rows.push([

                    `${time.date} ${time.time}`,

                    event.title,

                    event.transactionId,

                    event.type,

                    event.status,

                    event.description

                ]);

            }
        );


        const csv =
            rows
                .map(
                    row =>
                        row
                            .map(
                                value =>
                                    `"${String(
                                        value ?? ""
                                    ).replaceAll(
                                        '"',
                                        '""'
                                    )}"`
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
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            "revpilot-audit-trail.csv";


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        URL.revokeObjectURL(
            url
        );


        showToast(
            "Audit exported",
            "Backend audit records exported successfully."
        );

    }


    /* =====================================================
       GLOBAL SEARCH
       ===================================================== */

    if (globalSearchButton) {

        globalSearchButton.addEventListener(
            "click",
            () => {

                if (searchInput) {

                    searchInput.focus();

                    searchInput.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }

            }
        );

    }


    /* =====================================================
       NOTIFICATIONS
       ===================================================== */

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            () => {

                if (auditEvents.length) {

                    showToast(
                        "Audit stream",
                        `${auditEvents.length} governance event${
                            auditEvents.length === 1
                                ? ""
                                : "s"
                        } recorded by the backend.`
                    );

                }

                else {

                    showToast(
                        "Audit stream",
                        "No backend audit events recorded yet."
                    );

                }

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


    /* =====================================================
       FILTER EVENTS
       ===================================================== */

    [
        searchInput,
        typeFilter,
        statusFilter,
        periodFilter
    ]
    .forEach(
        (element) => {

            if (!element) {
                return;
            }


            element.addEventListener(
                "input",
                filterAuditEvents
            );


            element.addEventListener(
                "change",
                filterAuditEvents
            );

        }
    );


    /* =====================================================
       INITIAL LOAD
       ===================================================== */

    loadAuditEvents();

});