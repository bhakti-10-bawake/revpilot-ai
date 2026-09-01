from pydantic import BaseModel, Field
from typing import Optional


class AgentRecommendation(BaseModel):
    agent_name: str
    recommendation: str
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str
    expected_recovery: float = 0.0
    risk_level: Optional[str] = None


class BoardroomDecision(BaseModel):
    transaction_id: str
    final_action: str
    retry_delay_hours: Optional[int] = None
    discount_percent: float = 0.0
    customer_message: Optional[str] = None
    expected_recovery: float = 0.0
    confidence: float = Field(ge=0.0, le=1.0)
    guardrail_status: str
    decision_reason: str