import random
import pandas as pd
from datetime import datetime, timedelta


NUM_TRANSACTIONS = 5000

PAYMENT_METHODS = [
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
    "Wallet"
]

FAILURE_REASONS = [
    "INSUFFICIENT_FUNDS",
    "CARD_EXPIRED",
    "BANK_ERROR",
    "NETWORK_TIMEOUT",
    "PAYMENT_DECLINED",
    "CUSTOMER_ABANDONED"
]

CUSTOMER_SEGMENTS = [
    "LOYAL",
    "REGULAR",
    "NEW",
    "AT_RISK"
]


def generate_transaction(transaction_number):

    customer_id = f"CUST-{random.randint(1000, 9999)}"
    transaction_id = f"TXN-{transaction_number:05d}"

    amount = random.choice([
        random.randint(199, 999),
        random.randint(1000, 4999),
        random.randint(5000, 19999)
    ])

    payment_method = random.choice(PAYMENT_METHODS)
    failure_reason = random.choice(FAILURE_REASONS)
    customer_segment = random.choice(CUSTOMER_SEGMENTS)

    customer_tenure = random.randint(1, 36)

    previous_transactions = random.randint(1, 30)

    successful_transactions = random.randint(
        0,
        previous_transactions
    )

    failed_transactions = (
        previous_transactions - successful_transactions
    )

    previous_recovery_attempts = random.randint(0, 3)

    previous_recovery_success = (
        previous_recovery_attempts > 0
        and random.random() < 0.6
    )

    subscription = random.choice([True, False])

    customer_response_rate = round(
        random.uniform(0.1, 0.95),
        2
    )

    average_payment_delay = round(
        random.uniform(0, 7),
        1
    )

    last_payment_days_ago = random.randint(1, 60)

    retry_count = random.randint(0, 3)

    return {
        "transaction_id": transaction_id,
        "customer_id": customer_id,
        "amount": amount,
        "payment_method": payment_method,
        "payment_status": "FAILED",
        "failure_reason": failure_reason,

        "customer_segment": customer_segment,
        "customer_tenure_months": customer_tenure,

        "previous_transactions": previous_transactions,
        "successful_transactions": successful_transactions,
        "failed_transactions": failed_transactions,

        "previous_recovery_attempts": previous_recovery_attempts,
        "previous_recovery_success": previous_recovery_success,

        "subscription": subscription,

        "customer_response_rate": customer_response_rate,
        "average_payment_delay": average_payment_delay,

        "last_payment_days_ago": last_payment_days_ago,

        "retry_count": retry_count,

        "created_at": (
            datetime.now()
            - timedelta(days=random.randint(0, 90))
        ).isoformat()
    }


def main():

    transactions = []

    for i in range(1, NUM_TRANSACTIONS + 1):
        transactions.append(
            generate_transaction(i)
        )

    df = pd.DataFrame(transactions)

    output_path = "data/transactions.csv"

    df.to_csv(
        output_path,
        index=False
    )

    print(f"Generated {len(df)} transactions.")
    print(f"Saved to: {output_path}")

    print("\nDataset preview:")
    print(df.head())

    print("\nFailure distribution:")
    print(df["failure_reason"].value_counts())


if __name__ == "__main__":
    main()