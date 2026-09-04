from models.agent_models import AgentRecommendation, BoardroomDecision


class Orchestrator:
    """
    Central decision-maker for RevPilot AI.

    Specialist agents provide recommendations.
    The orchestrator applies hard recovery policies,
    stopping rules, escalation rules, and finance controls
    before producing the final recovery decision.
    """

    # =====================================================
    # POLICY CONSTANTS
    # =====================================================

    MAX_RETRIES = 3

    MAX_PREVIOUS_FAILURES = 5

    LOW_RESPONSE_RATE = 0.25


    # =====================================================
    # MAIN DECISION
    # =====================================================

    def decide(
        self,
        transaction: dict,
        risk: AgentRecommendation,
        timing: AgentRecommendation,
        customer: AgentRecommendation,
        offer: AgentRecommendation,
        finance: AgentRecommendation,
    ) -> BoardroomDecision:

        reasons = []

        # -------------------------------------------------
        # Safe defaults
        # -------------------------------------------------

        final_action = "DO_NOT_RETRY"

        retry_delay_hours = None

        discount_percent = 0

        guardrail_status = "APPROVED"


        # =================================================
        # EXTRACT TRANSACTION SIGNALS
        # =================================================

        retry_count = self._safe_int(
            transaction.get("retry_count", 0)
        )

        previous_failures = self._safe_int(
            transaction.get("failed_transactions", 0)
        )

        response_rate = self._safe_float(
            transaction.get(
                "customer_response_rate",
                0
            )
        )

        customer_segment = str(
            transaction.get(
                "customer_segment",
                ""
            )
        ).upper()

        amount = self._safe_float(
            transaction.get(
                "amount",
                0
            )
        )


        # =================================================
        # PROPOSED OFFER
        # =================================================

        proposed_discount = self._extract_discount(
            offer.recommendation
        )


        # =================================================
        # FINANCE VETO
        # =================================================

        finance_approved = (
            finance.recommendation ==
            "APPROVE_OFFER"
        )


        # =================================================
        # HARD STOPPING RULES
        #
        # These rules override agent recommendations.
        # =================================================

        # -------------------------------------------------
        # STOP 1 — retry limit
        # -------------------------------------------------

        if retry_count >= self.MAX_RETRIES:

            final_action = "DO_NOT_RETRY"

            reasons.append(
                f"Recovery stopped because retry count "
                f"reached the maximum allowed limit of "
                f"{self.MAX_RETRIES}"
            )


        # -------------------------------------------------
        # STOP 2 — repeated failures
        # -------------------------------------------------

        elif (
            previous_failures >=
            self.MAX_PREVIOUS_FAILURES
        ):

            final_action = "DO_NOT_RETRY"

            reasons.append(
                "Recovery stopped because the customer "
                "has a repeated payment failure history"
            )


        # -------------------------------------------------
        # STOP 3 — invalid amount
        # -------------------------------------------------

        elif amount <= 0:

            final_action = "DO_NOT_RETRY"

            reasons.append(
                "Recovery stopped because the transaction "
                "amount is invalid"
            )


        # =================================================
        # HIGH-RISK / ESCALATION
        # =================================================

        elif risk.risk_level == "HIGH":

            final_action = "HUMAN_ESCALATION"

            reasons.append(
                "Risk Agent classified the transaction "
                "as high risk"
            )

            reasons.append(
                "Human review is required before recovery"
            )


        # -------------------------------------------------
        # LOW CUSTOMER RESPONSE
        # -------------------------------------------------

        elif response_rate < self.LOW_RESPONSE_RATE:

            final_action = "HUMAN_ESCALATION"

            reasons.append(
                "Customer response rate is below the "
                "automatic recovery threshold"
            )

            reasons.append(
                "Human review is required before recovery"
            )


        # -------------------------------------------------
        # AT-RISK CUSTOMER
        # -------------------------------------------------

        elif customer_segment == "AT_RISK":

            final_action = "HUMAN_ESCALATION"

            reasons.append(
                "Customer segment is marked as at risk"
            )

            reasons.append(
                "Recovery requires operator review"
            )


        # =================================================
        # SPECIALIST DECISION
        # =================================================

        else:

            # -------------------------------------------------
            # Timing
            # -------------------------------------------------

            if timing.recommendation == "DO_NOT_RETRY":

                final_action = "DO_NOT_RETRY"

                reasons.append(
                    "Timing Agent advised against another retry"
                )


            else:

                retry_delay_hours = (
                    self._extract_delay(
                        timing.recommendation
                    )
                )


                final_action = "RETRY"


                reasons.append(
                    f"Timing Agent recommended retrying "
                    f"in {retry_delay_hours} hours"
                )


                # ---------------------------------------------
                # Customer strategy
                # ---------------------------------------------

                if (
                    customer.recommendation ==
                    "PERSONALIZED_REMINDER"
                ):

                    final_action = (
                        "PERSONALIZED_REMINDER"
                    )

                    reasons.append(
                        "Customer Agent recommended a "
                        "personalized reminder"
                    )


                elif (
                    customer.recommendation ==
                    "PAYMENT_METHOD_REMINDER"
                ):

                    final_action = (
                        "PAYMENT_METHOD_REMINDER"
                    )

                    reasons.append(
                        "Customer Agent recommended a "
                        "payment method reminder"
                    )


                elif (
                    customer.recommendation ==
                    "HUMAN_ESCALATION"
                ):

                    final_action = (
                        "HUMAN_ESCALATION"
                    )

                    reasons.append(
                        "Customer Agent recommended "
                        "human escalation"
                    )


                # ---------------------------------------------
                # Offer + Finance
                # ---------------------------------------------

                if proposed_discount > 0:

                    if finance_approved:

                        discount_percent = (
                            proposed_discount
                        )

                        reasons.append(
                            f"Offer Agent recommended a "
                            f"{discount_percent}% incentive"
                        )

                        reasons.append(
                            "Finance Guardrail approved "
                            "the incentive"
                        )

                    else:

                        # Finance vetoes the incentive,
                        # but not necessarily the entire
                        # recovery action.

                        discount_percent = 0

                        guardrail_status = (
                            "OFFER_REJECTED"
                        )

                        reasons.append(
                            "Finance Guardrail rejected "
                            "the proposed incentive"
                        )

                        reasons.append(
                            "Recovery continues without "
                            "the rejected incentive"
                        )


        # =================================================
        # CUSTOMER MESSAGE
        # =================================================

        customer_message = self._generate_message(
            final_action,
            retry_delay_hours,
            discount_percent
        )


        # =================================================
        # EXPECTED RECOVERY
        # =================================================

        if final_action in (
            "DO_NOT_RETRY",
            "HUMAN_ESCALATION"
        ):

            expected_recovery = 0.0

        else:

            expected_recovery = (
                self._calculate_expected_recovery(
                    transaction,
                    risk,
                    discount_percent
                )
            )


        # =================================================
        # OVERALL CONFIDENCE
        # =================================================

        confidence_values = [
            self._safe_float(
                risk.confidence
            ),
            self._safe_float(
                timing.confidence
            ),
            self._safe_float(
                customer.confidence
            ),
            self._safe_float(
                offer.confidence
            ),
            self._safe_float(
                finance.confidence
            )
        ]


        confidence = round(
            sum(confidence_values) /
            len(confidence_values),
            2
        )


        # =================================================
        # FINANCE STATUS
        # =================================================

        if (
            finance.recommendation ==
            "APPROVE_OFFER"
        ):

            if guardrail_status != "OFFER_REJECTED":

                guardrail_status = "APPROVED"

        else:

            guardrail_status = (
                "OFFER_REJECTED"
            )


        # =================================================
        # FINAL DECISION
        # =================================================

        decision_reason = (
            " ".join(reasons)
        )


        return BoardroomDecision(

            transaction_id=
                transaction["transaction_id"],

            final_action=
                final_action,

            retry_delay_hours=
                retry_delay_hours,

            discount_percent=
                discount_percent,

            customer_message=
                customer_message,

            expected_recovery=
                expected_recovery,

            confidence=
                confidence,

            guardrail_status=
                guardrail_status,

            decision_reason=
                decision_reason

        )


    # =====================================================
    # DELAY PARSER
    # =====================================================

    def _extract_delay(
        self,
        recommendation: str
    ):

        recommendation = str(
            recommendation
        ).upper()


        if "1_HOUR" in recommendation:

            return 1


        if "4_HOURS" in recommendation:

            return 4


        if "12_HOURS" in recommendation:

            return 12


        if "TOMORROW" in recommendation:

            return 24


        return 24


    # =====================================================
    # DISCOUNT PARSER
    # =====================================================

    def _extract_discount(
        self,
        recommendation: str
    ):

        recommendation = str(
            recommendation
        ).upper()


        if (
            "OFFER_10_PERCENT"
            in recommendation
        ):

            return 10


        if (
            "OFFER_5_PERCENT"
            in recommendation
        ):

            return 5


        return 0


    # =====================================================
    # CUSTOMER MESSAGE
    # =====================================================

    def _generate_message(
        self,
        action: str,
        retry_delay: int | None,
        discount: float
    ):

        if action == "DO_NOT_RETRY":

            return (
                "We will not automatically retry "
                "this payment."
            )


        if action == "HUMAN_ESCALATION":

            return (
                "A support specialist will assist "
                "you with completing your payment."
            )


        if discount > 0:

            return (
                f"We'll retry your payment in "
                f"{retry_delay} hours with a "
                f"{discount}% recovery incentive."
            )


        if action == "PERSONALIZED_REMINDER":

            return (
                f"We'll send you a personalized "
                f"payment reminder before retrying "
                f"in {retry_delay} hours."
            )


        if action == "PAYMENT_METHOD_REMINDER":

            return (
                "Please check or update your "
                "payment method. We'll retry the "
                f"payment in {retry_delay} hours."
            )


        return (
            f"We'll retry your payment in "
            f"{retry_delay} hours."
        )


    # =====================================================
    # EXPECTED RECOVERY
    # =====================================================

    def _calculate_expected_recovery(
        self,
        transaction,
        risk,
        discount
    ):

        amount = self._safe_float(
            transaction.get(
                "amount",
                0
            )
        )


        recovery_probability = (
            self._safe_float(
                risk.confidence
            )
        )


        discount_cost = (
            amount *
            (discount / 100)
        )


        expected_recovery = (
            amount *
            recovery_probability
        ) - discount_cost


        return round(
            max(
                0.0,
                expected_recovery
            ),
            2
        )


    # =====================================================
    # SAFE NUMBER HELPERS
    # =====================================================

    def _safe_int(
        self,
        value
    ):

        try:

            return int(
                float(value)
            )

        except (
            TypeError,
            ValueError
        ):

            return 0


    def _safe_float(
        self,
        value
    ):

        try:

            return float(value)

        except (
            TypeError,
            ValueError
        ):

            return 0.0