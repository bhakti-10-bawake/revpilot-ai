from models.agent_models import AgentRecommendation, BoardroomDecision


class Orchestrator:
    """
    Combines recommendations from all specialist agents
    and produces the final recovery decision.
    """

    def decide(
        self,
        transaction: dict,
        risk: AgentRecommendation,
        timing: AgentRecommendation,
        customer: AgentRecommendation,
        offer: AgentRecommendation,
        finance: AgentRecommendation,
    ) -> BoardroomDecision:

        # --------------------------------
        # Start with the safest option
        # --------------------------------

        final_action = "DO_NOT_RETRY"
        retry_delay_hours = None
        discount_percent = 0

        reasons = []

        # --------------------------------
        # Finance has veto power
        # --------------------------------

        finance_approved = (
            finance.recommendation == "APPROVE_OFFER"
        )

        # --------------------------------
        # Check overall risk
        # --------------------------------

        if risk.risk_level == "HIGH":

            final_action = "DO_NOT_RETRY"

            reasons.append(
                "Risk Agent classified the recovery risk as high"
            )

        else:

            # --------------------------------
            # Timing decision
            # --------------------------------

            if timing.recommendation == "DO_NOT_RETRY":

                final_action = "DO_NOT_RETRY"

                reasons.append(
                    "Timing Agent advised against another retry"
                )

            else:

                final_action = "RETRY"

                retry_delay_hours = self._extract_delay(
                    timing.recommendation
                )

                reasons.append(
                    f"Timing Agent recommended retrying "
                    f"in {retry_delay_hours} hours"
                )

                # --------------------------------
                # Customer strategy
                # --------------------------------

                if customer.recommendation == "PERSONALIZED_REMINDER":

                    final_action = "PERSONALIZED_REMINDER"

                    reasons.append(
                        "Customer Agent recommended a personalized reminder"
                    )

                elif customer.recommendation == "PAYMENT_METHOD_REMINDER":

                    final_action = "PAYMENT_METHOD_REMINDER"

                    reasons.append(
                        "Customer Agent recommended a payment method reminder"
                    )

                elif customer.recommendation == "HUMAN_ESCALATION":

                    final_action = "HUMAN_ESCALATION"

                    reasons.append(
                        "Customer Agent recommended human escalation"
                    )

                # --------------------------------
                # Offer decision
                # --------------------------------

                if finance_approved:

                    if offer.recommendation == "OFFER_5_PERCENT":
                        discount_percent = 5

                    elif offer.recommendation == "OFFER_10_PERCENT":
                        discount_percent = 10

                    if discount_percent > 0:

                        reasons.append(
                            f"Offer Agent recommended a "
                            f"{discount_percent}% incentive"
                        )

                        reasons.append(
                            "Finance Guardrail approved the incentive"
                        )

                else:

                    discount_percent = 0

                    reasons.append(
                        "Finance Guardrail rejected the proposed incentive"
                    )

        # --------------------------------
        # Customer message
        # --------------------------------

        customer_message = self._generate_message(
            final_action,
            retry_delay_hours,
            discount_percent
        )

        # --------------------------------
        # Expected recovery
        # --------------------------------
        
        # If we are not going to retry, there is
        # no expected recovery from automation.
        if final_action == "DO_NOT_RETRY":

            expected_recovery = 0.0

        else:

            expected_recovery = self._calculate_expected_recovery(
                transaction,
                risk,
                finance,
                discount_percent
            )

        # --------------------------------
        # Overall confidence
        # --------------------------------

        confidence = round(
            (
                risk.confidence
                + timing.confidence
                + customer.confidence
                + offer.confidence
                + finance.confidence
            ) / 5,
            2
        )

        # --------------------------------
        # Guardrail status
        # --------------------------------

        if finance_approved:

            guardrail_status = "APPROVED"

        else:

            guardrail_status = "OFFER_REJECTED"

        return BoardroomDecision(
            transaction_id=transaction["transaction_id"],
            final_action=final_action,
            retry_delay_hours=retry_delay_hours,
            discount_percent=discount_percent,
            customer_message=customer_message,
            expected_recovery=expected_recovery,
            confidence=confidence,
            guardrail_status=guardrail_status,
            decision_reason=" ".join(reasons)
        )

    # --------------------------------
    # Helper methods
    # --------------------------------

    def _extract_delay(self, recommendation: str):

        if "1_HOUR" in recommendation:
            return 1

        if "4_HOURS" in recommendation:
            return 4

        if "12_HOURS" in recommendation:
            return 12

        if "TOMORROW" in recommendation:
            return 24

        return 24

    def _generate_message(
        self,
        action: str,
        retry_delay: int | None,
        discount: float
    ):

        if action == "DO_NOT_RETRY":

            return (
                "We will not automatically retry this payment."
            )

        if action == "HUMAN_ESCALATION":

            return (
                "A support specialist will assist you "
                "with completing your payment."
            )

        if discount > 0:

            return (
                f"We'll retry your payment in {retry_delay} hours "
                f"with a {discount}% recovery incentive."
            )

        if action == "PERSONALIZED_REMINDER":

            return (
                f"We'll send you a personalized payment reminder "
                f"before retrying in {retry_delay} hours."
            )

        if action == "PAYMENT_METHOD_REMINDER":

            return (
                "Please check or update your payment method. "
                f"We'll retry the payment in {retry_delay} hours."
            )

        return (
            f"We'll retry your payment in {retry_delay} hours."
        )

    def _calculate_expected_recovery(
        self,
        transaction,
        risk,
        finance,
        discount
    ):

        amount = transaction["amount"]

        recovery_probability = risk.confidence

        discount_cost = amount * (
            discount / 100
        )

        return round(
            (amount * recovery_probability)
            - discount_cost,
            2
        )