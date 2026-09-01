import pandas as pd

from agents.customer_agent import CustomerAgent


# Load transaction data
df = pd.read_csv("data/transactions.csv")

# Select one transaction
transaction = df.iloc[0].to_dict()

# Create Customer Agent
agent = CustomerAgent()

# Analyze transaction
result = agent.analyze(transaction)


print("\n========== CUSTOMER AGENT ==========")
print(f"Transaction: {transaction['transaction_id']}")
print(f"Amount: ₹{transaction['amount']}")
print(f"Customer Segment: {transaction['customer_segment']}")
print(f"Response Rate: {transaction['customer_response_rate']:.0%}")
print(f"Subscription: {transaction['subscription']}")
print(f"Failure: {transaction['failure_reason']}")
print()
print(f"Recommendation: {result.recommendation}")
print(f"Confidence: {result.confidence:.0%}")
print(f"Expected Recovery: ₹{result.expected_recovery}")
print(f"Reasoning: {result.reasoning}")
print("====================================\n")