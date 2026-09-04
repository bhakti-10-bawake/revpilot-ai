/* =========================================================
   REVPILOT AI — TRANSACTIONS
   Live Dataset + Real Pagination
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // CONFIG
    // =====================================================

    const API_BASE_URL = "http://127.0.0.1:8000";

    const PAGE_SIZE = 50;


    // =====================================================
    // ELEMENTS
    // =====================================================

    const tableBody =
        document.getElementById(
            "transactionTableBody"
        );

    const searchInput =
        document.getElementById(
            "transactionSearch"
        );

    const statusFilter =
        document.getElementById(
            "statusFilter"
        );

    const failureFilter =
        document.getElementById(
            "failureFilter"
        );

    const dateFilter =
        document.getElementById(
            "dateFilter"
        );

    const visibleCount =
        document.getElementById(
            "visibleCount"
        );

    const paginationStart =
        document.getElementById(
            "paginationStart"
        );

    const paginationEnd =
        document.getElementById(
            "paginationEnd"
        );

    const previousPageButton =
        document.getElementById(
            "previousPage"
        );

    const nextPageButton =
        document.getElementById(
            "nextPage"
        );

    const paginationContainer =
        document.querySelector(
            ".pagination"
        );

    const refreshBtn =
        document.getElementById(
            "refreshBtn"
        );

    const exportBtn =
        document.getElementById(
            "exportBtn"
        );

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );

    const globalSearchBtn =
        document.getElementById(
            "globalSearchBtn"
        );

    const notificationBtn =
        document.getElementById(
            "notificationBtn"
        );


    // =====================================================
    // STATE
    // =====================================================

    let transactions = [];

    let filteredTransactions = [];

    let currentPage = 1;


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
                maximumFractionDigits: 2
            }
        ).format(amount);

    }


    function formatLabel(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "Unknown";

        }


        return String(value)
            .replaceAll("_", " ")
            .replace(
                /\b\w/g,
                letter =>
                    letter.toUpperCase()
            );

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


    function getInitials(value) {

        const text =
            String(
                value ?? "Customer"
            ).trim();


        if (!text) {
            return "CU";
        }


        const parts =
            text.split(/\s+/);


        if (parts.length >= 2) {

            return (
                parts[0][0] +
                parts[parts.length - 1][0]
            ).toUpperCase();

        }


        return text
            .slice(0, 2)
            .toUpperCase();

    }


    function getValue(
        object,
        keys
    ) {

        if (!object) {
            return "";
        }


        for (const key of keys) {

            if (
                object[key] !== undefined &&
                object[key] !== null &&
                object[key] !== ""
            ) {

                return object[key];

            }

        }


        return "";

    }


    // =====================================================
    // STATUS
    // =====================================================

    function getRawStatus(
        transaction
    ) {

        return normalize(
            getValue(
                transaction,
                [
                    "status",
                    "payment_status",
                    "transaction_status"
                ]
            )
        );

    }


    function isSuccessfulStatus(
        status
    ) {

        const value =
            normalize(status);


        return (
            value.includes("success") ||
            value.includes("successful") ||
            value === "paid" ||
            value.includes("captured") ||
            value.includes("settled") ||
            value === "complete" ||
            value.includes("completed") ||
            value.includes("recovered") ||
            value.includes("succeeded")
        );

    }


    function isFailedStatus(
        status
    ) {

        const value =
            normalize(status);


        return (
            value.includes("fail") ||
            value.includes("failed") ||
            value.includes("declin") ||
            value.includes("declined") ||
            value.includes("error") ||
            value.includes("timeout") ||
            value.includes("insufficient") ||
            value.includes("cancelled") ||
            value.includes("canceled")
        );

    }


    function isPendingStatus(
        status
    ) {

        const value =
            normalize(status);


        return (
            value.includes("pending") ||
            value.includes("processing") ||
            value.includes("initiated") ||
            value.includes("retry")
        );

    }


    function getStatusClass(
        status
    ) {

        if (
            isSuccessfulStatus(status)
        ) {

            return "recovered";

        }


        if (
            isFailedStatus(status)
        ) {

            return "failed";

        }


        if (
            isPendingStatus(status)
        ) {

            return "pending";

        }


        return "unknown";

    }


    function getStatusLabel(
        status
    ) {

        if (
            isSuccessfulStatus(status)
        ) {

            return "Successful";

        }


        if (
            isFailedStatus(status)
        ) {

            return "Failed";

        }


        if (
            isPendingStatus(status)
        ) {

            return "Pending";

        }


        if (status) {

            return formatLabel(
                status
            );

        }


        return "Unknown";

    }


    // =====================================================
    // LOAD
    // =====================================================

    async function loadTransactions() {

        showLoading();


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/transactions`,
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
                    "Invalid transaction response from backend."
                );

            }


            transactions =
                data.transactions;


            filteredTransactions =
                [...transactions];


            currentPage = 1;


            updateMetricCards();


            renderCurrentPage();


            showToast(
                "Live data loaded",
                `${formatNumber(
                    transactions.length
                )} transactions loaded from the backend.`
            );

        }

        catch (error) {

            console.error(
                "Transaction API error:",
                error
            );


            transactions = [];

            filteredTransactions = [];

            showError(
                error.message
            );

        }

    }


    // =====================================================
    // RENDER CURRENT PAGE
    // =====================================================

    function renderCurrentPage() {

        if (!tableBody) {
            return;
        }


        tableBody.innerHTML = "";


        const totalFiltered =
            filteredTransactions.length;


        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    totalFiltered /
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


        if (
            currentPage < 1
        ) {

            currentPage = 1;

        }


        // -------------------------------------------------
        // EMPTY RESULT
        // -------------------------------------------------

        if (!totalFiltered) {

            tableBody.innerHTML = `

                <tr>

                    <td colspan="8">

                        <div class="no-results">

                            No transaction records found.

                        </div>

                    </td>

                </tr>

            `;


            updatePagination(
                0
            );


            return;

        }


        // -------------------------------------------------
        // PAGE SLICE
        // -------------------------------------------------

        const startIndex =
            (
                currentPage - 1
            ) *
            PAGE_SIZE;


        const endIndex =
            Math.min(
                startIndex +
                PAGE_SIZE,
                totalFiltered
            );


        const pageTransactions =
            filteredTransactions.slice(
                startIndex,
                endIndex
            );


        // -------------------------------------------------
        // RENDER ROWS
        // -------------------------------------------------

        pageTransactions.forEach(
            transaction => {

                renderTransactionRow(
                    transaction
                );

            }
        );


        // -------------------------------------------------
        // PAGINATION
        // -------------------------------------------------

        updatePagination(
            totalFiltered,
            startIndex,
            endIndex
        );


        attachViewButtons();

    }


    // =====================================================
    // RENDER ONE ROW
    // =====================================================

    function renderTransactionRow(
        transaction
    ) {

        const transactionId =
            getValue(
                transaction,
                [
                    "transaction_id",
                    "id"
                ]
            ) || "Unknown";


        const customer =
            getValue(
                transaction,
                [
                    "customer_id",
                    "customer"
                ]
            ) || "Unknown";


        const amount =
            getValue(
                transaction,
                [
                    "amount",
                    "transaction_amount"
                ]
            );


        const failure =
            getValue(
                transaction,
                [
                    "failure_reason",
                    "failure",
                    "failure_type"
                ]
            );


        const rawStatus =
            getRawStatus(
                transaction
            );


        const segment =
            getValue(
                transaction,
                [
                    "customer_segment"
                ]
            );


        const paymentMethod =
            getValue(
                transaction,
                [
                    "payment_method"
                ]
            );


        const date =
            getValue(
                transaction,
                [
                    "timestamp",
                    "date",
                    "created_at",
                    "transaction_date"
                ]
            );


        const row =
            document.createElement(
                "tr"
            );


        row.className =
            "transaction-row";


        row.dataset.transactionId =
            normalize(
                transactionId
            );


        row.dataset.customer =
            normalize(
                customer
            );


        row.dataset.status =
            rawStatus;


        row.dataset.failure =
            normalize(
                failure
            );


        row.dataset.date =
            date || "";


        const statusClass =
            getStatusClass(
                rawStatus
            );


        const statusLabel =
            getStatusLabel(
                rawStatus
            );


        row.innerHTML = `

            <td>

                <div class="transaction-cell">

                    <strong>
                        ${escapeHtml(
                            transactionId
                        )}
                    </strong>

                    <span>
                        ${escapeHtml(
                            paymentMethod ||
                            "Payment transaction"
                        )}
                    </span>

                </div>

            </td>


            <td>

                <div class="customer-cell">

                    <div class="customer-avatar">

                        ${escapeHtml(
                            getInitials(
                                customer
                            )
                        )}

                    </div>


                    <div>

                        <strong>
                            ${escapeHtml(
                                customer
                            )}
                        </strong>

                        <span>
                            ${escapeHtml(
                                formatLabel(
                                    segment
                                )
                            )}
                        </span>

                    </div>

                </div>

            </td>


            <td>

                <strong class="amount">

                    ${formatCurrency(
                        amount
                    )}

                </strong>

            </td>


            <td>

                <span
                    class="status-pill ${statusClass}"
                >

                    ${escapeHtml(
                        statusLabel
                    )}

                </span>

            </td>


            <td>

                <div class="failure-cell">

                    <strong>

                        ${
                            failure
                                ? escapeHtml(
                                    formatLabel(
                                        failure
                                    )
                                )
                                : "—"
                        }

                    </strong>

                    <span>

                        ${
                            failure
                                ? "Payment event"
                                : "No failure recorded"
                        }

                    </span>

                </div>

            </td>


            <td>

                <div class="recovery-cell">

                    <strong>
                        AI analysis available
                    </strong>

                    <span>
                        Open Boardroom
                    </span>

                </div>

            </td>


            <td>

                <div class="date-cell">

                    <strong>

                        ${
                            date
                                ? escapeHtml(
                                    formatDate(
                                        date
                                    )
                                )
                                : "Dataset record"
                        }

                    </strong>

                    <span>

                        ${escapeHtml(
                            formatLabel(
                                segment
                            )
                        )}

                    </span>

                </div>

            </td>


            <td>

                <button
                    type="button"
                    class="view-btn"
                    data-transaction="${escapeHtml(
                        transactionId
                    )}"
                >
                    View
                </button>

            </td>

        `;


        tableBody.appendChild(
            row
        );

    }


    // =====================================================
    // DATE
    // =====================================================

    function formatDate(
        value
    ) {

        if (!value) {
            return "—";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(value);

        }


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    // =====================================================
    // FILTER DATA
    // =====================================================

    function applyFilters() {

        const search =
            searchInput
                ? normalize(
                    searchInput.value
                )
                : "";


        const selectedStatus =
            statusFilter
                ? normalize(
                    statusFilter.value
                )
                : "all";


        const selectedFailure =
            failureFilter
                ? normalize(
                    failureFilter.value
                )
                : "all";


        const selectedDate =
            dateFilter
                ? normalize(
                    dateFilter.value
                )
                : "all";


        filteredTransactions =
            transactions.filter(
                transaction => {

                    // -----------------------------------------
                    // SEARCH
                    // -----------------------------------------

                    const searchableText =
                        normalize(
                            [
                                getValue(
                                    transaction,
                                    [
                                        "transaction_id",
                                        "id"
                                    ]
                                ),

                                getValue(
                                    transaction,
                                    [
                                        "customer_id",
                                        "customer"
                                    ]
                                ),

                                getValue(
                                    transaction,
                                    [
                                        "payment_method"
                                    ]
                                ),

                                getValue(
                                    transaction,
                                    [
                                        "failure_reason",
                                        "failure"
                                    ]
                                ),

                                getValue(
                                    transaction,
                                    [
                                        "customer_segment"
                                    ]
                                ),

                                getValue(
                                    transaction,
                                    [
                                        "payment_status",
                                        "status"
                                    ]
                                )
                            ].join(" ")
                        );


                    const matchesSearch =
                        !search ||
                        searchableText.includes(
                            search
                        );


                    // -----------------------------------------
                    // STATUS
                    // -----------------------------------------

                    let matchesStatus =
                        true;


                    if (
                        selectedStatus !==
                        "all"
                    ) {

                        if (
                            selectedStatus.includes(
                                "success"
                            ) ||
                            selectedStatus.includes(
                                "paid"
                            )
                        ) {

                            matchesStatus =
                                isSuccessfulStatus(
                                    getRawStatus(
                                        transaction
                                    )
                                );

                        }

                        else if (
                            selectedStatus.includes(
                                "fail"
                            ) ||
                            selectedStatus.includes(
                                "declin"
                            )
                        ) {

                            matchesStatus =
                                isFailedStatus(
                                    getRawStatus(
                                        transaction
                                    )
                                );

                        }

                        else if (
                            selectedStatus.includes(
                                "recover"
                            )
                        ) {

                            matchesStatus =
                                getStatusClass(
                                    getRawStatus(
                                        transaction
                                    )
                                ) ===
                                "recovered";

                        }

                        else if (
                            selectedStatus.includes(
                                "pending"
                            )
                        ) {

                            matchesStatus =
                                isPendingStatus(
                                    getRawStatus(
                                        transaction
                                    )
                                );

                        }

                        else {

                            matchesStatus =
                                normalize(
                                    getRawStatus(
                                        transaction
                                    )
                                ).includes(
                                    selectedStatus
                                );

                        }

                    }


                    // -----------------------------------------
                    // FAILURE
                    // -----------------------------------------

                    let matchesFailure =
                        true;


                    if (
                        selectedFailure !==
                        "all"
                    ) {

                        const failure =
                            normalize(
                                getValue(
                                    transaction,
                                    [
                                        "failure_reason",
                                        "failure",
                                        "failure_type"
                                    ]
                                )
                            );


                        matchesFailure =
                            failure.includes(
                                selectedFailure
                            );

                    }


                    // -----------------------------------------
                    // DATE
                    // -----------------------------------------

                    const dateValue =
                        getValue(
                            transaction,
                            [
                                "timestamp",
                                "date",
                                "created_at",
                                "transaction_date"
                            ]
                        );


                    const matchesDate =
                        selectedDate ===
                            "all" ||
                        matchesDateFilter(
                            dateValue,
                            selectedDate
                        );


                    return (
                        matchesSearch &&
                        matchesStatus &&
                        matchesFailure &&
                        matchesDate
                    );

                }
            );


        currentPage = 1;


        renderCurrentPage();

    }


    // =====================================================
    // DATE FILTER
    // =====================================================

    function matchesDateFilter(
        value,
        filter
    ) {

        if (!value) {
            return true;
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return true;

        }


        const now =
            new Date();


        const difference =
            now.getTime() -
            date.getTime();


        const day =
            24 *
            60 *
            60 *
            1000;


        if (
            filter === "today"
        ) {

            return (
                date.toDateString() ===
                now.toDateString()
            );

        }


        if (
            filter === "7days"
        ) {

            return (
                difference >= 0 &&
                difference <=
                    7 * day
            );

        }


        if (
            filter === "30days"
        ) {

            return (
                difference >= 0 &&
                difference <=
                    30 * day
            );

        }


        return true;

    }


    // =====================================================
    // PAGINATION
    // =====================================================

    function updatePagination(
        total,
        startIndex = 0,
        endIndex = 0
    ) {

        const totalPages =
            Math.max(
                1,
                Math.ceil(
                    total /
                    PAGE_SIZE
                )
            );


        // -------------------------------------------------
        // Footer range
        // -------------------------------------------------

        if (
            paginationStart &&
            paginationEnd
        ) {

            if (!total) {

                paginationStart.textContent =
                    "0";

                paginationEnd.textContent =
                    "0";

            }

            else {

                paginationStart.textContent =
                    formatNumber(
                        startIndex + 1
                    );

                paginationEnd.textContent =
                    formatNumber(
                        endIndex
                    );

            }

        }


        // -------------------------------------------------
        // Header count
        // -------------------------------------------------

        if (visibleCount) {

            visibleCount.textContent =
                `${formatNumber(
                    total
                )} transaction${
                    total === 1
                        ? ""
                        : "s"
                }`;

        }


        // -------------------------------------------------
        // Previous / Next
        // -------------------------------------------------

        if (previousPageButton) {

            previousPageButton.disabled =
                currentPage <= 1 ||
                total === 0;

        }


        if (nextPageButton) {

            nextPageButton.disabled =
                currentPage >= totalPages ||
                total === 0;

        }


        renderPaginationNumbers(
            totalPages
        );

    }


    function renderPaginationNumbers(
        totalPages
    ) {

        if (!paginationContainer) {
            return;
        }


        /*
         * Keep only the number buttons and arrows.
         * This removes the old hardcoded 1,2,3,...1000
         * buttons and creates the correct pages dynamically.
         */

        paginationContainer.innerHTML = "";


        // -------------------------------------------------
        // Previous
        // -------------------------------------------------

        const previous =
            document.createElement(
                "button"
            );


        previous.type = "button";

        previous.className =
            "pagination-btn";

        previous.id =
            "previousPage";

        previous.textContent =
            "←";

        previous.disabled =
            currentPage <= 1 ||
            totalPages <= 1;


        previous.addEventListener(
            "click",
            () => {

                if (
                    currentPage >
                    1
                ) {

                    currentPage--;

                    renderCurrentPage();

                    scrollTableTop();

                }

            }
        );


        paginationContainer.appendChild(
            previous
        );


        // -------------------------------------------------
        // Page numbers
        // -------------------------------------------------

        const pages =
            getPaginationPages(
                currentPage,
                totalPages
            );


        pages.forEach(
            page => {

                if (page === "...") {

                    const ellipsis =
                        document.createElement(
                            "span"
                        );


                    ellipsis.textContent =
                        "…";


                    paginationContainer.appendChild(
                        ellipsis
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


                if (
                    page ===
                    currentPage
                ) {

                    button.classList.add(
                        "active"
                    );

                }


                button.textContent =
                    formatNumber(
                        page
                    );


                button.dataset.page =
                    page;


                button.addEventListener(
                    "click",
                    () => {

                        currentPage =
                            page;


                        renderCurrentPage();

                        scrollTableTop();

                    }
                );


                paginationContainer.appendChild(
                    button
                );

            }
        );


        // -------------------------------------------------
        // Next
        // -------------------------------------------------

        const next =
            document.createElement(
                "button"
            );


        next.type = "button";

        next.className =
            "pagination-btn";

        next.id =
            "nextPage";

        next.textContent =
            "→";

        next.disabled =
            currentPage >=
                totalPages ||
            totalPages <= 1;


        next.addEventListener(
            "click",
            () => {

                if (
                    currentPage <
                    totalPages
                ) {

                    currentPage++;

                    renderCurrentPage();

                    scrollTableTop();

                }

            }
        );


        paginationContainer.appendChild(
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


        const pages = [];


        pages.push(1);


        if (
            current > 4
        ) {

            pages.push("...");

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

            pages.push("...");

        }


        pages.push(
            total
        );


        return pages;

    }


    function scrollTableTop() {

        const tableCard =
            document.querySelector(
                ".table-card"
            );


        if (tableCard) {

            tableCard.scrollIntoView(
                {
                    behavior: "smooth",
                    block: "start"
                }
            );

        }

    }


    // =====================================================
    // FILTER EVENTS
    // =====================================================

    [
        searchInput,
        statusFilter,
        failureFilter,
        dateFilter
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
    // VIEW → BOARDROOM
    // =====================================================

    function attachViewButtons() {

        document
            .querySelectorAll(
                ".view-btn"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        () => {

                            const id =
                                button.dataset.transaction;


                            if (!id) {
                                return;
                            }


                            sessionStorage.setItem(
                                "selected_transaction",
                                id
                            );


                            window.location.href =
                                "boardroom.html";

                        }
                    );

                }
            );

    }


    // =====================================================
    // METRICS
    // =====================================================

    function updateMetricCards() {

        const total =
            transactions.length;


        const successful =
            transactions.filter(
                transaction =>
                    isSuccessfulStatus(
                        getRawStatus(
                            transaction
                        )
                    )
            ).length;


        const failed =
            transactions.filter(
                transaction =>
                    isFailedStatus(
                        getRawStatus(
                            transaction
                        )
                    )
            ).length;


        const metricValues =
            document.querySelectorAll(
                ".metric-card .metric-value"
            );


        // -------------------------------------------------
        // TOTAL
        // -------------------------------------------------

        if (
            metricValues[0]
        ) {

            metricValues[0].textContent =
                formatNumber(
                    total
                );

        }


        // -------------------------------------------------
        // SUCCESSFUL
        // -------------------------------------------------

        if (
            metricValues[1]
        ) {

            metricValues[1].textContent =
                formatNumber(
                    successful
                );

        }


        // -------------------------------------------------
        // FAILED
        // -------------------------------------------------

        if (
            metricValues[2]
        ) {

            metricValues[2].textContent =
                formatNumber(
                    failed
                );

        }


        // -------------------------------------------------
        // SUCCESS RATE
        // -------------------------------------------------

        const successMeta =
            metricValues[1]
                ?.parentElement
                ?.querySelector(
                    ".metric-meta"
                );


        if (successMeta) {

            const rate =
                total > 0
                    ? (
                        successful /
                        total *
                        100
                    )
                    : 0;


            successMeta.innerHTML = `

                <span class="positive">
                    ${rate.toFixed(1)}%
                </span>

                success rate

            `;

        }


        // -------------------------------------------------
        // FAILED RATE
        // -------------------------------------------------

        const failedMeta =
            metricValues[2]
                ?.parentElement
                ?.querySelector(
                    ".metric-meta"
                );


        if (failedMeta) {

            const rate =
                total > 0
                    ? (
                        failed /
                        total *
                        100
                    )
                    : 0;


            failedMeta.innerHTML = `

                <span class="warning">
                    ${rate.toFixed(1)}%
                </span>

                require analysis

            `;

        }

    }


    // =====================================================
    // REFRESH
    // =====================================================

    if (refreshBtn) {

        refreshBtn.addEventListener(
            "click",
            () => {

                loadTransactions();

            }
        );

    }


    // =====================================================
    // EXPORT
    // =====================================================

    if (exportBtn) {

        exportBtn.addEventListener(
            "click",
            () => {

                if (
                    !transactions.length
                ) {

                    showToast(
                        "Nothing to export",
                        "No transaction data is currently loaded."
                    );


                    return;

                }


                const rows = [

                    [
                        "Transaction ID",
                        "Customer ID",
                        "Amount",
                        "Payment Method",
                        "Failure Reason",
                        "Status",
                        "Customer Segment",
                        "Created At"
                    ]

                ];


                transactions.forEach(
                    transaction => {

                        rows.push([

                            getValue(
                                transaction,
                                [
                                    "transaction_id",
                                    "id"
                                ]
                            ),

                            getValue(
                                transaction,
                                [
                                    "customer_id",
                                    "customer"
                                ]
                            ),

                            getValue(
                                transaction,
                                [
                                    "amount",
                                    "transaction_amount"
                                ]
                            ),

                            getValue(
                                transaction,
                                [
                                    "payment_method"
                                ]
                            ),

                            getValue(
                                transaction,
                                [
                                    "failure_reason",
                                    "failure",
                                    "failure_type"
                                ]
                            ),

                            getStatusLabel(
                                getRawStatus(
                                    transaction
                                )
                            ),

                            getValue(
                                transaction,
                                [
                                    "customer_segment"
                                ]
                            ),

                            getValue(
                                transaction,
                                [
                                    "created_at",
                                    "timestamp",
                                    "date"
                                ]
                            )

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
                    "revpilot-transactions.csv";


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();


                URL.revokeObjectURL(
                    url
                );


                showToast(
                    "Export complete",
                    `${formatNumber(
                        transactions.length
                    )} transactions exported.`
                );

            }
        );

    }


    // =====================================================
    // GLOBAL SEARCH
    // =====================================================

    if (globalSearchBtn) {

        globalSearchBtn.addEventListener(
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

    if (notificationBtn) {

        notificationBtn.addEventListener(
            "click",
            () => {

                showToast(
                    "Notifications",
                    "No new critical transaction alerts."
                );

            }
        );

    }


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

                    <div class="no-results">

                        Loading live transactions...

                    </div>

                </td>

            </tr>

        `;


        if (visibleCount) {

            visibleCount.textContent =
                "Loading...";

        }

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

                    <div class="no-results">

                        <strong>
                            Unable to load live transactions
                        </strong>

                        <br>

                        <span>
                            ${escapeHtml(
                                message ||
                                "Check that FastAPI is running."
                            )}
                        </span>

                    </div>

                </td>

            </tr>

        `;


        if (visibleCount) {

            visibleCount.textContent =
                "0 transactions";

        }


        if (paginationStart) {
            paginationStart.textContent = "0";
        }


        if (paginationEnd) {
            paginationEnd.textContent = "0";
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


        const close =
            toast.querySelector(
                ".toast-close"
            );


        if (close) {

            close.addEventListener(
                "click",
                () => {

                    toast.classList.remove(
                        "show"
                    );


                    setTimeout(
                        () => {

                            if (
                                toast.parentNode
                            ) {

                                toast.remove();

                            }

                        },
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
                        () => {

                            if (
                                toast.parentNode
                            ) {

                                toast.remove();

                            }

                        },
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

    loadTransactions();


    console.log(
        "RevPilot Transactions — 5,000-record pagination enabled."
    );

});