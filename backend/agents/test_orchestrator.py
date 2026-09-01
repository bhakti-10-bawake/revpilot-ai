import pandas as pd

from agents.risk_agent import RiskAgent
from agents.timing_agent import TimingAgent
from agents.customer_agent import CustomerAgent
from agents.offer_agent import OfferAgent
from agents.finance_agent import FinanceAgent
from agents.orchestrator import Orchestrator


# ==========================================
# Load transaction
# ==========================================

df = pd.read_csv("data/transactions.csv")

transaction = df.iloc[0].to_dict()


# ==========================================
# Create agents
# ==========================================

risk_agent = RiskAgent()
timing_agent = TimingAgent()
customer_agent = CustomerAgent()
offer_agent = OfferAgent()
finance_agent = FinanceAgent()
orchestrator = Orchestrator()


# ==========================================
# Run specialist agents
# ==========================================

risk_result = risk_agent.analyze(transaction)

timing_result = timing_agent.analyze(transaction)

customer_result = customer_agent.analyze(transaction)

offer_result = offer_agent.analyze(transaction)


# ==========================================
# Finance validates Offer Agent
# ==========================================

proposed_discount = 0

if offer_result.recommendation == "OFFER_5_PERCENT":
    proposed_discount = 5

elif offer_result.recommendation == "OFFER_10_PERCENT":
    proposed_discount = 10


finance_result = finance_agent.analyze(
    transaction,
    proposed_discount
)


# ==========================================
# Orchestrator makes final decision
# ==========================================

final_decision = orchestrator.decide(
    transaction,
    risk_result,
    timing_result,
    customer_result,
    offer_result,
    finance_result
)


# ==========================================
# DISPLAY BOARDROOM
# ==========================================

print("\n")
print("╔══════════════════════════════════════════════╗")
print("║          REV-PILOT AI BOARDROOM             ║")
print("╚══════════════════════════════════════════════╝")

print("\nTRANSACTION")
print("----------------------------------------------")
print(f"ID:       {transaction['transaction_id']}")
print(f"Amount:   ₹{transaction['amount']}")
print(f"Failure:  {transaction['failure_reason']}")


print("\nSPECIALIST AGENTS")
print("----------------------------------------------")

print(
    f"🛡️ Risk Agent       → "
    f"{risk_result.recommendation}"
)

print(
    f"⏰ Timing Agent     → "
    f"{timing_result.recommendation}"
)

print(
    f"👤 Customer Agent   → "
    f"{customer_result.recommendation}"
)

print(
    f"💰 Offer Agent      → "
    f"{offer_result.recommendation}"
)

print(
    f"🧮 Finance Guard    → "
    f"{finance_result.recommendation}"
)


print("\nFINAL BOARDROOM DECISION")
print("----------------------------------------------")

print(f"Action:             {final_decision.final_action}")
print(f"Retry Delay:        {final_decision.retry_delay_hours} hours")
print(f"Discount:           {final_decision.discount_percent}%")
print(f"Expected Recovery:  ₹{final_decision.expected_recovery}")
print(f"Confidence:         {final_decision.confidence:.0%}")
print(f"Guardrail:          {final_decision.guardrail_status}")

print("\nCUSTOMER MESSAGE")
print("----------------------------------------------")
print(final_decision.customer_message)

print("\nDECISION REASONING")
print("----------------------------------------------")
print(final_decision.decision_reason)

print("\n==============================================")