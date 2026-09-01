import pandas as pd

from agents.timing_agent import TimingAgent


# Load transaction data
df = pd.read_csv("data/transactions.csv")

# Select one transaction
transaction = df.iloc[0].to_dict()

# Create Timing Agent
agent = TimingAgent()

# Analyze transaction
result = agent.analyze(transaction)


print("\n========== TIMING AGENT ==========")
print(f"Transaction: {transaction['transaction_id']}")
print(f"Amount: ₹{transaction['amount']}")
print(f"Failure: {transaction['failure_reason']}")
print(f"Previous Retries: {transaction['retry_count']}")
print()
print(f"Recommendation: {result.recommendation}")
print(f"Confidence: {result.confidence:.0%}")
print(f"Expected Recovery: ₹{result.expected_recovery}")
print(f"Reasoning: {result.reasoning}")
print("==================================\n")