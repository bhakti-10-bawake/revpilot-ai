/* =========================================================
   REVPILOT AI — CUSTOMERS
   Customer Intelligence
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
       ELEMENTS
       ===================================================== */

    const searchInput =
        document.getElementById("customerSearch");

    const riskFilter =
        document.getElementById("riskFilter");

    const segmentFilter =
        document.getElementById("segmentFilter");

    const customerRows =
        document.querySelectorAll(".customer-row");

    const logoutButton =
        document.querySelector(".logout-btn");

    const refreshButton =
        document.querySelector(
            '[data-action="refresh"]'
        );

    const exportButton =
        document.querySelector(
            '[data-action="export"]'
        );

    const notificationButton =
        document.querySelector(
            ".topbar-icon-btn"
        );


    /* =====================================================
       PAGE NAVIGATION
       ===================================================== */

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

                window.location.href =
                    "index.html";

            }
        );

    }


    /* =====================================================
       NORMALIZE TEXT
       ===================================================== */

    function normalize(value) {

        return String(value || "")
            .toLowerCase()
            .trim();

    }


    /* =====================================================
       CUSTOMER FILTERING
       ===================================================== */

    function filterCustomers() {

        const searchTerm =
            searchInput
                ? normalize(
                    searchInput.value
                )
                : "";

        const selectedRisk =
            riskFilter
                ? normalize(
                    riskFilter.value
                )
                : "all";

        const selectedSegment =
            segmentFilter
                ? normalize(
                    segmentFilter.value
                )
                : "all";


        let visibleCount = 0;


        customerRows.forEach((row) => {

            const customerName =
                normalize(
                    row.dataset.customer
                );

            const customerRisk =
                normalize(
                    row.dataset.risk
                );

            const customerSegment =
                normalize(
                    row.dataset.segment
                );

            const rowText =
                normalize(
                    row.textContent
                );


            const matchesSearch =
                !searchTerm ||
                customerName.includes(
                    searchTerm
                ) ||
                rowText.includes(
                    searchTerm
                );


            const matchesRisk =
                selectedRisk === "all" ||
                customerRisk === selectedRisk;


            const matchesSegment =
                selectedSegment === "all" ||
                customerSegment === selectedSegment;


            const visible =
                matchesSearch &&
                matchesRisk &&
                matchesSegment;


            row.style.display =
                visible ? "" : "none";


            if (visible) {
                visibleCount++;
            }

        });


        updateCustomerCount(
            visibleCount
        );

        updateEmptyState(
            visibleCount
        );

    }


    /* =====================================================
       CUSTOMER COUNT
       ===================================================== */

    function updateCustomerCount(
        count
    ) {

        const meta =
            document.querySelector(
                ".table-header-meta"
            );


        if (!meta) {
            return;
        }


        meta.innerHTML = `

            <span class="live-indicator">
                <span></span>
                Live
            </span>

            ${count}
            customer${count === 1 ? "" : "s"}

        `;

    }


    /* =====================================================
       EMPTY STATE
       ===================================================== */

    function updateEmptyState(
        count
    ) {

        const tbody =
            document.querySelector(
                ".customer-table tbody"
            );


        if (!tbody) {
            return;
        }


        let emptyRow =
            document.querySelector(
                ".customer-empty-row"
            );


        if (count === 0) {

            if (!emptyRow) {

                emptyRow =
                    document.createElement(
                        "tr"
                    );


                emptyRow.className =
                    "customer-empty-row";


                emptyRow.innerHTML = `

                    <td colspan="7">

                        <div class="no-results">

                            <strong>
                                No customers found
                            </strong>

                            <span>
                                Try changing your search or filters.
                            </span>

                        </div>

                    </td>

                `;


                tbody.appendChild(
                    emptyRow
                );

            }

        }

        else {

            if (emptyRow) {
                emptyRow.remove();
            }

        }

    }


    /* =====================================================
       SEARCH + FILTER EVENTS
       ===================================================== */

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            filterCustomers
        );

    }


    if (riskFilter) {

        riskFilter.addEventListener(
            "change",
            filterCustomers
        );

    }


    if (segmentFilter) {

        segmentFilter.addEventListener(
            "change",
            filterCustomers
        );

    }


    /* =====================================================
       CUSTOMER VIEW
       ===================================================== */

    document
        .querySelectorAll(".view-btn")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const customer =
                        button.dataset.customer;


                    if (!customer) {
                        return;
                    }


                    sessionStorage.setItem(
                        "selected_customer",
                        customer
                    );


                    showToast(
                        "Customer selected",
                        `Opening intelligence for ${customer}.`
                    );


                    /*
                     * We don't yet have a dedicated
                     * customer-detail page.
                     *
                     * Pass the customer context into
                     * the Boardroom for the prototype.
                     */

                    setTimeout(
                        () => {

                            window.location.href =
                                "boardroom.html";

                        },
                        500
                    );

                }
            );

        });


    /* =====================================================
       REFRESH
       ===================================================== */

    if (refreshButton) {

        refreshButton.addEventListener(
            "click",
            () => {

                const originalHTML =
                    refreshButton.innerHTML;


                refreshButton.disabled =
                    true;


                refreshButton.innerHTML =
                    `<span>↻</span> Refreshing...`;


                setTimeout(
                    () => {

                        refreshButton.disabled =
                            false;


                        refreshButton.innerHTML =
                            originalHTML;


                        filterCustomers();


                        showToast(
                            "Customer data refreshed",
                            "Latest customer intelligence is now displayed."
                        );

                    },
                    800
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
            exportCustomers
        );

    }


    function exportCustomers() {

        const rows = [
            [
                "Customer",
                "Risk",
                "Segment",
                "Lifetime Value",
                "Failed Payments",
                "Recovery Rate"
            ]
        ];


        customerRows.forEach((row) => {

            if (row.style.display === "none") {
                return;
            }


            const customer =
                row.dataset.customer || "";


            const risk =
                row.dataset.risk || "";


            const segment =
                row.dataset.segment || "";


            const cells =
                row.querySelectorAll("td");


            const value =
                cells[1]
                    ?.querySelector("strong")
                    ?.textContent.trim() || "";


            const failedPayments =
                cells[2]
                    ?.querySelector("strong")
                    ?.textContent.trim() || "";


            const recoveryRate =
                cells[3]
                    ?.querySelector("strong")
                    ?.textContent.trim() || "";


            rows.push([
                customer,
                risk,
                segment,
                value,
                failedPayments,
                recoveryRate
            ]);

        });


        const csv =
            rows
                .map((row) =>
                    row
                        .map((value) =>
                            `"${String(value)
                                .replaceAll(
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
            "revpilot-customers.csv";


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
            "Customer portfolio exported successfully."
        );

    }


    /* =====================================================
       NOTIFICATIONS
       ===================================================== */

    if (notificationButton) {

        notificationButton.addEventListener(
            "click",
            () => {

                showToast(
                    "Notifications",
                    "No new critical customer alerts."
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
                    ${escapeHtml(title)}
                </strong>

                <span>
                    ${escapeHtml(message)}
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


    /* =====================================================
       ESCAPE HTML
       ===================================================== */

    function escapeHtml(
        value
    ) {

        return String(value ?? "")
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


    /* =====================================================
       INITIALIZE
       ===================================================== */

    filterCustomers();


    console.log(
        "RevPilot Customers initialized successfully."
    );

});