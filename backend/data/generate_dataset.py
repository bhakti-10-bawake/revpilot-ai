import random
import pandas as pd
from datetime import datetime, timedelta


# =========================================================
# CONFIGURATION
# =========================================================

NUM_TRANSACTIONS = 5000

# Approximate portfolio distribution:
# 74% successful payments
# 26% failed payments
SUCCESS_RATE = 0.74


# =========================================================
# STATIC DATA
# =========================================================

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


# =========================================================
# GENERATE ONE TRANSACTION
# =========================================================

def generate_transaction(transaction_number):

    # -----------------------------------------------------
    # IDs
    # -----------------------------------------------------

    customer_id = f"CUST-{random.randint(1000, 9999)}"
    transaction_id = f"TXN-{transaction_number:05d}"


    # -----------------------------------------------------
    # Amount
    # -----------------------------------------------------

    amount = random.choice([
        random.randint(199, 999),
        random.randint(1000, 4999),
        random.randint(5000, 19999)
    ])


    # -----------------------------------------------------
    # Payment information
    # -----------------------------------------------------

    payment_method = random.choice(
        PAYMENT_METHODS
    )


    # -----------------------------------------------------
    # Customer profile
    # -----------------------------------------------------

    customer_segment = random.choice(
        CUSTOMER_SEGMENTS
    )

    customer_tenure = random.randint(
        1,
        36
    )

    previous_transactions = random.randint(
        1,
        30
    )

    successful_transactions = random.randint(
        0,
        previous_transactions
    )

    failed_transactions = (
        previous_transactions
        - successful_transactions
    )


    # -----------------------------------------------------
    # Previous recovery history
    # -----------------------------------------------------

    previous_recovery_attempts = random.randint(
        0,
        3
    )

    previous_recovery_success = (
        previous_recovery_attempts > 0
        and random.random() < 0.60
    )


    # -----------------------------------------------------
    # Customer behaviour
    # -----------------------------------------------------

    subscription = random.choice(
        [True, False]
    )

    customer_response_rate = round(
        random.uniform(
            0.10,
            0.95
        ),
        2
    )

    average_payment_delay = round(
        random.uniform(
            0,
            7
        ),
        1
    )

    last_payment_days_ago = random.randint(
        1,
        60
    )


    # -----------------------------------------------------
    # Determine payment status
    # -----------------------------------------------------

    is_successful = (
        random.random() < SUCCESS_RATE
    )


    if is_successful:

        payment_status = "SUCCESS"

        # Successful payments have no failure reason.
        failure_reason = ""

        # No retry required for a successful payment.
        retry_count = 0

    else:

        payment_status = "FAILED"

        failure_reason = random.choice(
            FAILURE_REASONS
        )

        retry_count = random.randint(
            0,
            3
        )


    # -----------------------------------------------------
    # Timestamp
    # -----------------------------------------------------

    created_at = (
        datetime.now()
        - timedelta(
            days=random.randint(
                0,
                90
            )
        )
    ).isoformat()


    # -----------------------------------------------------
    # Return transaction
    # -----------------------------------------------------

    return {
        "transaction_id": transaction_id,
        "customer_id": customer_id,
        "amount": amount,
        "payment_method": payment_method,
        "payment_status": payment_status,
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
        "created_at": created_at
    }


# =========================================================
# GENERATE DATASET
# =========================================================

def main():

    transactions = []


    # -----------------------------------------------------
    # Generate all transactions
    # -----------------------------------------------------

    for i in range(
        1,
        NUM_TRANSACTIONS + 1
    ):

        transactions.append(
            generate_transaction(i)
        )


    # -----------------------------------------------------
    # Create DataFrame
    # -----------------------------------------------------

    df = pd.DataFrame(
        transactions
    )


    # -----------------------------------------------------
    # Save CSV
    # -----------------------------------------------------

    output_path = "data/transactions.csv"


    df.to_csv(
        output_path,
        index=False
    )


    # -----------------------------------------------------
    # Calculate statistics
    # -----------------------------------------------------

    total = len(df)


    successful = int(
        (
            df["payment_status"] == "SUCCESS"
        ).sum()
    )


    failed = int(
        (
            df["payment_status"] == "FAILED"
        ).sum()
    )


    success_percentage = (
        successful / total * 100
        if total > 0
        else 0
    )


    failed_percentage = (
        failed / total * 100
        if total > 0
        else 0
    )


    # -----------------------------------------------------
    # Print summary
    # -----------------------------------------------------

    print(
        f"Generated {total} transactions."
    )

    print(
        f"Saved to: {output_path}"
    )


    print("\nPayment Status Distribution:")


    print(
        f"SUCCESS: {successful} "
        f"({success_percentage:.1f}%)"
    )


    print(
        f"FAILED: {failed} "
        f"({failed_percentage:.1f}%)"
    )


    # -----------------------------------------------------
    # Failure distribution
    # -----------------------------------------------------

    print("\nFailure Distribution:")


    failed_df = df[
        df["payment_status"] == "FAILED"
    ]


    if failed_df.empty:

        print(
            "No failed transactions."
        )

    else:

        print(
            failed_df[
                "failure_reason"
            ].value_counts()
        )


    # -----------------------------------------------------
    # Preview
    # -----------------------------------------------------

    print("\nDataset Preview:")

    print(
        df.head()
    )


# =========================================================
# ENTRY POINT
# =========================================================

if __name__ == "__main__":
    main()