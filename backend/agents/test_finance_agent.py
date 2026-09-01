import pandas as pd

from agents.finance_agent import FinanceAgent


df = pd.read_csv("data/transactions.csv")

transaction = df.iloc[0].to_dict()

agent = FinanceAgent()


# Test the offer recommended by the Offer Agent
proposed_discount = 10

result = agent.analyze(
    transaction,
    proposed_discount
)


print("\n========== FINANCE GUARDRAIL ==========")
print(f"Transaction: {transaction['transaction_id']}")
print(f"Amount: ₹{transaction['amount']}")
print(f"Proposed Discount: {proposed_discount}%")
print()
print(f"Decision: {result.recommendation}")
print(f"Confidence: {result.confidence:.0%}")
print(f"Expected Recovery: ₹{result.expected_recovery}")
print(f"Reasoning: {result.reasoning}")
print("=======================================\n")