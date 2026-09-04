from models.agent_models import AgentRecommendation


class FinanceAgent:
    """
    Finance Guardrail

    Validates whether a proposed recovery incentive
    is economically safe for the business.

    The agent evaluates:

    1. Maximum discount percentage
    2. Maximum discount amount
    3. Expected recovery
    4. Expected net recovery
    5. Minimum acceptable net recovery ratio
    """

    MAX_DISCOUNT_PERCENT = 10
    MAX_DISCOUNT_AMOUNT = 500
    MIN_NET_RECOVERY_PERCENT = 0.70

    def analyze(
        self,
        transaction: dict,
        proposed_discount: float
    ) -> AgentRecommendation:

        # =================================================
        # TRANSACTION VALUES
        # =================================================

        amount = float(
            transaction.get(
                "amount",
                0
            ) or 0
        )

        response_rate = float(
            transaction.get(
                "customer_response_rate",
                0
            ) or 0
        )


        # =================================================
        # CALCULATE DISCOUNT
        # =================================================

        discount_amount = (
            amount *
            (proposed_discount / 100)
        )


        # =================================================
        # ESTIMATE RECOVERY PROBABILITY
        # =================================================

        estimated_recovery_probability = (
            0.60 +
            response_rate * 0.20
        )

        # Keep the probability inside a sensible range.

        estimated_recovery_probability = max(
            0.0,
            min(
                1.0,
                estimated_recovery_probability
            )
        )


        # =================================================
        # EXPECTED GROSS RECOVERY
        # =================================================

        expected_gross_recovery = (
            amount *
            estimated_recovery_probability
        )


        # =================================================
        # EXPECTED NET RECOVERY
        # =================================================

        expected_net_recovery = (
            expected_gross_recovery -
            discount_amount
        )


        # =================================================
        # NET RECOVERY RATIO
        # =================================================

        if amount > 0:

            net_recovery_ratio = (
                expected_net_recovery /
                amount
            )

        else:

            net_recovery_ratio = 0.0


        # =================================================
        # FINANCIAL THRESHOLD
        # =================================================

        minimum_required_recovery = (
            amount *
            self.MIN_NET_RECOVERY_PERCENT
        )


        # =================================================
        # REASONS
        # =================================================

        reasons = []


        # =================================================
        # GUARDRAIL 1
        # MAXIMUM DISCOUNT PERCENTAGE
        # =================================================

        if (
            proposed_discount >
            self.MAX_DISCOUNT_PERCENT
        ):

            recommendation = (
                "REJECT_OFFER"
            )

            confidence = 0.98

            reasons.append(
                f"discount percentage "
                f"({proposed_discount}%) exceeds "
                f"the maximum allowed "
                f"percentage of "
                f"{self.MAX_DISCOUNT_PERCENT}%"
            )


        # =================================================
        # GUARDRAIL 2
        # MAXIMUM DISCOUNT AMOUNT
        # =================================================

        elif (
            discount_amount >
            self.MAX_DISCOUNT_AMOUNT
        ):

            recommendation = (
                "REJECT_OFFER"
            )

            confidence = 0.95

            reasons.append(
                f"discount cost of "
                f"₹{discount_amount:.2f} exceeds "
                f"the maximum permitted discount "
                f"amount of "
                f"₹{self.MAX_DISCOUNT_AMOUNT:.2f}"
            )


        # =================================================
        # GUARDRAIL 3
        # MINIMUM NET RECOVERY
        # =================================================

        elif (
            net_recovery_ratio <
            self.MIN_NET_RECOVERY_PERCENT
        ):

            recommendation = (
                "REJECT_OFFER"
            )

            confidence = 0.90

            reasons.append(
                f"expected net recovery ratio of "
                f"{net_recovery_ratio * 100:.1f}% "
                f"is below the required "
                f"{self.MIN_NET_RECOVERY_PERCENT * 100:.1f}%"
            )


        # =================================================
        # APPROVED
        # =================================================

        else:

            recommendation = (
                "APPROVE_OFFER"
            )

            confidence = 0.92

            reasons.append(
                "proposed incentive remains "
                "within all financial guardrails"
            )


        # =================================================
        # EXPECTED RECOVERY
        # =================================================

        if (
            recommendation ==
            "APPROVE_OFFER"
        ):

            expected_recovery = round(
                expected_net_recovery,
                2
            )

        else:

            expected_recovery = 0.0


        # =================================================
        # FINANCIAL REASONING
        # =================================================

        reasoning = (
            "Finance validation: "
            + " ".join(reasons)
            + ". "
            f"Proposed discount: "
            f"{proposed_discount}%. "
            f"Discount cost: "
            f"₹{discount_amount:.2f}. "
            f"Estimated recovery probability: "
            f"{estimated_recovery_probability * 100:.1f}%. "
            f"Expected gross recovery: "
            f"₹{expected_gross_recovery:.2f}. "
            f"Expected net recovery: "
            f"₹{expected_net_recovery:.2f}. "
            f"Minimum required recovery: "
            f"₹{minimum_required_recovery:.2f}."
        )


        # =================================================
        # RETURN AGENT RESULT
        # =================================================

        return AgentRecommendation(

            agent_name=
                "Finance Guardrail",

            recommendation=
                recommendation,

            confidence=
                confidence,

            reasoning=
                reasoning,

            expected_recovery=
                expected_recovery

        )