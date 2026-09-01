from models.agent_models import AgentRecommendation


class TimingAgent:
    """
    Determines the best time to attempt payment recovery.
    """

    def analyze(self, transaction: dict) -> AgentRecommendation:

        failure_reason = transaction["failure_reason"]
        retry_count = transaction["retry_count"]
        average_delay = transaction["average_payment_delay"]

        # Default values
        retry_delay_hours = 24
        recommendation = "RETRY_TOMORROW"
        confidence = 0.60
        reasons = []

        # --------------------------------
        # Analyze failure reason
        # --------------------------------

        if failure_reason == "NETWORK_TIMEOUT":
            retry_delay_hours = 1
            recommendation = "RETRY_IN_1_HOUR"
            confidence = 0.90
            reasons.append("network failures are often temporary")

        elif failure_reason == "BANK_ERROR":
            retry_delay_hours = 4
            recommendation = "RETRY_IN_4_HOURS"
            confidence = 0.82
            reasons.append("bank errors may resolve after a short delay")

        elif failure_reason == "INSUFFICIENT_FUNDS":
            retry_delay_hours = 24
            recommendation = "RETRY_TOMORROW"
            confidence = 0.78
            reasons.append("customer may need time to add funds")

        elif failure_reason == "PAYMENT_DECLINED":
            retry_delay_hours = 12
            recommendation = "RETRY_IN_12_HOURS"
            confidence = 0.68
            reasons.append("temporary issuer restrictions may resolve later")

        elif failure_reason == "CARD_EXPIRED":
            retry_delay_hours = 0
            recommendation = "DO_NOT_RETRY"
            confidence = 0.95
            reasons.append("expired cards require customer action")

        elif failure_reason == "CUSTOMER_ABANDONED":
            retry_delay_hours = 6
            recommendation = "REMIND_BEFORE_RETRY"
            confidence = 0.72
            reasons.append("customer interaction is needed before another attempt")

        # --------------------------------
        # Consider previous retries
        # --------------------------------

        if retry_count >= 2:
            recommendation = "DO_NOT_RETRY"
            retry_delay_hours = 0
            confidence = min(confidence + 0.10, 0.98)
            reasons.append("multiple previous retries increase recovery fatigue")

        elif retry_count == 1:
            reasons.append("one previous retry has already occurred")

        else:
            reasons.append("no previous retry attempts")

        # --------------------------------
        # Consider customer's payment delay
        # --------------------------------

        if average_delay > 5 and recommendation != "DO_NOT_RETRY":
            retry_delay_hours = max(retry_delay_hours, 24)
            reasons.append("customer historically takes longer to complete payments")

        # --------------------------------
        # Expected recovery
        # --------------------------------

        expected_recovery = round(
            transaction["amount"] * confidence,
            2
        )

        reasoning = (
            f"Recommended delay: {retry_delay_hours} hours. "
            + ", ".join(reasons)
            + "."
        )

        return AgentRecommendation(
            agent_name="Timing Agent",
            recommendation=recommendation,
            confidence=confidence,
            reasoning=reasoning,
            expected_recovery=expected_recovery
        )