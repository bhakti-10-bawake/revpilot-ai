import pandas as pd

from agents.offer_agent import OfferAgent


df = pd.read_csv("data/transactions.csv")

transaction = df.iloc[0].to_dict()

agent = OfferAgent()

result = agent.analyze(transaction)


print("\n========== OFFER AGENT ==========")
print(f"Transaction: {transaction['transaction_id']}")
print(f"Amount: ₹{transaction['amount']}")
print(f"Customer Segment: {transaction['customer_segment']}")
print(f"Response Rate: {transaction['customer_response_rate']:.0%}")
print(f"Failure: {transaction['failure_reason']}")
print()
print(f"Recommendation: {result.recommendation}")
print(f"Confidence: {result.confidence:.0%}")
print(f"Expected Net Recovery: ₹{result.expected_recovery}")
print(f"Reasoning: {result.reasoning}")
print("=================================\n")