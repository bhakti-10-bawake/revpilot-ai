/* =========================================================
   REVPILOT AI — BATCH RECOVERY
   Live Batch Recovery Integration
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIG
       ===================================================== */

    const API_BASE_URL =
        "http://127.0.0.1:8000";


    /* =====================================================
       ELEMENTS
       ===================================================== */

    const runBatchBtn =
        document.getElementById(
            "runBatchBtn"
        );

    const simulationLabel =
        document.getElementById(
            "simulationLabel"
        );

    const totalTransactions =
        document.getElementById(
            "totalTransactions"
        );

    const failedPayments =
        document.getElementById(
            "failedPayments"
        );

    const revenueAtRisk =
        document.getElementById(
            "revenueAtRisk"
        );

    const recoverableRevenue =
        document.getElementById(
            "recoverableRevenue"
        );

    const recoveredRevenue =
        document.getElementById(
            "recoveredRevenue"
        );

    const recoveryRate =
        document.getElementById(
            "recoveryRate"
        );

    const automaticCount =
        document.getElementById(
            "automaticCount"
        );

    const reviewCount =
        document.getElementById(
            "reviewCount"
        );

    const blockedCount =
        document.getElementById(
            "blockedCount"
        );

    const retryLimitCount =
        document.getElementById(
            "retryLimitCount"
        );

    const highRiskCount =
        document.getElementById(
            "highRiskCount"
        );

    const financeGuardrailCount =
        document.getElementById(
            "financeGuardrailCount"
        );

    const repeatedFailureCount =
        document.getElementById(
            "repeatedFailureCount"
        );

    const funnelFailed =
        document.getElementById(
            "funnelFailed"
        );

    const funnelEligible =
        document.getElementById(
            "funnelEligible"
        );

    const funnelEvaluated =
        document.getElementById(
            "funnelEvaluated"
        );

    const funnelRecovery =
        document.getElementById(
            "funnelRecovery"
        );

    const outcomeStatus =
        document.getElementById(
            "outcomeStatus"
        );

    const opportunitiesList =
        document.getElementById(
            "opportunitiesList"
        );

    const viewQueueBtn =
        document.getElementById(
            "viewQueueBtn"
        );

    const notificationBtn =
        document.getElementById(
            "notificationBtn"
        );

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    /* =====================================================
       AUTHENTICATION
       ===================================================== */

    const authenticated =
        sessionStorage.getItem(
            "revpilot_authenticated"
        ) === "true";


    if (!authenticated) {

        /*
         * Temporarily disabled so the prototype can
         * still be tested when opened directly.
         *
         * Enable this later when the final login flow
         * is complete.
         */

        // window.location.href = "index.html";

    }


    /* =====================================================
       NAVIGATION
       ===================================================== */

    document
        .querySelectorAll(".nav-item")
        .forEach((item) => {

            item.addEventListener(
                "click",
                (event) => {

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

        });


    /* =====================================================
       LOGOUT
       ===================================================== */

    if (logoutBtn) {

        logoutBtn.addEventListener(
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

    function formatNumber(
        value
    ) {

        const number =
            Number(value);


        if (!Number.isFinite(number)) {
            return "0";
        }


        return number.toLocaleString(
            "en-IN"
        );

    }


    function formatCurrency(
        value
    ) {

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


    function formatPercent(
        value
    ) {

        const number =
            Number(value);


        if (!Number.isFinite(number)) {
            return "0%";
        }


        return `${number.toFixed(2)}%`;

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


    function formatLabel(
        value
    ) {

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


    /* =====================================================
       LOAD BATCH RESULT
       ===================================================== */

    async function loadBatchRecovery() {

        if (!runBatchBtn) {
            return;
        }


        setRunningState();


        try {

            const response =
                await fetch(
                    `${API_BASE_URL}/api/batch-recovery`
                );


            if (!response.ok) {

                let message =
                    `Backend returned HTTP ${response.status}.`;


                try {

                    const errorData =
                        await response.json();


                    if (errorData?.detail) {

                        message =
                            errorData.detail;

                    }

                }

                catch {
                    // Keep fallback message.
                }


                throw new Error(
                    message
                );

            }


            const data =
                await response.json();


            /*
             * Save the complete batch result so
             * other pages can use the latest simulation.
             */

            sessionStorage.setItem(
                "last_batch_result",
                JSON.stringify(data)
            );


            updateSummary(
                data.summary
            );


            updateOutcomes(
                data.outcomes
            );


            updateStoppingRules(
                data.stopping_rules
            );


            updateFunnel(
                data
            );


            updateOpportunities(
                data.transactions
            );


            setCompleteState();


            showToast(
                "Batch recovery complete",
                "5,000 transaction records were evaluated using the current recovery policy."
            );

        }

        catch (error) {

            console.error(
                "Batch recovery failed:",
                error
            );


            setErrorState(
                error.message
            );


            showToast(
                "Batch recovery failed",
                error.message ||
                "Make sure FastAPI is running on port 8000."
            );

        }

        finally {

            runBatchBtn.disabled =
                false;

            runBatchBtn.innerHTML =
                `<span>✦</span> Run Batch Recovery`;

        }

    }


    /* =====================================================
       SUMMARY
       ===================================================== */

    function updateSummary(
        summary
    ) {

        if (!summary) {
            return;
        }


        if (totalTransactions) {

            totalTransactions.textContent =
                formatNumber(
                    summary.total_transactions
                );

        }


        if (failedPayments) {

            failedPayments.textContent =
                formatNumber(
                    summary.failed_payments
                );

        }


        if (revenueAtRisk) {

            revenueAtRisk.textContent =
                formatCurrency(
                    summary.revenue_at_risk
                );

        }


        if (recoverableRevenue) {

            recoverableRevenue.textContent =
                formatCurrency(
                    summary.recoverable_revenue
                );

        }


        if (recoveredRevenue) {

            recoveredRevenue.textContent =
                formatCurrency(
                    summary.recovered_revenue
                );

        }


        if (recoveryRate) {

            recoveryRate.textContent =
                formatPercent(
                    summary.recovery_rate
                );

        }

    }


    /* =====================================================
       OUTCOMES
       ===================================================== */

    function updateOutcomes(
        outcomes
    ) {

        if (!outcomes) {
            return;
        }


        if (automaticCount) {

            automaticCount.textContent =
                formatNumber(
                    outcomes.automatic
                );

        }


        if (reviewCount) {

            reviewCount.textContent =
                formatNumber(
                    outcomes.review
                );

        }


        if (blockedCount) {

            blockedCount.textContent =
                formatNumber(
                    outcomes.blocked
                );

        }


        if (outcomeStatus) {

            outcomeStatus.textContent =
                "Policy evaluated";

            outcomeStatus.className =
                "status-chip complete";

        }

    }


    /* =====================================================
       STOPPING RULES
       ===================================================== */

    function updateStoppingRules(
        rules
    ) {

        if (!rules) {
            return;
        }


        if (retryLimitCount) {

            retryLimitCount.textContent =
                formatNumber(
                    rules.retry_limit
                );

        }


        if (highRiskCount) {

            highRiskCount.textContent =
                formatNumber(
                    rules.high_risk
                );

        }


        if (financeGuardrailCount) {

            financeGuardrailCount.textContent =
                formatNumber(
                    rules.finance_guardrail
                );

        }


        if (repeatedFailureCount) {

            repeatedFailureCount.textContent =
                formatNumber(
                    rules.repeated_failure
                );

        }

    }


    /* =====================================================
       FUNNEL
       ===================================================== */

    function updateFunnel(
        data
    ) {

        const summary =
            data.summary || {};

        const outcomes =
            data.outcomes || {};


        const failed =
            Number(
                summary.failed_payments
            ) || 0;


        const eligible =
            (
                Number(
                    outcomes.automatic
                ) || 0
            ) +
            (
                Number(
                    outcomes.review
                ) || 0
            );


        const evaluated =
            failed;


        const recoveryOpportunity =
            Number(
                summary.recoverable_revenue
            ) || 0;


        if (funnelFailed) {

            funnelFailed.textContent =
                formatNumber(
                    failed
                );

        }


        if (funnelEligible) {

            funnelEligible.textContent =
                formatNumber(
                    eligible
                );

        }


        if (funnelEvaluated) {

            funnelEvaluated.textContent =
                formatNumber(
                    evaluated
                );

        }


        if (funnelRecovery) {

            funnelRecovery.textContent =
                formatCurrency(
                    recoveryOpportunity
                );

        }

    }


    /* =====================================================
       TOP OPPORTUNITIES
       ===================================================== */

    function updateOpportunities(
        transactionData
    ) {

        if (!opportunitiesList) {
            return;
        }


        if (
            !Array.isArray(
                transactionData
            ) ||
            transactionData.length === 0
        ) {

            opportunitiesList.innerHTML = `

                <div class="opportunity-empty">

                    <div class="empty-icon">
                        ◫
                    </div>

                    <strong>
                        No recovery opportunities found.
                    </strong>

                    <span>
                        The batch did not return any transaction records.
                    </span>

                </div>

            `;

            return;

        }


        /*
         * Only show the highest-value cases.
         * Keep the full result stored in sessionStorage.
         */

        const opportunities =
            [...transactionData]
                .sort(
                    (
                        a,
                        b
                    ) =>
                        Number(
                            b.estimated_recovery || 0
                        ) -
                        Number(
                            a.estimated_recovery || 0
                        )
                )
                .slice(
                    0,
                    8
                );


        opportunitiesList.innerHTML =
            opportunities
                .map(
                    (
                        transaction,
                        index
                    ) => {

                        const transactionId =
                            transaction.transaction_id ||
                            "Unknown";


                        const estimatedRecovery =
                            Number(
                                transaction.estimated_recovery
                            ) || 0;


                        const amount =
                            Number(
                                transaction.amount
                            ) || 0;


                        const outcome =
                            String(
                                transaction.outcome ||
                                "UNKNOWN"
                            ).toLowerCase();


                        const badgeClass =
                            outcome === "automatic"
                                ? "automatic"
                                : outcome === "review"
                                    ? "review"
                                    : "blocked";


                        return `

                            <div
                                class="opportunity-row"
                                data-transaction-id="${escapeHtml(
                                    transactionId
                                )}"
                            >

                                <div class="opportunity-rank">
                                    ${index + 1}
                                </div>


                                <div class="opportunity-main">

                                    <strong>
                                        ${escapeHtml(
                                            transactionId
                                        )}
                                    </strong>

                                    <span>
                                        ${escapeHtml(
                                            formatLabel(
                                                transaction.failure_reason
                                            )
                                        )}
                                        ·
                                        ${escapeHtml(
                                            formatLabel(
                                                transaction.customer_segment
                                            )
                                        )}
                                    </span>

                                </div>


                                <div class="opportunity-amount">

                                    <strong>
                                        ${formatCurrency(
                                            amount
                                        )}
                                    </strong>

                                    <span>
                                        Est. recovery
                                        ${formatCurrency(
                                            estimatedRecovery
                                        )}
                                    </span>

                                </div>


                                <span
                                    class="opportunity-badge ${badgeClass}"
                                >
                                    ${escapeHtml(
                                        formatLabel(
                                            transaction.outcome
                                        )
                                    )}
                                </span>

                            </div>

                        `;

                    }
                )
                .join("");


        attachOpportunityClicks();

    }


    /* =====================================================
       OPPORTUNITY → BOARDROOM
       ===================================================== */

    function attachOpportunityClicks() {

        document
            .querySelectorAll(
                ".opportunity-row"
            )
            .forEach(
                (
                    row
                ) => {

                    row.addEventListener(
                        "click",
                        () => {

                            const transactionId =
                                row.dataset.transactionId;


                            if (!transactionId) {
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


    /* =====================================================
       NAVIGATE TO RECOVERY QUEUE
       ===================================================== */

    if (viewQueueBtn) {

        viewQueueBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "recovery.html";

            }
        );

    }


    /* =====================================================
       RUN BUTTON
       ===================================================== */

    if (runBatchBtn) {

        runBatchBtn.addEventListener(
            "click",
            loadBatchRecovery
        );

    }


    /* =====================================================
       INITIAL STATE
       ===================================================== */

    function setReadyState() {

        if (simulationLabel) {

            simulationLabel.textContent =
                "Ready to simulate";

        }


        if (outcomeStatus) {

            outcomeStatus.textContent =
                "Awaiting batch";

        }

    }


    /* =====================================================
       RUNNING STATE
       ===================================================== */

    function setRunningState() {

        document.body.classList.add(
            "batch-running"
        );

        document.body.classList.remove(
            "batch-complete"
        );


        if (simulationLabel) {

            simulationLabel.textContent =
                "Running simulation...";

        }


        if (outcomeStatus) {

            outcomeStatus.textContent =
                "Evaluating...";

            outcomeStatus.className =
                "status-chip";

        }


        if (runBatchBtn) {

            runBatchBtn.disabled =
                true;

            runBatchBtn.innerHTML =
                `<span>◌</span> Running Batch...`;

        }

    }


    /* =====================================================
       COMPLETE STATE
       ===================================================== */

    function setCompleteState() {

        document.body.classList.remove(
            "batch-running"
        );

        document.body.classList.add(
            "batch-complete"
        );


        if (simulationLabel) {

            simulationLabel.textContent =
                "Simulation complete";

        }

    }


    /* =====================================================
       ERROR STATE
       ===================================================== */

    function setErrorState(
        message
    ) {

        document.body.classList.remove(
            "batch-running"
        );


        if (simulationLabel) {

            simulationLabel.textContent =
                "Simulation failed";

        }


        if (outcomeStatus) {

            outcomeStatus.textContent =
                "Backend error";

            outcomeStatus.className =
                "status-chip error";

        }


        if (opportunitiesList) {

            opportunitiesList.innerHTML = `

                <div class="opportunity-empty">

                    <div class="empty-icon">
                        !
                    </div>

                    <strong>
                        Batch analysis could not be completed.
                    </strong>

                    <span>
                        ${escapeHtml(
                            message ||
                            "Check that FastAPI is running."
                        )}
                    </span>

                </div>

            `;

        }

    }


    /* =====================================================
       NOTIFICATIONS
       ===================================================== */

    if (notificationBtn) {

        notificationBtn.addEventListener(
            "click",
            () => {

                showToast(
                    "Batch Recovery",
                    "Run the batch to generate the latest recovery simulation."
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
       START
       ===================================================== */

    setReadyState();


    /*
     * We intentionally do NOT run the batch automatically.
     * The pitch should show the judge clicking the button
     * and watching the results populate.
     */

    console.log(
        "RevPilot Batch Recovery ready."
    );

});