from models.agent_models import AgentRecommendation


class OfferAgent:
    """
    Determines whether an incentive is economically useful
    for recovering a failed payment.
    """

    def analyze(self, transaction: dict) -> AgentRecommendation:

        amount = transaction["amount"]
        response_rate = transaction["customer_response_rate"]
        segment = transaction["customer_segment"]
        failure_reason = transaction["failure_reason"]
        previous_recovery_success = transaction["previous_recovery_success"]

        reasons = []

        # --------------------------------
        # Estimate baseline recovery
        # --------------------------------

        baseline_probability = 0.35

        if response_rate >= 0.70:
            baseline_probability += 0.20
            reasons.append("customer has strong engagement")

        elif response_rate >= 0.45:
            baseline_probability += 0.10
            reasons.append("customer has moderate engagement")

        else:
            baseline_probability -= 0.05
            reasons.append("customer has low engagement")

        if segment == "LOYAL":
            baseline_probability += 0.15
            reasons.append("loyal customer")

        elif segment == "AT_RISK":
            baseline_probability -= 0.10
            reasons.append("at-risk customer")

        if previous_recovery_success:
            baseline_probability += 0.10
            reasons.append("previous recovery succeeded")

        if failure_reason == "INSUFFICIENT_FUNDS":
            baseline_probability -= 0.05

        baseline_probability = max(
            0.05,
            min(baseline_probability, 0.90)
        )

        # --------------------------------
        # Estimate incentive impact
        # --------------------------------

        discount_options = [0, 5, 10]

        best_discount = 0
        best_net_value = amount * baseline_probability

        for discount in discount_options:

            discount_cost = amount * (discount / 100)

            # Larger discounts provide diminishing recovery improvement
            recovery_boost = {
                0: 0.00,
                5: 0.12,
                10: 0.18
            }[discount]

            recovery_probability = min(
                baseline_probability + recovery_boost,
                0.95
            )

            expected_revenue = (
                amount
                * recovery_probability
            )

            expected_net_value = (
                expected_revenue
                - discount_cost
            )

            if expected_net_value > best_net_value:
                best_net_value = expected_net_value
                best_discount = discount

        # --------------------------------
        # Final recommendation
        # --------------------------------

        if best_discount == 0:

            recommendation = "NO_DISCOUNT"
            confidence = 0.88

            reasons.append(
                "additional incentive does not justify its cost"
            )

        elif best_discount == 5:

            recommendation = "OFFER_5_PERCENT"
            confidence = 0.76

            reasons.append(
                "small incentive improves expected recovery"
            )

        else:

            recommendation = "OFFER_10_PERCENT"
            confidence = 0.65

            reasons.append(
                "higher incentive provides meaningful recovery improvement"
            )

        # --------------------------------
        # Expected recovery
        # --------------------------------

        discount_cost = amount * (best_discount / 100)

        recovery_boost = {
            0: 0.00,
            5: 0.12,
            10: 0.18
        }[best_discount]

        final_probability = min(
            baseline_probability + recovery_boost,
            0.95
        )

        expected_recovery = round(
            (amount * final_probability) - discount_cost,
            2
        )

        reasoning = (
            f"Baseline recovery probability: "
            f"{baseline_probability:.0%}. "
            f"Recommended incentive: {best_discount}%. "
            + ", ".join(reasons)
            + "."
        )

        return AgentRecommendation(
            agent_name="Offer Agent",
            recommendation=recommendation,
            confidence=confidence,
            reasoning=reasoning,
            expected_recovery=expected_recovery
        )