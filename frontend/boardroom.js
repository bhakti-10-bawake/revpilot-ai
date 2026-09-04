/* =========================================================
   REVPILOT AI — BOARDROOM
   Live FastAPI + Finance Guardrail Breakdown
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    // =====================================================
    // CONFIG
    // =====================================================

    const API_BASE_URL = "http://127.0.0.1:8000";


    // =====================================================
    // ELEMENTS
    // =====================================================

    const runButton =
        document.getElementById("runBoardroomBtn");

    const backButton =
        document.getElementById("backToQueueBtn");

    const transactionIdElement =
        document.getElementById("transactionId");

    const transactionAmountElement =
        document.getElementById("transactionAmount");

    const transactionFailureElement =
        document.getElementById("transactionFailure");

    const transactionCustomerElement =
        document.getElementById("transactionCustomer");

    const transactionRetriesElement =
        document.getElementById("transactionRetries");

    const boardroomStatus =
        document.getElementById("boardroomStatus");

    const boardroomSubstatus =
        document.getElementById("boardroomSubstatus");

    const progressBar =
        document.getElementById("progressBar");

    const progressPercent =
        document.getElementById("progressPercent");

    const decisionStatus =
        document.getElementById("decisionStatus");

    const finalAction =
        document.getElementById("finalAction");

    const decisionReason =
        document.getElementById("decisionReason");

    const retryDelay =
        document.getElementById("retryDelay");

    const discountPercent =
        document.getElementById("discountPercent");

    const expectedRecovery =
        document.getElementById("expectedRecovery");

    const finalConfidence =
        document.getElementById("finalConfidence");

    const customerMessage =
        document.getElementById("customerMessage");

    const messageStatus =
        document.getElementById("messageStatus");

    const guardrailStatus =
        document.getElementById("guardrailStatus");

    const guardrailIcon =
        document.querySelector(".guardrail-result-icon");

    const logoutButton =
        document.getElementById("logoutBtn");


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
    // SELECTED TRANSACTION
    // =====================================================

    let currentTransactionId =
        sessionStorage.getItem(
            "selected_transaction"
        );


    if (!currentTransactionId) {

        currentTransactionId =
            transactionIdElement?.textContent
                ?.trim() ||
            "TXN-00001";


        sessionStorage.setItem(
            "selected_transaction",
            currentTransactionId
        );

    }


    if (transactionIdElement) {

        transactionIdElement.textContent =
            currentTransactionId;

    }


    // =====================================================
    // NAVIGATION
    // =====================================================

    if (backButton) {

        backButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "recovery.html";

            }
        );

    }


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
                maximumFractionDigits: 2
            }
        ).format(number);

    }


    function formatPercentage(value) {

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


    function formatPercentageOneDecimal(value) {

        const number =
            Number(value);


        if (!Number.isFinite(number)) {
            return "—";
        }


        const percentage =
            number <= 1
                ? number * 100
                : number;


        return `${percentage.toFixed(1)}%`;

    }


    function formatRecommendation(value) {

        if (!value) {
            return "—";
        }


        return String(value)
            .replaceAll("_", " ")
            .replace(
                /\b\w/g,
                letter =>
                    letter.toUpperCase()
            );

    }


    function formatDelay(value) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "—";

        }


        if (typeof value === "number") {

            return `${value} hours`;

        }


        return String(value);

    }


    function delay(milliseconds) {

        return new Promise(
            resolve =>
                setTimeout(
                    resolve,
                    milliseconds
                )
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


    // =====================================================
    // AGENT CONFIG
    // =====================================================

    const agentConfig = {

        risk: {

            recommendation:
                document.getElementById(
                    "riskRecommendation"
                ),

            confidence:
                document.getElementById(
                    "riskConfidence"
                ),

            confidenceBar:
                document.getElementById(
                    "riskConfidenceBar"
                ),

            reasoning:
                document.getElementById(
                    "riskReasoning"
                ),

            card:
                document.querySelector(
                    '[data-agent="risk"]'
                )

        },


        timing: {

            recommendation:
                document.getElementById(
                    "timingRecommendation"
                ),

            confidence:
                document.getElementById(
                    "timingConfidence"
                ),

            confidenceBar:
                document.getElementById(
                    "timingConfidenceBar"
                ),

            reasoning:
                document.getElementById(
                    "timingReasoning"
                ),

            card:
                document.querySelector(
                    '[data-agent="timing"]'
                )

        },


        customer: {

            recommendation:
                document.getElementById(
                    "customerRecommendation"
                ),

            confidence:
                document.getElementById(
                    "customerConfidence"
                ),

            confidenceBar:
                document.getElementById(
                    "customerConfidenceBar"
                ),

            reasoning:
                document.getElementById(
                    "customerReasoning"
                ),

            card:
                document.querySelector(
                    '[data-agent="customer"]'
                )

        },


        offer: {

            recommendation:
                document.getElementById(
                    "offerRecommendation"
                ),

            confidence:
                document.getElementById(
                    "offerConfidence"
                ),

            confidenceBar:
                document.getElementById(
                    "offerConfidenceBar"
                ),

            reasoning:
                document.getElementById(
                    "offerReasoning"
                ),

            card:
                document.querySelector(
                    '[data-agent="offer"]'
                )

        },


        finance: {

            recommendation:
                document.getElementById(
                    "financeRecommendation"
                ),

            confidence:
                document.getElementById(
                    "financeConfidence"
                ),

            confidenceBar:
                document.getElementById(
                    "financeConfidenceBar"
                ),

            reasoning:
                document.getElementById(
                    "financeReasoning"
                ),

            card:
                document.querySelector(
                    '[data-agent="finance"]'
                )

        }

    };


    // =====================================================
    // AGENT STATUS
    // =====================================================

    function setAgentStatus(
        agentKey,
        status
    ) {

        const config =
            agentConfig[agentKey];


        if (!config?.card) {
            return;
        }


        const statusElement =
            config.card.querySelector(
                ".agent-status"
            );


        if (!statusElement) {
            return;
        }


        const normalized =
            String(status)
                .toLowerCase()
                .replaceAll(
                    " ",
                    "-"
                );


        statusElement.className =
            `agent-status ${normalized}`;


        statusElement.textContent =
            status;

    }


    // =====================================================
    // FINANCE BREAKDOWN
    // =====================================================

    function renderFinanceBreakdown(
        finance
    ) {

        const config =
            agentConfig.finance;


        if (!config?.card) {
            return;
        }


        /*
         * Remove an old breakdown before creating
         * a new one.
         */

        const existing =
            config.card.querySelector(
                ".finance-breakdown"
            );


        if (existing) {
            existing.remove();
        }


        if (!finance) {
            return;
        }


        const valuesAvailable =

            finance.proposed_discount !== null &&
            finance.proposed_discount !== undefined;


        if (!valuesAvailable) {

            return;

        }


        const container =
            document.createElement(
                "div"
            );


        container.className =
            "finance-breakdown";


        container.innerHTML = `

            <div
                class="finance-breakdown-title"
            >
                FINANCIAL VALIDATION
            </div>


            <div
                class="finance-breakdown-grid"
            >

                <div
                    class="finance-metric"
                >

                    <span>
                        Proposed discount
                    </span>

                    <strong>
                        ${escapeHtml(
                            `${Number(
                                finance.proposed_discount
                            ) || 0}%`
                        )}
                    </strong>

                </div>


                <div
                    class="finance-metric"
                >

                    <span>
                        Discount cost
                    </span>

                    <strong>
                        ${escapeHtml(
                            formatCurrency(
                                finance.discount_amount
                            )
                        )}
                    </strong>

                </div>


                <div
                    class="finance-metric"
                >

                    <span>
                        Recovery probability
                    </span>

                    <strong>
                        ${escapeHtml(
                            formatPercentageOneDecimal(
                                finance.estimated_recovery_probability
                            )
                        )}
                    </strong>

                </div>


                <div
                    class="finance-metric"
                >

                    <span>
                        Gross recovery
                    </span>

                    <strong>
                        ${escapeHtml(
                            formatCurrency(
                                finance.expected_gross_recovery
                            )
                        )}
                    </strong>

                </div>


                <div
                    class="finance-metric"
                >

                    <span>
                        Net recovery
                    </span>

                    <strong>
                        ${escapeHtml(
                            formatCurrency(
                                finance.expected_net_recovery
                            )
                        )}
                    </strong>

                </div>


                <div
                    class="finance-metric"
                >

                    <span>
                        Minimum required
                    </span>

                    <strong>
                        ${escapeHtml(
                            formatCurrency(
                                finance.minimum_required_recovery
                            )
                        )}
                    </strong>

                </div>

            </div>


            <div
                class="finance-threshold-row"
            >

                <span>
                    Net recovery ratio
                </span>

                <strong>
                    ${escapeHtml(
                        formatPercentageOneDecimal(
                            finance.net_recovery_ratio
                        )
                    )}
                </strong>

            </div>

        `;


        /*
         * Small amount of inline styling keeps this
         * working even without modifying boardroom.css.
         */

        container.style.cssText = `
            margin-top: 12px;
            padding: 12px;
            border: 1px solid #e8edf5;
            border-radius: 12px;
            background: #f8fafc;
        `;


        const title =
            container.querySelector(
                ".finance-breakdown-title"
            );


        if (title) {

            title.style.cssText = `
                margin-bottom: 10px;
                color: #7d899d;
                font-size: 9px;
                font-weight: 700;
                letter-spacing: 0.7px;
            `;

        }


        const grid =
            container.querySelector(
                ".finance-breakdown-grid"
            );


        if (grid) {

            grid.style.cssText = `
                display: grid;
                grid-template-columns:
                    repeat(2, minmax(0, 1fr));
                gap: 8px;
            `;

        }


        container
            .querySelectorAll(
                ".finance-metric"
            )
            .forEach(
                metric => {

                    metric.style.cssText = `
                        padding: 8px;
                        border-radius: 8px;
                        background: #ffffff;
                        border: 1px solid #eef1f6;
                    `;


                    const label =
                        metric.querySelector(
                            "span"
                        );


                    const value =
                        metric.querySelector(
                            "strong"
                        );


                    if (label) {

                        label.style.cssText = `
                            display: block;
                            margin-bottom: 4px;
                            color: #8994a7;
                            font-size: 8px;
                            font-weight: 500;
                        `;

                    }


                    if (value) {

                        value.style.cssText = `
                            display: block;
                            color: #172033;
                            font-size: 11px;
                            font-weight: 700;
                        `;

                    }

                }
            );


        const threshold =
            container.querySelector(
                ".finance-threshold-row"
            );


        if (threshold) {

            threshold.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-top: 8px;
                padding-top: 8px;
                border-top: 1px solid #e8edf5;
                color: #6f7c91;
                font-size: 9px;
            `;

        }


        /*
         * Place the breakdown directly after the
         * normal reasoning block.
         */

        if (config.reasoning) {

            config.reasoning.insertAdjacentElement(
                "afterend",
                container
            );

        }

        else {

            config.card.appendChild(
                container
            );

        }

    }


    // =====================================================
    // RESET BOARDROOM
    // =====================================================

    function resetBoardroomToReady() {

        updateProgress(
            0,
            "Boardroom ready",
            `Ready to analyze ${currentTransactionId}.`
        );


        Object.keys(
            agentConfig
        ).forEach(
            agentKey => {

                const config =
                    agentConfig[agentKey];


                if (config.recommendation) {

                    config.recommendation.textContent =
                        "—";

                }


                if (config.confidence) {

                    config.confidence.textContent =
                        "—";

                }


                if (config.confidenceBar) {

                    config.confidenceBar.style.width =
                        "0%";

                }


                if (config.reasoning) {

                    config.reasoning.textContent =
                        agentKey === "finance"
                            ? "Awaiting financial validation."
                            : "Awaiting transaction analysis.";

                }


                setAgentStatus(
                    agentKey,
                    "Waiting"
                );


                if (config.card) {

                    config.card.classList.remove(
                        "completed"
                    );


                    const oldBreakdown =
                        config.card.querySelector(
                            ".finance-breakdown"
                        );


                    if (oldBreakdown) {
                        oldBreakdown.remove();
                    }

                }

            }
        );


        if (decisionStatus) {

            decisionStatus.className =
                "decision-status pending";

            decisionStatus.textContent =
                "Decision pending";

        }


        if (finalAction) {

            finalAction.textContent =
                "Awaiting boardroom";

        }


        if (decisionReason) {

            decisionReason.textContent =
                "Run the boardroom to generate a coordinated recovery decision.";

        }


        if (retryDelay) {
            retryDelay.textContent = "—";
        }


        if (discountPercent) {
            discountPercent.textContent = "0%";
        }


        if (expectedRecovery) {
            expectedRecovery.textContent = "₹0";
        }


        if (finalConfidence) {
            finalConfidence.textContent = "—";
        }


        if (customerMessage) {

            customerMessage.textContent =
                "The AI-generated customer communication will appear here after the boardroom reaches a decision.";

        }


        if (messageStatus) {

            messageStatus.textContent =
                "Not generated";

        }


        if (guardrailStatus) {

            guardrailStatus.textContent =
                "Waiting for validation";

        }


        if (guardrailIcon) {

            guardrailIcon.textContent =
                "✓";

        }


        const guardrailContainer =
            document.querySelector(
                ".guardrail-result"
            );


        if (guardrailContainer) {

            guardrailContainer.classList.remove(
                "blocked",
                "approved"
            );

        }


        sessionStorage.removeItem(
            "last_boardroom_result"
        );

    }


    // =====================================================
    // TRANSACTION CONTEXT
    // =====================================================

    function updateTransactionContext(
        transaction
    ) {

        if (!transaction) {
            return;
        }


        if (transactionIdElement) {

            transactionIdElement.textContent =
                transaction.id ||
                currentTransactionId;

        }


        if (transactionAmountElement) {

            transactionAmountElement.textContent =
                formatCurrency(
                    transaction.amount
                );

        }


        if (transactionFailureElement) {

            transactionFailureElement.textContent =
                formatRecommendation(
                    transaction.failure_reason
                );

        }


        if (transactionCustomerElement) {

            transactionCustomerElement.textContent =
                formatRecommendation(
                    transaction.customer_segment
                );

        }


        if (transactionRetriesElement) {

            transactionRetriesElement.textContent =
                transaction.retries !== undefined
                    ? transaction.retries
                    : "0";

        }

    }


    // =====================================================
    // AGENT RESULT
    // =====================================================

    function showAgentResult(
        agentKey,
        result
    ) {

        const config =
            agentConfig[agentKey];


        if (!config) {
            return;
        }


        if (config.recommendation) {

            config.recommendation.textContent =
                formatRecommendation(
                    result?.recommendation
                );

        }


        if (config.confidence) {

            config.confidence.textContent =
                formatPercentage(
                    result?.confidence
                );

        }


        if (config.confidenceBar) {

            const confidence =
                Number(
                    result?.confidence
                );


            const percentage =
                Number.isFinite(
                    confidence
                )
                    ? (
                        confidence <= 1
                            ? confidence * 100
                            : confidence
                    )
                    : 0;


            config.confidenceBar.style.width =
                `${Math.max(
                    0,
                    Math.min(
                        100,
                        percentage
                    )
                )}%`;

        }


        if (config.reasoning) {

            config.reasoning.textContent =
                result?.reasoning ||
                "No reasoning returned.";

        }


        if (config.card) {

            config.card.classList.add(
                "completed"
            );

        }


        setAgentStatus(
            agentKey,
            "Completed"
        );


        /*
         * Finance gets an additional structured
         * financial-validation panel.
         */

        if (agentKey === "finance") {

            renderFinanceBreakdown(
                result
            );

        }

    }


    // =====================================================
    // PROGRESS
    // =====================================================

    function updateProgress(
        value,
        status,
        substatus
    ) {

        if (progressBar) {

            progressBar.style.width =
                `${value}%`;

        }


        if (progressPercent) {

            progressPercent.textContent =
                `${value}%`;

        }


        if (boardroomStatus) {

            boardroomStatus.textContent =
                status;

        }


        if (boardroomSubstatus) {

            boardroomSubstatus.textContent =
                substatus;

        }

    }


    // =====================================================
    // FINAL DECISION
    // =====================================================

    function updateFinalDecision(
        decision
    ) {

        if (!decision) {
            return;
        }


        const action =
            decision.final_action ||
            decision.action ||
            decision.recommendation ||
            "Decision generated";


        const reason =
            decision.decision_reason ||
            decision.reasoning ||
            decision.reason ||
            "Decision generated from specialist recommendations.";


        const delayValue =
            decision.retry_delay_hours ??
            decision.retry_delay ??
            decision.delay_hours;


        const discount =
            decision.discount_percent ??
            decision.discount ??
            0;


        const recovery =
            decision.expected_recovery ??
            decision.expectedRecovery ??
            0;


        if (finalAction) {

            finalAction.textContent =
                formatRecommendation(
                    action
                );

        }


        if (decisionReason) {

            decisionReason.textContent =
                reason;

        }


        if (retryDelay) {

            retryDelay.textContent =
                formatDelay(
                    delayValue
                );

        }


        if (discountPercent) {

            discountPercent.textContent =
                `${Number(discount) || 0}%`;

        }


        if (expectedRecovery) {

            expectedRecovery.textContent =
                formatCurrency(
                    recovery
                );

        }


        if (finalConfidence) {

            finalConfidence.textContent =
                formatPercentage(
                    decision.confidence
                );

        }


        if (decisionStatus) {

            const normalized =
                String(
                    action
                ).toUpperCase();


            const blocked =
                normalized.includes(
                    "DO_NOT_RETRY"
                ) ||
                normalized.includes(
                    "BLOCK"
                ) ||
                normalized.includes(
                    "REJECT"
                );


            const review =
                normalized.includes(
                    "HUMAN_ESCALATION"
                ) ||
                normalized.includes(
                    "REVIEW"
                );


            if (blocked) {

                decisionStatus.className =
                    "decision-status blocked";

                decisionStatus.textContent =
                    "Recovery blocked";

            }

            else if (review) {

                decisionStatus.className =
                    "decision-status pending";

                decisionStatus.textContent =
                    "Review required";

            }

            else {

                decisionStatus.className =
                    "decision-status approved";

                decisionStatus.textContent =
                    "Decision ready";

            }

        }


        updateCustomerMessage(
            action,
            decision.customer_message
        );

    }


    // =====================================================
    // CUSTOMER MESSAGE
    // =====================================================

    function updateCustomerMessage(
        action,
        backendMessage
    ) {

        if (!customerMessage) {
            return;
        }


        if (backendMessage) {

            customerMessage.textContent =
                backendMessage;


            if (messageStatus) {

                messageStatus.textContent =
                    "Generated";

            }


            return;

        }


        const normalized =
            String(
                action
            ).toUpperCase();


        let message;


        if (
            normalized.includes(
                "DO_NOT_RETRY"
            ) ||
            normalized.includes(
                "REJECT"
            )
        ) {

            message =
                "We couldn't complete your payment. We won't automatically retry it, so you can choose another payment method when you're ready.";

        }


        else if (
            normalized.includes(
                "REMINDER"
            )
        ) {

            message =
                "Your payment could not be completed. We'll follow up at a better time to help you complete it.";

        }


        else if (
            normalized.includes(
                "HUMAN_ESCALATION"
            )
        ) {

            message =
                "A support specialist will assist you with completing your payment.";

        }


        else {

            message =
                "Your payment could not be completed. RevPilot has prepared the next recovery step based on the payment and customer signals.";

        }


        customerMessage.textContent =
            message;


        if (messageStatus) {

            messageStatus.textContent =
                "Generated";

        }

    }


    // =====================================================
    // GUARDRAIL STATUS
    // =====================================================

    function updateGuardrail(
        finance
    ) {

        if (!finance) {
            return;
        }


        const recommendation =
            String(
                finance.recommendation ||
                ""
            ).toUpperCase();


        const approved =
            recommendation.includes(
                "APPROVE"
            ) ||
            recommendation.includes(
                "ALLOW"
            );


        if (guardrailStatus) {

            guardrailStatus.textContent =
                formatRecommendation(
                    finance.recommendation
                );

        }


        if (guardrailIcon) {

            guardrailIcon.textContent =
                approved
                    ? "✓"
                    : "!";

        }


        const container =
            document.querySelector(
                ".guardrail-result"
            );


        if (container) {

            container.classList.toggle(
                "blocked",
                !approved
            );


            container.classList.toggle(
                "approved",
                approved
            );

        }

    }


    // =====================================================
    // DECISION TRAIL
    // =====================================================

    function buildDecisionTrail(
        data
    ) {

        const timeline =
            document.getElementById(
                "decisionTimeline"
            );


        if (!timeline) {
            return;
        }


        const transactionId =
            data.transaction?.id ||
            currentTransactionId;


        const financeRecommendation =
            data.agents?.finance?.recommendation ||
            "Pending";


        const action =
            data.decision?.final_action ||
            data.decision?.action ||
            data.decision?.recommendation ||
            "Decision generated";


        timeline.innerHTML = `

            <div class="timeline-item">

                <div class="timeline-marker">
                    1
                </div>

                <div class="timeline-content">

                    <strong>
                        Transaction received
                    </strong>

                    <span>
                        ${escapeHtml(
                            transactionId
                        )}
                        entered the recovery engine.
                    </span>

                </div>

            </div>


            <div class="timeline-item">

                <div class="timeline-marker">
                    2
                </div>

                <div class="timeline-content">

                    <strong>
                        Specialist agents analyzed
                    </strong>

                    <span>
                        Risk, timing, customer and offer
                        strategies were evaluated.
                    </span>

                </div>

            </div>


            <div class="timeline-item">

                <div class="timeline-marker">
                    3
                </div>

                <div class="timeline-content">

                    <strong>
                        Financial validation
                    </strong>

                    <span>
                        Finance Guardrail returned
                        ${escapeHtml(
                            formatRecommendation(
                                financeRecommendation
                            )
                        )}.
                    </span>

                </div>

            </div>


            <div class="timeline-item">

                <div class="timeline-marker">
                    4
                </div>

                <div class="timeline-content">

                    <strong>
                        Orchestrator decided
                    </strong>

                    <span>
                        Final action:
                        ${escapeHtml(
                            formatRecommendation(
                                action
                            )
                        )}.
                    </span>

                </div>

            </div>


            <div class="timeline-item">

                <div class="timeline-marker">
                    5
                </div>

                <div class="timeline-content">

                    <strong>
                        Recovery strategy prepared
                    </strong>

                    <span>
                        The coordinated recommendation is
                        ready for review or execution.
                    </span>

                </div>

            </div>

        `;

    }


    // =====================================================
    // RUN BOARDROOM
    // =====================================================

    async function runBoardroom() {

        if (!runButton) {
            return;
        }


        /*
         * Re-read the selected transaction right before
         * the API call so Batch Recovery → Boardroom
         * always uses the exact selected transaction.
         */

        const selectedId =
            sessionStorage.getItem(
                "selected_transaction"
            );


        const transactionId =
            selectedId ||
            transactionIdElement?.textContent?.trim() ||
            currentTransactionId;


        if (!transactionId) {

            showToast(
                "Transaction missing",
                "No transaction ID was selected."
            );


            return;

        }


        currentTransactionId =
            transactionId;


        sessionStorage.setItem(
            "selected_transaction",
            currentTransactionId
        );


        resetBoardroomForRun();


        runButton.disabled =
            true;


        runButton.innerHTML =
            `<span>◌</span> Running Boardroom...`;


        try {

            updateProgress(
                10,
                "Boardroom active",
                `Sending ${currentTransactionId} to the RevPilot recovery engine.`
            );


            await delay(300);


            updateProgress(
                20,
                "Agents analyzing",
                "Specialist agents are evaluating the transaction."
            );


            setAgentStatus(
                "risk",
                "Analyzing"
            );


            setAgentStatus(
                "timing",
                "Analyzing"
            );


            setAgentStatus(
                "customer",
                "Analyzing"
            );


            setAgentStatus(
                "offer",
                "Analyzing"
            );


            setAgentStatus(
                "finance",
                "Waiting"
            );


            // =================================================
            // LIVE API
            // =================================================

            const response =
                await fetch(
                    `${API_BASE_URL}/api/recover`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            transaction_id:
                                currentTransactionId
                        })
                    }
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


            // =================================================
            // TRANSACTION
            // =================================================

            updateTransactionContext(
                data.transaction
            );


            // =================================================
            // SPECIALISTS
            // =================================================

            updateProgress(
                45,
                "Specialists completed",
                "Risk, timing, customer and offer recommendations are ready."
            );


            if (data.agents?.risk) {

                showAgentResult(
                    "risk",
                    data.agents.risk
                );

            }


            if (data.agents?.timing) {

                showAgentResult(
                    "timing",
                    data.agents.timing
                );

            }


            if (data.agents?.customer) {

                showAgentResult(
                    "customer",
                    data.agents.customer
                );

            }


            if (data.agents?.offer) {

                showAgentResult(
                    "offer",
                    data.agents.offer
                );

            }


            // =================================================
            // FINANCE
            // =================================================

            updateProgress(
                70,
                "Finance validation",
                "Finance Guardrail is validating recovery economics."
            );


            setAgentStatus(
                "finance",
                "Analyzing"
            );


            await delay(250);


            if (data.agents?.finance) {

                showAgentResult(
                    "finance",
                    data.agents.finance
                );


                updateGuardrail(
                    data.agents.finance
                );

            }


            // =================================================
            // ORCHESTRATOR
            // =================================================

            updateProgress(
                88,
                "Orchestrating decision",
                "Synthesizing specialist recommendations."
            );


            await delay(250);


            updateFinalDecision(
                data.decision
            );


            buildDecisionTrail(
                data
            );


            // =================================================
            // SAVE
            // =================================================

            sessionStorage.setItem(
                "last_boardroom_result",
                JSON.stringify(data)
            );


            // =================================================
            // COMPLETE
            // =================================================

            updateProgress(
                100,
                "Decision complete",
                `${currentTransactionId} recovery strategy generated successfully.`
            );


            document
                .querySelectorAll(
                    ".agent-card"
                )
                .forEach(
                    card => {

                        card.classList.add(
                            "completed"
                        );

                    }
                );


            showToast(
                "Boardroom complete",
                `Live recovery decision generated for ${currentTransactionId}.`
            );

        }

        catch (error) {

            console.error(
                "RevPilot Boardroom error:",
                error
            );


            updateProgress(
                0,
                "Analysis failed",
                error.message ||
                "Unable to complete the recovery analysis."
            );


            showToast(
                "Backend connection failed",
                error.message ||
                "Make sure FastAPI is running on port 8000."
            );

        }

        finally {

            runButton.disabled =
                false;


            runButton.innerHTML =
                `<span>✦</span> Run Boardroom`;

        }

    }


    // =====================================================
    // RESET BEFORE RUN
    // =====================================================

    function resetBoardroomForRun() {

        if (progressBar) {

            progressBar.style.width =
                "0%";

        }


        if (progressPercent) {

            progressPercent.textContent =
                "0%";

        }


        if (decisionStatus) {

            decisionStatus.className =
                "decision-status pending";

            decisionStatus.textContent =
                "Decision pending";

        }


        if (finalAction) {

            finalAction.textContent =
                "Analyzing transaction";

        }


        if (decisionReason) {

            decisionReason.textContent =
                "The orchestrator is waiting for specialist agents.";

        }


        if (retryDelay) {

            retryDelay.textContent =
                "—";

        }


        if (discountPercent) {

            discountPercent.textContent =
                "0%";

        }


        if (expectedRecovery) {

            expectedRecovery.textContent =
                "₹0";

        }


        if (finalConfidence) {

            finalConfidence.textContent =
                "—";

        }


        if (customerMessage) {

            customerMessage.textContent =
                "Generating customer communication...";

        }


        if (messageStatus) {

            messageStatus.textContent =
                "Generating";

        }


        if (guardrailStatus) {

            guardrailStatus.textContent =
                "Waiting for validation";

        }


        if (guardrailIcon) {

            guardrailIcon.textContent =
                "✓";

        }


        Object.keys(
            agentConfig
        ).forEach(
            agentKey => {

                const config =
                    agentConfig[agentKey];


                if (config.recommendation) {

                    config.recommendation.textContent =
                        "Analyzing...";

                }


                if (config.confidence) {

                    config.confidence.textContent =
                        "—";

                }


                if (config.confidenceBar) {

                    config.confidenceBar.style.width =
                        "0%";

                }


                setAgentStatus(
                    agentKey,
                    "Analyzing"
                );


                if (config.card) {

                    config.card.classList.remove(
                        "completed"
                    );


                    const breakdown =
                        config.card.querySelector(
                            ".finance-breakdown"
                        );


                    if (breakdown) {

                        breakdown.remove();

                    }

                }

            }
        );

    }


    // =====================================================
    // SEARCH
    // =====================================================

    const searchBtn =
        document.getElementById(
            "searchBtn"
        );


    if (searchBtn) {

        searchBtn.addEventListener(
            "click",
            () => {

                showToast(
                    "Search",
                    "Open Transactions to search the live dataset."
                );

            }
        );

    }


    // =====================================================
    // NOTIFICATIONS
    // =====================================================

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
                    `${currentTransactionId} is ready for Boardroom analysis.`
                );

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
                    ${escapeHtml(title)}
                </strong>


                <span>
                    ${escapeHtml(message)}
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
                        () =>
                            toast.remove(),
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
                        () =>
                            toast.remove(),
                        250
                    );

                }

            },
            3500
        );

    }


    // =====================================================
    // RUN BUTTON
    // =====================================================

    if (runButton) {

        runButton.addEventListener(
            "click",
            runBoardroom
        );

    }


    // =====================================================
    // INITIAL STATE
    // =====================================================

    resetBoardroomToReady();


    console.log(
        `RevPilot Boardroom ready for ${currentTransactionId}.`
    );

});