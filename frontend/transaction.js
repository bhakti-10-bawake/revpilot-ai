/* =========================================================
   RevPilot — Transactions Page
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* -----------------------------------------------------
       Authentication
       ----------------------------------------------------- */

    const isAuthenticated =
        sessionStorage.getItem("revpilot_authenticated") === "true";

    if (!isAuthenticated) {
        window.location.href = "index.html";
        return;
    }


    /* -----------------------------------------------------
       Navigation
       ----------------------------------------------------- */

    const pages = {
        overview: "dashboard.html",
        recovery: "recovery.html",
        boardroom: "boardroom.html",
        transactions: "transactions.html",
        customers: "customers.html",
        analytics: "analytics.html",
        audit: "audit.html",
        settings: "settings.html"
    };

    document.querySelectorAll(".nav-item").forEach((item) => {

        item.addEventListener("click", () => {

            const page = item.dataset.page;

            if (page && pages[page]) {
                window.location.href = pages[page];
            }

        });

    });


    /* -----------------------------------------------------
       Logout
       ----------------------------------------------------- */

    const logoutButton = document.querySelector(".logout-btn");

    if (logoutButton) {

        logoutButton.addEventListener("click", () => {

            sessionStorage.removeItem("revpilot_authenticated");
            sessionStorage.removeItem("revpilot_user");
            sessionStorage.removeItem("selected_transaction");

            window.location.href = "index.html";

        });

    }


    /* -----------------------------------------------------
       Transaction Data
       ----------------------------------------------------- */

    const transactions = [
        {
            id: "TXN-00001",
            customer: "Aarav Sharma",
            initials: "AS",
            amount: 12500,
            failure: "Insufficient Funds",
            status: "failed",
            recovery: "Stopped",
            date: "04 Sep 2026",
            time: "12:42 PM"
        },
        {
            id: "TXN-00002",
            customer: "Priya Mehta",
            initials: "PM",
            amount: 8400,
            failure: "Bank Error",
            status: "failed",
            recovery: "Retry Ready",
            date: "04 Sep 2026",
            time: "12:18 PM"
        },
        {
            id: "TXN-00003",
            customer: "Rohan Patel",
            initials: "RP",
            amount: 21900,
            failure: "Payment Declined",
            status: "failed",
            recovery: "Customer Intervention",
            date: "04 Sep 2026",
            time: "11:56 AM"
        },
        {
            id: "TXN-00004",
            customer: "Sneha Kulkarni",
            initials: "SK",
            amount: 5600,
            failure: "Network Timeout",
            status: "recovered",
            recovery: "Recovered",
            date: "04 Sep 2026",
            time: "11:31 AM"
        },
        {
            id: "TXN-00005",
            customer: "Vikram Rao",
            initials: "VR",
            amount: 15750,
            failure: "Card Expired",
            status: "failed",
            recovery: "Stopped",
            date: "04 Sep 2026",
            time: "10:48 AM"
        }
    ];


    /* -----------------------------------------------------
       Search & Filters
       ----------------------------------------------------- */

    const searchInput =
        document.getElementById("transactionSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const failureFilter =
        document.getElementById("failureFilter");


    function applyFilters() {

        const searchTerm = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";

        const selectedStatus =
            statusFilter
                ? statusFilter.value.toLowerCase()
                : "all";

        const selectedFailure =
            failureFilter
                ? failureFilter.value.toLowerCase()
                : "all";


        const rows =
            document.querySelectorAll(".transaction-row");

        let visibleCount = 0;


        rows.forEach((row) => {

            const transactionId =
                (row.dataset.transactionId || "").toLowerCase();

            const customer =
                (row.dataset.customer || "").toLowerCase();

            const status =
                (row.dataset.status || "").toLowerCase();

            const failure =
                (row.dataset.failure || "").toLowerCase();


            const matchesSearch =
                !searchTerm ||
                transactionId.includes(searchTerm) ||
                customer.includes(searchTerm);


            const matchesStatus =
                selectedStatus === "all" ||
                status === selectedStatus;


            const matchesFailure =
                selectedFailure === "all" ||
                failure === selectedFailure;


            const shouldShow =
                matchesSearch &&
                matchesStatus &&
                matchesFailure;


            row.style.display =
                shouldShow ? "" : "none";


            if (shouldShow) {
                visibleCount++;
            }

        });


        updateTransactionCount(visibleCount);

    }


    if (searchInput) {
        searchInput.addEventListener(
            "input",
            applyFilters
        );
    }


    if (statusFilter) {
        statusFilter.addEventListener(
            "change",
            applyFilters
        );
    }


    if (failureFilter) {
        failureFilter.addEventListener(
            "change",
            applyFilters
        );
    }


    /* -----------------------------------------------------
       Transaction Count
       ----------------------------------------------------- */

    function updateTransactionCount(count) {

        const countElement =
            document.querySelector(".table-header-meta");

        if (!countElement) return;


        const liveIndicator =
            countElement.querySelector(".live-indicator");


        countElement.innerHTML = "";


        if (liveIndicator) {
            countElement.appendChild(liveIndicator);
        }


        const text =
            document.createTextNode(
                `${count} transaction${count !== 1 ? "s" : ""}`
            );


        countElement.appendChild(text);

    }


    /* -----------------------------------------------------
       View Transaction
       ----------------------------------------------------- */

    document.querySelectorAll(".view-btn").forEach((button) => {

        button.addEventListener("click", () => {

            const transactionId =
                button.dataset.transaction;


            if (!transactionId) return;


            sessionStorage.setItem(
                "selected_transaction",
                transactionId
            );


            window.location.href =
                "boardroom.html";

        });

    });


    /* -----------------------------------------------------
       Export Button
       ----------------------------------------------------- */

    const exportButton =
        document.querySelector('[data-action="export"]');


    if (exportButton) {

        exportButton.addEventListener("click", () => {

            showToast(
                "Export prepared",
                "Transaction export is ready."
            );

        });

    }


    /* -----------------------------------------------------
       Refresh Button
       ----------------------------------------------------- */

    const refreshButton =
        document.querySelector('[data-action="refresh"]');


    if (refreshButton) {

        refreshButton.addEventListener("click", () => {

            refreshButton.classList.add("loading");


            setTimeout(() => {

                refreshButton.classList.remove("loading");


                showToast(
                    "Transactions refreshed",
                    "Latest transaction data is now displayed."
                );

            }, 900);

        });

    }


    /* -----------------------------------------------------
       Pagination
       ----------------------------------------------------- */

    document.querySelectorAll(".pagination-btn").forEach((button) => {

        button.addEventListener("click", () => {

            if (button.disabled) return;


            showToast(
                "Pagination",
                "Additional pages will appear with live transaction data."
            );

        });

    });


    document.querySelectorAll(".pagination-number").forEach((button) => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".pagination-number")
                .forEach((item) => {
                    item.classList.remove("active");
                });


            button.classList.add("active");


            showToast(
                "Page changed",
                `Showing transaction page ${button.textContent.trim()}.`
            );

        });

    });


    /* -----------------------------------------------------
       Top Search
       ----------------------------------------------------- */

    const topSearch =
        document.querySelector(".topbar-left input");


    if (topSearch) {

        topSearch.addEventListener("keydown", (event) => {

            if (event.key === "Enter") {

                showToast(
                    "Global search",
                    "Global search will be connected to the transaction index."
                );

            }

        });

    }


    /* -----------------------------------------------------
       Notifications
       ----------------------------------------------------- */

    const notificationButton =
        document.querySelector(".topbar-icon-btn");


    if (notificationButton) {

        notificationButton.addEventListener("click", () => {

            showToast(
                "Notifications",
                "No new critical alerts."
            );

        });

    }


    /* -----------------------------------------------------
       Toast Notification
       ----------------------------------------------------- */

    function showToast(title, message) {

        const existingToast =
            document.querySelector(".revpilot-toast");


        if (existingToast) {
            existingToast.remove();
        }


        const toast =
            document.createElement("div");


        toast.className =
            "revpilot-toast";


        toast.innerHTML = `
            <div class="toast-icon">✓</div>

            <div class="toast-content">
                <strong>${title}</strong>
                <span>${message}</span>
            </div>

            <button
                class="toast-close"
                aria-label="Close notification"
            >
                ×
            </button>
        `;


        document.body.appendChild(toast);


        requestAnimationFrame(() => {
            toast.classList.add("show");
        });


        const closeButton =
            toast.querySelector(".toast-close");


        closeButton.addEventListener("click", () => {
            removeToast(toast);
        });


        setTimeout(() => {
            removeToast(toast);
        }, 3500);

    }


    function removeToast(toast) {

        if (!toast) return;


        toast.classList.remove("show");


        setTimeout(() => {

            if (toast.parentNode) {
                toast.remove();
            }

        }, 250);

    }


    /* -----------------------------------------------------
       Initialize
       ----------------------------------------------------- */

    applyFilters();

    console.log(
        "RevPilot Transactions page initialized."
    );

});