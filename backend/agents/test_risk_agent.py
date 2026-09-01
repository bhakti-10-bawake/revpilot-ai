import sys
import pandas as pd

# Add backend folder to Python path
sys.path.append(".")

from risk_agent import RiskAgent


# Load our synthetic transaction data
df = pd.read_csv("data/transactions.csv")

# Pick the first transaction
transaction = df.iloc[0].to_dict()

# Create Risk Agent
agent = RiskAgent()

# Analyze the transaction
result = agent.analyze(transaction)


# Display result
print("\n========== RISK AGENT ==========")
print(f"Transaction: {transaction['transaction_id']}")
print(f"Amount: ₹{transaction['amount']}")
print(f"Failure: {transaction['failure_reason']}")
print()
print(f"Recommendation: {result.recommendation}")
print(f"Risk Level: {result.risk_level}")
print(f"Confidence: {result.confidence:.0%}")
print(f"Expected Recovery: ₹{result.expected_recovery}")
print(f"Reasoning: {result.reasoning}")
print("================================\n")