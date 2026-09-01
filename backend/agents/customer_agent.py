from models.agent_models import AgentRecommendation


class CustomerAgent:
    """
    Determines the best customer engagement strategy
    for a failed payment.
    """

    def analyze(self, transaction: dict) -> AgentRecommendation:

        segment = transaction["customer_segment"]
        response_rate = transaction["customer_response_rate"]
        subscription = transaction["subscription"]
        failure_reason = transaction["failure_reason"]
        retry_count = transaction["retry_count"]

        reasons = []

        # --------------------------------
        # Very low engagement
        # --------------------------------

        if response_rate < 0.25:
            recommendation = "HUMAN_ESCALATION"
            confidence = 0.82
            reasons.append("customer has a very low response rate")

        # --------------------------------
        # Loyal / responsive customer
        # --------------------------------

        elif segment == "LOYAL" and response_rate >= 0.60:
            recommendation = "PERSONALIZED_REMINDER"
            confidence = 0.90
            reasons.append("loyal customer with strong engagement")

        # --------------------------------
        # Subscription customer
        # --------------------------------

        elif subscription and response_rate >= 0.40:
            recommendation = "PAYMENT_METHOD_REMINDER"
            confidence = 0.84
            reasons.append("active subscription requires payment continuity")

        # --------------------------------
        # Insufficient funds
        # --------------------------------

        elif failure_reason == "INSUFFICIENT_FUNDS":
            recommendation = "PERSONALIZED_REMINDER"
            confidence = 0.78
            reasons.append("customer may need a reminder to add funds")

        # --------------------------------
        # Expired card
        # --------------------------------

        elif failure_reason == "CARD_EXPIRED":
            recommendation = "PAYMENT_METHOD_REMINDER"
            confidence = 0.94
            reasons.append("customer needs to update payment method")

        # --------------------------------
        # Customer abandoned checkout
        # --------------------------------

        elif failure_reason == "CUSTOMER_ABANDONED":
            recommendation = "PERSONALIZED_REMINDER"
            confidence = 0.80
            reasons.append("customer abandoned the payment flow")

        # --------------------------------
        # Multiple retries
        # --------------------------------

        elif retry_count >= 2:
            recommendation = "HUMAN_ESCALATION"
            confidence = 0.76
            reasons.append("multiple automated recovery attempts have occurred")

        # --------------------------------
        # Default
        # --------------------------------

        else:
            recommendation = "PAYMENT_METHOD_REMINDER"
            confidence = 0.65
            reasons.append("standard payment recovery communication is appropriate")

        # --------------------------------
        # Additional context
        # --------------------------------

        if response_rate >= 0.70:
            reasons.append("customer historically responds well to communication")

        elif response_rate < 0.40:
            reasons.append("customer engagement is relatively low")

        if subscription:
            reasons.append("customer has an active subscription")

        # --------------------------------
        # Expected recovery
        # --------------------------------

        expected_recovery = round(
            transaction["amount"] * confidence * response_rate,
            2
        )

        reasoning = (
            f"Recommended engagement: {recommendation}. "
            + ", ".join(reasons)
            + "."
        )

        return AgentRecommendation(
            agent_name="Customer Agent",
            recommendation=recommendation,
            confidence=confidence,
            reasoning=reasoning,
            expected_recovery=expected_recovery
        )