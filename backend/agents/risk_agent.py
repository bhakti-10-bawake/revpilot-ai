from models.agent_models import AgentRecommendation


class RiskAgent:
    """
    Evaluates the recovery risk of a failed payment.
    """

    def analyze(self, transaction: dict) -> AgentRecommendation:

        score = 0
        reasons = []

        # --------------------------------
        # Customer history
        # --------------------------------

        previous_transactions = transaction["previous_transactions"]
        successful_transactions = transaction["successful_transactions"]

        if previous_transactions > 0:
            success_rate = (
                successful_transactions / previous_transactions
            )
        else:
            success_rate = 0

        if success_rate >= 0.75:
            score += 30
            reasons.append("strong payment history")
        elif success_rate >= 0.50:
            score += 20
            reasons.append("moderate payment history")
        else:
            score += 5
            reasons.append("weak payment history")

        # --------------------------------
        # Customer segment
        # --------------------------------

        segment = transaction["customer_segment"]

        if segment == "LOYAL":
            score += 25
            reasons.append("loyal customer")
        elif segment == "REGULAR":
            score += 15
            reasons.append("regular customer")
        elif segment == "NEW":
            score += 10
            reasons.append("new customer")
        else:
            score += 5
            reasons.append("at-risk customer")

        # --------------------------------
        # Previous recovery performance
        # --------------------------------

        if transaction["previous_recovery_success"]:
            score += 20
            reasons.append("previous recovery was successful")

        elif transaction["previous_recovery_attempts"] > 0:
            score -= 10
            reasons.append("previous recovery attempts failed")

        # --------------------------------
        # Retry count
        # --------------------------------

        retry_count = transaction["retry_count"]

        if retry_count == 0:
            score += 15
            reasons.append("no previous retry attempts")
        elif retry_count == 1:
            score += 5
            reasons.append("one previous retry")
        else:
            score -= 10
            reasons.append("multiple retry attempts")

        # --------------------------------
        # Failure reason
        # --------------------------------

        failure_reason = transaction["failure_reason"]

        if failure_reason in [
            "NETWORK_TIMEOUT",
            "BANK_ERROR"
        ]:
            score += 10
            reasons.append("failure may be temporary")

        elif failure_reason == "INSUFFICIENT_FUNDS":
            score += 5
            reasons.append("customer may recover after funds are available")

        elif failure_reason in [
            "CARD_EXPIRED",
            "CUSTOMER_ABANDONED"
        ]:
            score -= 10
            reasons.append("failure requires customer intervention")

        # --------------------------------
        # Clamp score
        # --------------------------------

        score = max(0, min(score, 100))

        confidence = score / 100

        # --------------------------------
        # Determine risk
        # --------------------------------

        if score >= 70:
            risk_level = "LOW"
            recommendation = "PROCEED"

        elif score >= 45:
            risk_level = "MEDIUM"
            recommendation = "PROCEED_WITH_CAUTION"

        else:
            risk_level = "HIGH"
            recommendation = "AVOID_AGGRESSIVE_RECOVERY"

        # --------------------------------
        # Expected recovery
        # --------------------------------

        expected_recovery = round(
            transaction["amount"] * confidence,
            2
        )

        reasoning = (
            f"Recovery score: {score}/100. "
            + ", ".join(reasons)
            + "."
        )

        return AgentRecommendation(
            agent_name="Risk Agent",
            recommendation=recommendation,
            confidence=confidence,
            reasoning=reasoning,
            expected_recovery=expected_recovery,
            risk_level=risk_level
        )