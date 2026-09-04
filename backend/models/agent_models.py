from pydantic import BaseModel, Field
from typing import Optional


# =========================================================
# AGENT RECOMMENDATION
# =========================================================

class AgentRecommendation(BaseModel):
    """
    Standard response model used by all RevPilot agents.

    Finance Guardrail fields are optional so that the
    Risk, Timing, Customer, and Offer agents continue
    working exactly as before.
    """

    # -----------------------------------------------------
    # Common agent fields
    # -----------------------------------------------------

    agent_name: str

    recommendation: str

    confidence: float = Field(
        ge=0.0,
        le=1.0
    )

    reasoning: str = ""

    expected_recovery: float = 0.0

    risk_level: Optional[str] = None


    # -----------------------------------------------------
    # Finance Guardrail fields
    # -----------------------------------------------------

    proposed_discount: Optional[float] = None

    discount_amount: Optional[float] = None

    estimated_recovery_probability: Optional[float] = None

    expected_gross_recovery: Optional[float] = None

    expected_net_recovery: Optional[float] = None

    minimum_required_recovery: Optional[float] = None

    net_recovery_ratio: Optional[float] = None


# =========================================================
# BOARDROOM DECISION
# =========================================================

class BoardroomDecision(BaseModel):
    """
    Final decision produced by the Orchestrator.
    """

    transaction_id: str

    final_action: str

    retry_delay_hours: Optional[int] = None

    discount_percent: float = 0.0

    customer_message: Optional[str] = None

    expected_recovery: float = 0.0

    confidence: float = Field(
        ge=0.0,
        le=1.0
    )

    guardrail_status: str

    decision_reason: str