/* =========================================================
   REVPILOT AI — RECOVERY QUEUE
   Live Batch Recovery Integration
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // CONFIG
    // =====================================================

    const API_BASE_URL =
        "http://127.0.0.1:8000";

    const PAGE_SIZE = 50;


    // =====================================================
    // AUTH
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
    // ELEMENTS
    // =====================================================

    const searchInput =
        document.getElementById("queueSearch");

    const failureFilter =
        document.getElementById("failureFilter");

    const riskFilter =
        document.getElementById("riskFilter");

    const actionFilter =
        document.getElementById("actionFilter");

    const tableBody =
        document.getElementById("recoveryTableBody");

    const refreshButton =
        document.getElementById("refreshQueueBtn");

    const runRecoveryButton =
        document.getElementById("runRecoveryBtn");

    const previousPageButton =
        document.getElementById("previousPage");

    const nextPageButton =
        document.getElementById("nextPage");

    const notificationButton =
        document.getElementById("notificationBtn");

    const searchButton =
        document.getElementById("searchBtn");

    const logoutButton =
        document.getElementById("logoutBtn");

    const queueTabs =
        document.querySelectorAll(".queue-tab");


    // =====================================================
    // STATE
    // =====================================================

    let recoveryCases = [];

    let filteredCases = [];

    let currentPage = 1;

    let activeTab = "all";


    // =====================================================
    // HELPERS
    // =====================================================

    function normalize(value) {

        return String(
            value ?? ""
        )
        .toLowerCase()
        .trim();

    }


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


    function formatLabel(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "—";

        }


        return String(value)
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


    function getValue(
        object,
        keys
    ) {

        if (!object) {
            return "";
        }


        for (
            const key of keys
        ) {

            const value =
                object[key];


            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {

                return value;

            }

        }


        return "";

    }


    function escapeHtml(
        value
    ) {

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
    // CLASSIFIERS
    // =====================================================

    function getRiskLevel(
        item
    ) {

        const risk =
            normalize(
                item.risk_level
            );


        if (
            risk.includes("high")
        ) {

            return "high";

        }


        if (
            risk.includes("medium")
        ) {

            return "medium";

        }


        if (
            risk.includes("low")
        ) {

            return "low";

        }


        /*
         * Backend decisions that are blocked should still
         * appear as high attention cases.
         */

        const action =
            normalize(
                item.final_action
            );


        if (
            action.includes(
                "do_not_retry"
            ) ||
            action.includes(
                "block"
            )
        ) {

            return "high";

        }


        return "medium";

    }


    function getOutcome(
        item
    ) {

        const outcome =
            normalize(
                item.outcome
            );


        if (
            outcome === "automatic"
        ) {

            return "automatic";

        }


        if (
            outcome === "review"
        ) {

            return "review";

        }


        return "blocked";

    }


    function getActionLabel(
        item
    ) {

        const action =
            String(
                item.final_action ||
                ""
            );


        if (!action) {

            return "Review case";

        }


        return formatLabel(
            action
        );

    }


    function getActionClass(
        item
    ) {

        const action =
            normalize(
                item.final_action
            );


        if (
            action.includes(
                "do_not_retry"
            ) ||
            action.includes(
                "block"
            )
        ) {

            return "blocked";

        }


        if (
            action.includes(
                "human_escalation"
            ) ||
            action.includes(
                "review"
            )
        ) {

            return "review";

        }


        return "retry";

    }


    // =====================================================
    // NAVIGATION
    // =====================================================

    document
        .querySelectorAll(".nav-item")
        .forEach(
            item => {

                item.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();


                        const href =
                            item.getAttribute(
                                "href"
                            );


                        if (href) {

                            window.location.href =
                                href;

                        }

                    }
                );

            }
        );


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
    // LOAD LIVE RECOVERY DATA
    // =====================================================

    async function loadRecoveryQueue() {

        showLoading();


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/batch-recovery`,
                    {
                        method: "GET",
                        headers: {
                            "Accept":
                                "application/json"
                        }
                    }
                );


            if (!response.ok) {

                throw new Error(
                    `API error: HTTP ${response.status}`
                );

            }


            const data =
                await response.json();


            if (
                !data ||
                !Array.isArray(
                    data.transactions
                )
            ) {

                throw new Error(
                    "Invalid batch recovery response."
                );

            }


            recoveryCases =
                data.transactions;


            filteredCases =
                [...recoveryCases];


            currentPage = 1;


            saveBatchResult(
                data
            );


            updateQueueSummary(
                data
            );


            applyFilters();


            showToast(
                "Queue updated",
                `${formatNumber(
                    recoveryCases.length
                )} failed-payment recovery cases loaded.`
            );

        }

        catch (error) {

            console.error(
                "Recovery Queue API error:",
                error
            );


            recoveryCases = [];

            filteredCases = [];


            showError(
                error.message
            );

        }

    }


    // =====================================================
    // SAVE BATCH RESULT
    // =====================================================

    function saveBatchResult(
        data
    ) {

        try {

            sessionStorage.setItem(
                "last_batch_result",
                JSON.stringify(data)
            );

        }

        catch (error) {

            console.warn(
                "Unable to save batch result:",
                error
            );

        }

    }


    // =====================================================
    // QUEUE SUMMARY
    // =====================================================

    function updateQueueSummary(
        data
    ) {

        const summary =
            data.summary || {};

        const outcomes =
            data.outcomes || {};


        // -------------------------------------------------
        // Generic summary elements
        // -------------------------------------------------

        const countCandidates = {

            totalRecoveryCases:
                summary.failed_payments,

            failedPayments:
                summary.failed_payments,

            revenueAtRisk:
                summary.revenue_at_risk,

            recoverableRevenue:
                summary.recoverable_revenue,

            recoveredRevenue:
                summary.recovered_revenue,

            automaticCount:
                outcomes.automatic,

            reviewCount:
                outcomes.review,

            blockedCount:
                outcomes.blocked

        };


        Object.entries(
            countCandidates
        )
        .forEach(
            ([id, value]) => {

                const element =
                    document.getElementById(
                        id
                    );


                if (!element) {
                    return;
                }


                if (
                    id.toLowerCase()
                        .includes("revenue")
                ) {

                    element.textContent =
                        formatCurrency(
                            value
                        );

                }

                else {

                    element.textContent =
                        formatNumber(
                            value
                        );

                }

            }
        );


        // -------------------------------------------------
        // Recovery navigation badge
        // -------------------------------------------------

        const recoveryBadge =
            document.querySelector(
                ".nav-item[data-page='recovery'] .nav-badge"
            );


        if (recoveryBadge) {

            recoveryBadge.textContent =
                formatNumber(
                    outcomes.review || 0
                );

        }


        // -------------------------------------------------
        // Queue page meta
        // -------------------------------------------------

        const tableMeta =
            document.querySelector(
                ".table-header-meta"
            );


        if (tableMeta) {

            tableMeta.innerHTML = `

                <span class="live-indicator"></span>

                ${formatNumber(
                    summary.failed_payments || 0
                )}
                active recovery cases

            `;

        }


        // -------------------------------------------------
        // Page description
        // -------------------------------------------------

        const pageDescription =
            document.querySelector(
                ".page-header p"
            );


        if (
            pageDescription &&
            summary.failed_payments !== undefined
        ) {

            pageDescription.textContent =
                `${formatNumber(
                    summary.failed_payments
                )} failed payments are being evaluated by the RevPilot recovery policy.`;

        }

    }


    // =====================================================
    // FILTER LOGIC
    // =====================================================

    function applyFilters() {

        const searchTerm =
            searchInput
                ? normalize(
                    searchInput.value
                )
                : "";


        const selectedFailure =
            failureFilter
                ? normalize(
                    failureFilter.value
                )
                : "all";


        const selectedRisk =
            riskFilter
                ? normalize(
                    riskFilter.value
                )
                : "all";


        const selectedAction =
            actionFilter
                ? normalize(
                    actionFilter.value
                )
                : "all";


        filteredCases =
            recoveryCases.filter(
                item => {

                    const transactionId =
                        normalize(
                            item.transaction_id
                        );


                    const customerId =
                        normalize(
                            item.customer_id
                        );


                    const failureReason =
                        normalize(
                            item.failure_reason
                        );


                    const finalAction =
                        normalize(
                            item.final_action
                        );


                    const riskLevel =
                        getRiskLevel(
                            item
                        );


                    // -----------------------------------------
                    // Search
                    // -----------------------------------------

                    const matchesSearch =
                        !searchTerm ||
                        transactionId.includes(
                            searchTerm
                        ) ||
                        customerId.includes(
                            searchTerm
                        ) ||
                        failureReason.includes(
                            searchTerm
                        );


                    // -----------------------------------------
                    // Failure
                    // -----------------------------------------

                    const matchesFailure =
                        selectedFailure ===
                            "all" ||
                        failureReason.includes(
                            selectedFailure
                        );


                    // -----------------------------------------
                    // Risk
                    // -----------------------------------------

                    const matchesRisk =
                        selectedRisk ===
                            "all" ||
                        riskLevel ===
                            selectedRisk;


                    // -----------------------------------------
                    // Action
                    // -----------------------------------------

                    let matchesAction =
                        true;


                    if (
                        selectedAction !==
                        "all"
                    ) {

                        const actionClass =
                            getActionClass(
                                item
                            );


                        matchesAction =
                            actionClass ===
                            selectedAction ||
                            finalAction.includes(
                                selectedAction
                            );

                    }


                    // -----------------------------------------
                    // Queue tab
                    // -----------------------------------------

                    const matchesTab =
                        matchesQueueTab(
                            item
                        );


                    return (
                        matchesSearch &&
                        matchesFailure &&
                        matchesRisk &&
                        matchesAction &&
                        matchesTab
                    );

                }
            );


        currentPage = 1;


        renderCurrentPage();

    }


    // =====================================================
    // QUEUE TABS
    // =====================================================

    function matchesQueueTab(
        item
    ) {

        if (
            activeTab ===
            "all"
        ) {

            return true;

        }


        const risk =
            getRiskLevel(
                item
            );


        const action =
            normalize(
                item.final_action
            );


        const outcome =
            getOutcome(
                item
            );


        if (
            activeTab ===
            "high-risk"
        ) {

            return (
                risk === "high"
            );

        }


        if (
            activeTab ===
            "retry-ready"
        ) {

            return (
                outcome === "automatic" &&
                !action.includes(
                    "do_not_retry"
                )
            );

        }


        if (
            activeTab ===
            "customer-intervention"
        ) {

            return (
                outcome === "review" ||
                action.includes(
                    "reminder"
                ) ||
                action.includes(
                    "human_escalation"
                )
            );

        }


        if (
            activeTab ===
            "stopped"
        ) {

            return (
                outcome === "blocked" ||
                action.includes(
                    "do_not_retry"
                )
            );

        }


        return true;

    }


    queueTabs.forEach(
        tab => {

            tab.addEventListener(
                "click",
                () => {

                    queueTabs.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    tab.classList.add(
                        "active"
                    );


                    activeTab =
                        tab.dataset.tab ||
                        "all";


                    applyFilters();

                }
            );

        }
    );


    // =====================================================
    // RENDER CURRENT PAGE
    // =====================================================

    function renderCurrentPage() {

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = "";


        const total =
            filteredCases.length;


        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    total /
                    PAGE_SIZE
                )
            );


        if (
            currentPage >
            totalPages
        ) {

            currentPage =
                totalPages;

        }


        if (!total) {

            renderEmptyState();

            updatePagination(
                0,
                0,
                0
            );

            return;

        }


        const startIndex =
            (
                currentPage - 1
            ) *
            PAGE_SIZE;


        const endIndex =
            Math.min(
                startIndex +
                PAGE_SIZE,
                total
            );


        const pageItems =
            filteredCases.slice(
                startIndex,
                endIndex
            );


        pageItems.forEach(
            item => {

                renderRecoveryRow(
                    item
                );

            }
        );


        attachReviewButtons();


        updatePagination(
            total,
            startIndex,
            endIndex
        );

    }


    // =====================================================
    // RENDER ROW
    // =====================================================

    function renderRecoveryRow(
        item
    ) {

        const transactionId =
            getValue(
                item,
                [
                    "transaction_id",
                    "id"
                ]
            );


        const customerId =
            getValue(
                item,
                [
                    "customer_id"
                ]
            );


        const amount =
            getValue(
                item,
                [
                    "amount"
                ]
            );


        const failureReason =
            getValue(
                item,
                [
                    "failure_reason"
                ]
            );


        const customerSegment =
            getValue(
                item,
                [
                    "customer_segment"
                ]
            );


        const risk =
            getRiskLevel(
                item
            );


        const outcome =
            getOutcome(
                item
            );


        const actionLabel =
            getActionLabel(
                item
            );


        const actionClass =
            getActionClass(
                item
            );


        const confidence =
            getValue(
                item,
                [
                    "confidence"
                ]
            );


        const guardrail =
            getValue(
                item,
                [
                    "guardrail_status"
                ]
            );


        const row =
            document.createElement(
                "tr"
            );


        row.className =
            "recovery-row";


        row.dataset.transactionId =
            normalize(
                transactionId
            );


        row.dataset.risk =
            risk;


        row.dataset.action =
            actionClass;


        row.innerHTML = `

            <!-- TRANSACTION -->

            <td>

                <div class="transaction-cell">

                    <strong>
                        ${escapeHtml(
                            transactionId
                        )}
                    </strong>

                    <span>
                        Failed payment
                    </span>

                </div>

            </td>


            <!-- CUSTOMER -->

            <td>

                <div class="customer-cell">

                    <div class="customer-avatar">
                        ${escapeHtml(
                            String(
                                customerId
                            )
                            .slice(
                                -2
                            )
                            .toUpperCase()
                        )}
                    </div>


                    <div>

                        <strong>
                            ${escapeHtml(
                                customerId
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                formatLabel(
                                    customerSegment
                                )
                            )}
                        </span>

                    </div>

                </div>

            </td>


            <!-- AMOUNT -->

            <td>

                <strong class="amount">
                    ${formatCurrency(
                        amount
                    )}
                </strong>

            </td>


            <!-- RISK -->

            <td>

                <span
                    class="risk-pill ${risk}"
                >
                    ${escapeHtml(
                        formatLabel(
                            risk
                        )
                    )}
                </span>

            </td>


            <!-- FAILURE -->

            <td>

                <div class="failure-cell">

                    <strong>
                        ${escapeHtml(
                            formatLabel(
                                failureReason
                            )
                        )}
                    </strong>

                    <span>
                        Payment failure
                    </span>

                </div>

            </td>


            <!-- RECOMMENDATION -->

            <td>

                <div class="recommendation">

                    <strong>
                        ${escapeHtml(
                            actionLabel
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            outcome
                        )}
                        ·
                        ${escapeHtml(
                            formatConfidence(
                                confidence
                            )
                        )}
                    </span>

                </div>

            </td>


            <!-- GUARDRAIL -->

            <td>

                <div class="recovery-status">

                    <strong>
                        ${escapeHtml(
                            guardrail ||
                            "Validated"
                        )}
                    </strong>

                    <span>
                        Finance check
                    </span>

                </div>

            </td>


            <!-- ACTION -->

            <td>

                <button
                    type="button"
                    class="review-btn"
                    data-transaction-id="${escapeHtml(
                        transactionId
                    )}"
                >
                    Review
                </button>

            </td>

        `;


        tableBody.appendChild(
            row
        );

    }


    // =====================================================
    // EMPTY STATE
    // =====================================================

    function renderEmptyState() {

        tableBody.innerHTML = `

            <tr class="recovery-empty-row">

                <td colspan="8">

                    <div class="queue-empty-state">

                        <strong>
                            No recovery cases match your filters.
                        </strong>

                        <span>
                            Try changing the search or filters.
                        </span>

                    </div>

                </td>

            </tr>

        `;

    }


    // =====================================================
    // REVIEW BUTTONS
    // =====================================================

    function attachReviewButtons() {

        document
            .querySelectorAll(
                ".review-btn"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const transactionId =
                                button.dataset.transactionId;


                            if (!transactionId) {

                                showToast(
                                    "Transaction unavailable",
                                    "This case does not contain a transaction ID."
                                );


                                return;

                            }


                            sessionStorage.setItem(
                                "selected_transaction",
                                transactionId
                            );


                            window.location.href =
                                "boardroom.html";

                        }
                    );

                }
            );

    }


    // =====================================================
    // PAGINATION
    // =====================================================

    function updatePagination(
        total,
        startIndex,
        endIndex
    ) {

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    total /
                    PAGE_SIZE
                )
            );


        const startElement =
            document.getElementById(
                "paginationStart"
            );


        const endElement =
            document.getElementById(
                "paginationEnd"
            );


        if (
            startElement &&
            endElement
        ) {

            startElement.textContent =
                total
                    ? formatNumber(
                        startIndex + 1
                    )
                    : "0";


            endElement.textContent =
                total
                    ? formatNumber(
                        endIndex
                    )
                    : "0";

        }


        if (previousPageButton) {

            previousPageButton.disabled =
                currentPage <= 1;

        }


        if (nextPageButton) {

            nextPageButton.disabled =
                currentPage >=
                totalPages;

        }


        renderPageNumbers(
            totalPages
        );

    }


    function renderPageNumbers(
        totalPages
    ) {

        const pagination =
            document.querySelector(
                ".pagination"
            );


        if (!pagination) {
            return;
        }


        pagination.innerHTML = "";


        // -------------------------------------------------
        // PREVIOUS
        // -------------------------------------------------

        const previous =
            document.createElement(
                "button"
            );


        previous.type =
            "button";


        previous.className =
            "pagination-btn";


        previous.textContent =
            "←";


        previous.disabled =
            currentPage <= 1;


        previous.addEventListener(
            "click",
            () => {

                if (
                    currentPage > 1
                ) {

                    currentPage--;

                    renderCurrentPage();

                    scrollTable();

                }

            }
        );


        pagination.appendChild(
            previous
        );


        // -------------------------------------------------
        // NUMBERS
        // -------------------------------------------------

        const pages =
            getPaginationPages(
                currentPage,
                totalPages
            );


        pages.forEach(
            page => {

                if (
                    page === "..."
                ) {

                    const span =
                        document.createElement(
                            "span"
                        );


                    span.textContent =
                        "…";


                    pagination.appendChild(
                        span
                    );


                    return;

                }


                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "pagination-number";


                button.textContent =
                    formatNumber(
                        page
                    );


                if (
                    page ===
                    currentPage
                ) {

                    button.classList.add(
                        "active"
                    );

                }


                button.addEventListener(
                    "click",
                    () => {

                        currentPage =
                            page;


                        renderCurrentPage();

                        scrollTable();

                    }
                );


                pagination.appendChild(
                    button
                );

            }
        );


        // -------------------------------------------------
        // NEXT
        // -------------------------------------------------

        const next =
            document.createElement(
                "button"
            );


        next.type =
            "button";


        next.className =
            "pagination-btn";


        next.textContent =
            "→";


        next.disabled =
            currentPage >=
            totalPages;


        next.addEventListener(
            "click",
            () => {

                if (
                    currentPage <
                    totalPages
                ) {

                    currentPage++;

                    renderCurrentPage();

                    scrollTable();

                }

            }
        );


        pagination.appendChild(
            next
        );

    }


    function getPaginationPages(
        current,
        total
    ) {

        if (
            total <= 7
        ) {

            return Array.from(
                {
                    length: total
                },
                (_, index) =>
                    index + 1
            );

        }


        const pages = [1];


        if (
            current > 4
        ) {

            pages.push(
                "..."
            );

        }


        const start =
            Math.max(
                2,
                current - 1
            );


        const end =
            Math.min(
                total - 1,
                current + 1
            );


        for (
            let page = start;
            page <= end;
            page++
        ) {

            pages.push(
                page
            );

        }


        if (
            current <
            total - 3
        ) {

            pages.push(
                "..."
            );

        }


        pages.push(
            total
        );


        return pages;

    }


    function scrollTable() {

        const table =
            document.querySelector(
                ".table-card"
            );


        if (table) {

            table.scrollIntoView(
                {
                    behavior: "smooth",
                    block: "start"
                }
            );

        }

    }


    // =====================================================
    // RUN RECOVERY
    // =====================================================

    if (runRecoveryButton) {

        runRecoveryButton.addEventListener(
            "click",
            () => {

                /*
                 * Select the first currently visible case
                 * and send it directly to Boardroom.
                 */

                const firstCase =
                    filteredCases[0];


                if (!firstCase) {

                    showToast(
                        "No recovery case",
                        "No failed-payment case is available under the current filters."
                    );


                    return;

                }


                const transactionId =
                    firstCase.transaction_id;


                sessionStorage.setItem(
                    "selected_transaction",
                    transactionId
                );


                window.location.href =
                    "boardroom.html";

            }
        );

    }


    // =====================================================
    // REFRESH
    // =====================================================

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            async () => {

                const original =
                    refreshButton.innerHTML;


                refreshButton.disabled =
                    true;


                refreshButton.innerHTML =
                    `<span>↻</span> Refreshing...`;


                await loadRecoveryQueue();


                refreshButton.disabled =
                    false;


                refreshButton.innerHTML =
                    original;

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

                if (searchInput) {

                    searchInput.focus();

                }

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

                showToast(
                    "Recovery notifications",
                    `${formatNumber(
                        filteredCases.length
                    )} cases are currently visible.`
                );

            }
        );

    }


    // =====================================================
    // FILTER EVENTS
    // =====================================================

    [
        searchInput,
        failureFilter,
        riskFilter,
        actionFilter
    ]
    .forEach(
        element => {

            if (!element) {
                return;
            }


            element.addEventListener(
                "input",
                applyFilters
            );


            element.addEventListener(
                "change",
                applyFilters
            );

        }
    );


    // =====================================================
    // LOADING
    // =====================================================

    function showLoading() {

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = `

            <tr>

                <td colspan="8">

                    <div class="queue-empty-state">

                        <strong>
                            Loading live recovery cases...
                        </strong>

                        <span>
                            Connecting to the RevPilot recovery engine.
                        </span>

                    </div>

                </td>

            </tr>

        `;

    }


    // =====================================================
    // ERROR
    // =====================================================

    function showError(
        message
    ) {

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = `

            <tr>

                <td colspan="8">

                    <div class="queue-empty-state">

                        <strong>
                            Unable to load recovery queue
                        </strong>

                        <span>
                            ${escapeHtml(
                                message ||
                                "Make sure FastAPI is running."
                            )}
                        </span>

                    </div>

                </td>

            </tr>

        `;


        const meta =
            document.querySelector(
                ".table-header-meta"
            );


        if (meta) {

            meta.innerHTML =
                `<span>Backend connection required</span>`;

        }


        if (previousPageButton) {
            previousPageButton.disabled = true;
        }


        if (nextPageButton) {
            nextPageButton.disabled = true;
        }

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
                class="toast-close"
                type="button"
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


        const close =
            toast.querySelector(
                ".toast-close"
            );


        if (close) {

            close.addEventListener(
                "click",
                () => {

                    removeToast(
                        toast
                    );

                }
            );

        }


        setTimeout(
            () => {

                removeToast(
                    toast
                );

            },
            3500
        );

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


        setTimeout(
            () => {

                if (toast.parentNode) {

                    toast.remove();

                }

            },
            250
        );

    }


    // =====================================================
    // INITIALIZE
    // =====================================================

    loadRecoveryQueue();


    console.log(
        "RevPilot Recovery Queue — Live Batch Mode"
    );

});