from models.agent_models import AgentRecommendation


class FinanceAgent:
    """
    Protects business margins by validating recovery offers.
    """

    MAX_DISCOUNT_PERCENT = 10
    MAX_DISCOUNT_AMOUNT = 500
    MIN_NET_RECOVERY_PERCENT = 0.70

    def analyze(
        self,
        transaction: dict,
        proposed_discount: float
    ) -> AgentRecommendation:

        amount = transaction["amount"]

        reasons = []

        # --------------------------------
        # Calculate discount cost
        # --------------------------------

        discount_amount = amount * (
            proposed_discount / 100
        )

        # --------------------------------
        # Guardrail 1:
        # Maximum discount percentage
        # --------------------------------

        if proposed_discount > self.MAX_DISCOUNT_PERCENT:

            recommendation = "REJECT_OFFER"
            confidence = 0.98

            reasons.append(
                "discount exceeds maximum allowed percentage"
            )

        # --------------------------------
        # Guardrail 2:
        # Maximum discount amount
        # --------------------------------

        elif discount_amount > self.MAX_DISCOUNT_AMOUNT:

            recommendation = "REJECT_OFFER"
            confidence = 0.95

            reasons.append(
                "discount amount exceeds financial limit"
            )

        else:

            # --------------------------------
            # Estimate net recovery
            # --------------------------------

            estimated_recovery_probability = (
                0.60
                + transaction["customer_response_rate"] * 0.20
            )

            expected_revenue = (
                amount
                * estimated_recovery_probability
            )

            net_recovery = (
                expected_revenue
                - discount_amount
            )

            net_recovery_ratio = (
                net_recovery / amount
            )

            # --------------------------------
            # Guardrail 3:
            # Minimum net recovery
            # --------------------------------

            if net_recovery_ratio < self.MIN_NET_RECOVERY_PERCENT:

                recommendation = "REJECT_OFFER"
                confidence = 0.90

                reasons.append(
                    "expected net recovery is below financial threshold"
                )

            else:

                recommendation = "APPROVE_OFFER"
                confidence = 0.92

                reasons.append(
                    "offer remains within financial guardrails"
                )

        # --------------------------------
        # Expected recovery
        # --------------------------------

        if recommendation == "APPROVE_OFFER":

            expected_recovery = round(
                amount - discount_amount,
                2
            )

        else:

            expected_recovery = 0.0

        reasons.append(
            f"proposed discount: {proposed_discount}%"
        )

        reasons.append(
            f"discount cost: ₹{discount_amount:.2f}"
        )

        reasoning = (
            "Finance validation: "
            + ", ".join(reasons)
            + "."
        )

        return AgentRecommendation(
            agent_name="Finance Guardrail",
            recommendation=recommendation,
            confidence=confidence,
            reasoning=reasoning,
            expected_recovery=expected_recovery
        )