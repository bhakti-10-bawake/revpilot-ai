from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional
from uuid import uuid4

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.risk_agent import RiskAgent
from agents.timing_agent import TimingAgent
from agents.customer_agent import CustomerAgent
from agents.offer_agent import OfferAgent
from agents.finance_agent import FinanceAgent
from agents.orchestrator import Orchestrator


# =========================================================
# APP
# =========================================================

app = FastAPI(
    title="RevPilot AI",
    version="1.0.0",
    description="AI Revenue Recovery and Recovery Governance Engine",
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# PATHS
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

DATA_PATH = (
    BASE_DIR
    / "data"
    / "transactions.csv"
)


# =========================================================
# AGENTS
# =========================================================

risk_agent = RiskAgent()
timing_agent = TimingAgent()
customer_agent = CustomerAgent()
offer_agent = OfferAgent()
finance_agent = FinanceAgent()
orchestrator = Orchestrator()


# =========================================================
# IN-MEMORY AUDIT LOG
# =========================================================

AUDIT_LOG: list[dict[str, Any]] = []


# =========================================================
# REQUEST MODELS
# =========================================================

class RecoverRequest(BaseModel):
    transaction_id: str


# =========================================================
# SERIALIZATION HELPERS
# =========================================================

def model_to_dict(value: Any) -> dict[str, Any]:
    """
    Convert either a Pydantic model or a dictionary to a
    normal JSON-serializable dictionary.
    """

    if value is None:
        return {}

    if isinstance(value, dict):
        return value

    if hasattr(value, "model_dump"):
        return value.model_dump()

    if hasattr(value, "dict"):
        return value.dict()

    return {
        "value": value
    }


def clean_json_value(value: Any) -> Any:
    """
    Convert pandas/numpy datetime and numeric values into
    normal Python JSON-compatible values.
    """

    if isinstance(value, dict):
        return {
            key: clean_json_value(item)
            for key, item in value.items()
        }

    if isinstance(value, list):
        return [
            clean_json_value(item)
            for item in value
        ]

    if isinstance(value, tuple):
        return [
            clean_json_value(item)
            for item in value
        ]

    if isinstance(value, pd.Timestamp):
        return value.isoformat()

    if hasattr(value, "item"):
        try:
            return value.item()
        except Exception:
            pass

    return value


def utc_timestamp() -> str:
    return datetime.now(
        timezone.utc
    ).isoformat()


# =========================================================
# DATASET
# =========================================================

def load_dataset() -> pd.DataFrame:
    """
    Load the canonical transaction dataset.
    """

    if not DATA_PATH.exists():

        raise FileNotFoundError(
            f"Transaction dataset not found: {DATA_PATH}"
        )

    df = pd.read_csv(
        DATA_PATH
    )

    if df.empty:

        raise ValueError(
            "Transaction dataset is empty."
        )

    return df


def dataframe_transactions(
    df: pd.DataFrame
) -> list[dict[str, Any]]:

    df = df.where(
        pd.notna(df),
        None
    )

    records = df.to_dict(
        orient="records"
    )

    return [
        clean_json_value(
            record
        )
        for record in records
    ]


def find_transaction(
    transaction_id: str
) -> dict[str, Any]:

    df = load_dataset()

    if (
        "transaction_id"
        not in df.columns
    ):

        raise ValueError(
            "Dataset is missing the transaction_id column."
        )

    matches = df[
        df["transaction_id"].astype(str)
        == str(transaction_id)
    ]

    if matches.empty:

        raise HTTPException(
            status_code=404,
            detail=(
                f"Transaction "
                f"{transaction_id} "
                f"was not found."
            )
        )

    record = matches.iloc[0].to_dict()

    record = clean_json_value(
        record
    )

    # The frontend Boardroom expects transaction.id,
    # while the dataset uses transaction_id.
    record["id"] = record.get(
        "transaction_id"
    )

    return record


# =========================================================
# STATUS HELPERS
# =========================================================

def is_failed_transaction(
    transaction: dict[str, Any]
) -> bool:

    status = str(
        transaction.get(
            "payment_status",
            transaction.get(
                "status",
                ""
            )
        )
    ).upper()

    return (
        "FAIL" in status
        or "DECLIN" in status
        or "ERROR" in status
    )


def get_amount(
    transaction: dict[str, Any]
) -> float:

    try:

        return float(
            transaction.get(
                "amount",
                0
            ) or 0
        )

    except (
        TypeError,
        ValueError
    ):

        return 0.0


# =========================================================
# OFFER → FINANCE DISCOUNT
# =========================================================

def extract_proposed_discount(
    offer_result: Any
) -> float:

    recommendation = str(
        getattr(
            offer_result,
            "recommendation",
            ""
        )
    ).upper()

    if "10_PERCENT" in recommendation:
        return 10.0

    if "5_PERCENT" in recommendation:
        return 5.0

    if "10%" in recommendation:
        return 10.0

    if "5%" in recommendation:
        return 5.0

    return 0.0


# =========================================================
# AUDIT
# =========================================================

def add_audit_event(
    transaction_id: str,
    event_type: str,
    title: str,
    description: str,
    status: str,
    details: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:

    event = {
        "audit_id": str(
            uuid4()
        ),
        "timestamp": utc_timestamp(),
        "event_type": event_type,
        "transaction_id": transaction_id,
        "title": title,
        "description": description,
        "status": status,
        "details": clean_json_value(
            details or {}
        ),
    }

    AUDIT_LOG.insert(
        0,
        event
    )

    return event


# =========================================================
# HEALTH
# =========================================================

@app.get("/health")
def health() -> dict[str, str]:

    return {
        "status": "healthy"
    }


# =========================================================
# TRANSACTIONS
# =========================================================

@app.get("/api/transactions")
def get_transactions() -> dict[str, Any]:

    try:

        df = load_dataset()

        transactions = dataframe_transactions(
            df
        )

        return {
            "count": len(transactions),
            "transactions": transactions,
        }

    except HTTPException:

        raise

    except Exception as error:

        print(
            "TRANSACTION API ERROR:",
            repr(error)
        )

        raise HTTPException(
            status_code=500,
            detail=f"Unable to load transactions: {error}",
        )


# =========================================================
# SINGLE PAYMENT RECOVERY
# =========================================================

@app.post("/api/recover")
def recover_payment(
    request: RecoverRequest
) -> dict[str, Any]:

    transaction_id = (
        request.transaction_id.strip()
    )

    if not transaction_id:

        raise HTTPException(
            status_code=400,
            detail="transaction_id is required.",
        )

    try:

        transaction = find_transaction(
            transaction_id
        )


        # =================================================
        # TRANSACTION INTAKE
        # =================================================

        add_audit_event(
            transaction_id=transaction_id,
            event_type="INTAKE",
            title="Transaction received",
            description=(
                "Failed payment entered "
                "the recovery engine."
            ),
            status="completed",
            details={
                "amount": transaction.get(
                    "amount"
                ),
                "payment_status":
                    transaction.get(
                        "payment_status"
                    ),
                "failure_reason":
                    transaction.get(
                        "failure_reason"
                    ),
            },
        )


        # =================================================
        # RISK AGENT
        # =================================================

        risk_result = risk_agent.analyze(
            transaction
        )


        add_audit_event(
            transaction_id=transaction_id,
            event_type="RISK_AGENT",
            title="Risk Agent completed analysis",
            description=(
                "Risk Agent evaluated "
                "payment recovery risk."
            ),
            status="completed",
            details=model_to_dict(
                risk_result
            ),
        )


        # =================================================
        # TIMING AGENT
        # =================================================

        timing_result = (
            timing_agent.analyze(
                transaction
            )
        )


        add_audit_event(
            transaction_id=transaction_id,
            event_type="TIMING_AGENT",
            title="Timing Agent completed analysis",
            description=(
                "Timing Agent evaluated "
                "the safest retry window."
            ),
            status="completed",
            details=model_to_dict(
                timing_result
            ),
        )


        # =================================================
        # CUSTOMER AGENT
        # =================================================

        customer_result = (
            customer_agent.analyze(
                transaction
            )
        )


        add_audit_event(
            transaction_id=transaction_id,
            event_type="CUSTOMER_AGENT",
            title="Customer Agent completed analysis",
            description=(
                "Customer Agent evaluated "
                "customer behavior and engagement."
            ),
            status="completed",
            details=model_to_dict(
                customer_result
            ),
        )


        # =================================================
        # OFFER AGENT
        # =================================================

        offer_result = offer_agent.analyze(
            transaction
        )


        add_audit_event(
            transaction_id=transaction_id,
            event_type="OFFER_AGENT",
            title="Offer Agent completed analysis",
            description=(
                "Offer Agent evaluated "
                "recovery incentive options."
            ),
            status="completed",
            details=model_to_dict(
                offer_result
            ),
        )


        # =================================================
        # FINANCE GUARDRAIL
        # =================================================

        proposed_discount = (
            extract_proposed_discount(
                offer_result
            )
        )


        finance_result = (
            finance_agent.analyze(
                transaction,
                proposed_discount
            )
        )


        finance_dict = model_to_dict(
            finance_result
        )


        finance_status = (
            "approved"
            if "APPROVE"
            in str(
                finance_dict.get(
                    "recommendation",
                    ""
                )
            ).upper()
            else "blocked"
        )


        add_audit_event(
            transaction_id=transaction_id,
            event_type="FINANCE_GUARDRAIL",
            title="Finance Guardrail completed validation",
            description=(
                "Finance Guardrail validated "
                "the proposed recovery incentive."
            ),
            status=finance_status,
            details=finance_dict,
        )


        # =================================================
        # ORCHESTRATOR
        # =================================================

        decision = orchestrator.decide(
            transaction=transaction,
            risk=risk_result,
            timing=timing_result,
            customer=customer_result,
            offer=offer_result,
            finance=finance_result,
        )


        decision_dict = model_to_dict(
            decision
        )


        final_action = decision_dict.get(
            "final_action",
            "DO_NOT_RETRY"
        )


        guardrail_status = decision_dict.get(
            "guardrail_status",
            "UNKNOWN"
        )


        # =================================================
        # ORCHESTRATOR AUDIT
        # =================================================

        blocked = (
            str(final_action).upper()
            in {
                "DO_NOT_RETRY",
                "BLOCK",
                "BLOCKED",
            }
            or "DO_NOT_RETRY"
            in str(final_action).upper()
        )


        add_audit_event(
            transaction_id=transaction_id,
            event_type="ORCHESTRATOR",
            title=(
                "Orchestrator reached final decision"
            ),
            description=(
                decision_dict.get(
                    "decision_reason"
                )
                or
                "Recovery decision generated."
            ),
            status=(
                "blocked"
                if blocked
                else "completed"
            ),
            details=decision_dict,
        )


        # =================================================
        # RECOVERY ACTION PREPARED
        # =================================================

        add_audit_event(
            transaction_id=transaction_id,
            event_type="ORCHESTRATOR",
            title="Recovery action prepared",
            description=(
                "The final recovery strategy "
                "has been prepared under "
                "the active recovery policy."
            ),
            status=(
                "blocked"
                if blocked
                else "ready"
            ),
            details={
                "final_action":
                    final_action,
                "retry_delay_hours":
                    decision_dict.get(
                        "retry_delay_hours"
                    ),
                "discount_percent":
                    decision_dict.get(
                        "discount_percent",
                        0
                    ),
                "expected_recovery":
                    decision_dict.get(
                        "expected_recovery",
                        0
                    ),
                "guardrail_status":
                    guardrail_status,
                "audit_record_complete":
                    True,
            },
        )


        # =================================================
        # RESPONSE
        # =================================================

        return {
            "transaction":
                clean_json_value(
                    transaction
                ),

            "agents": {

                "risk":
                    model_to_dict(
                        risk_result
                    ),

                "timing":
                    model_to_dict(
                        timing_result
                    ),

                "customer":
                    model_to_dict(
                        customer_result
                    ),

                "offer":
                    model_to_dict(
                        offer_result
                    ),

                "finance":
                    finance_dict,

            },

            "decision":
                clean_json_value(
                    decision_dict
                ),
        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "RECOVERY API ERROR:",
            repr(error)
        )


        add_audit_event(
            transaction_id=transaction_id,
            event_type="SYSTEM",
            title="Recovery analysis failed",
            description=str(error),
            status="error",
            details={
                "error_type":
                    type(error).__name__,
                "error":
                    str(error),
            },
        )


        raise HTTPException(
            status_code=500,
            detail=(
                f"Recovery analysis failed: "
                f"{error}"
            ),
        )


# =========================================================
# BATCH RECOVERY
# =========================================================

@app.get("/api/batch-recovery")
def batch_recovery() -> dict[str, Any]:

    try:

        df = load_dataset()

        all_transactions = (
            dataframe_transactions(
                df
            )
        )


        # -------------------------------------------------
        # ONLY FAILED PAYMENTS ENTER RECOVERY
        # -------------------------------------------------

        failed_transactions = [
            transaction
            for transaction in all_transactions
            if is_failed_transaction(
                transaction
            )
        ]


        total_transactions = len(
            all_transactions
        )

        failed_payments = len(
            failed_transactions
        )


        revenue_at_risk = round(
            sum(
                get_amount(transaction)
                for transaction
                in failed_transactions
            ),
            2
        )


        # -------------------------------------------------
        # Decision buckets
        # -------------------------------------------------

        automatic = 0
        review = 0
        blocked = 0

        retry_limit_count = 0
        high_risk_count = 0
        finance_guardrail_count = 0
        repeated_failure_count = 0


        recoverable_revenue = 0.0
        simulated_recovery = 0.0


        batch_transactions = []


        # -------------------------------------------------
        # Evaluate failed transactions
        # -------------------------------------------------

        for index, transaction in enumerate(
            failed_transactions
        ):

            try:

                transaction_id = str(
                    transaction.get(
                        "transaction_id"
                    )
                )


                amount = get_amount(
                    transaction
                )


                # =========================================
                # AGENTS
                # =========================================

                risk_result = (
                    risk_agent.analyze(
                        transaction
                    )
                )

                timing_result = (
                    timing_agent.analyze(
                        transaction
                    )
                )

                customer_result = (
                    customer_agent.analyze(
                        transaction
                    )
                )

                offer_result = (
                    offer_agent.analyze(
                        transaction
                    )
                )


                proposed_discount = (
                    extract_proposed_discount(
                        offer_result
                    )
                )


                finance_result = (
                    finance_agent.analyze(
                        transaction,
                        proposed_discount
                    )
                )


                # =========================================
                # ORCHESTRATOR
                # =========================================

                decision = orchestrator.decide(
                    transaction=transaction,
                    risk=risk_result,
                    timing=timing_result,
                    customer=customer_result,
                    offer=offer_result,
                    finance=finance_result,
                )


                decision_dict = model_to_dict(
                    decision
                )


                risk_dict = model_to_dict(
                    risk_result
                )

                finance_dict = model_to_dict(
                    finance_result
                )


                action = str(
                    decision_dict.get(
                        "final_action",
                        "DO_NOT_RETRY"
                    )
                ).upper()


                risk_level = str(
                    risk_dict.get(
                        "risk_level",
                        ""
                    )
                ).upper()


                # =========================================
                # GOVERNANCE
                # =========================================

                retry_count = int(
                    transaction.get(
                        "retry_count",
                        0
                    ) or 0
                )


                if retry_count >= 3:

                    retry_limit_count += 1


                if risk_level == "HIGH":

                    high_risk_count += 1


                if (
                    str(
                        finance_dict.get(
                            "recommendation",
                            ""
                        )
                    ).upper()
                    == "REJECT_OFFER"
                ):

                    finance_guardrail_count += 1


                if (
                    int(
                        transaction.get(
                            "failed_transactions",
                            0
                        ) or 0
                    ) >= 3
                ):

                    repeated_failure_count += 1


                # =========================================
                # OUTCOME
                # =========================================

                if (
                    "DO_NOT_RETRY"
                    in action
                    or "BLOCK"
                    in action
                ):

                    blocked += 1

                    outcome = "blocked"

                    expected_recovery = 0.0


                elif (
                    "HUMAN_ESCALATION"
                    in action
                    or "REVIEW"
                    in action
                ):

                    review += 1

                    outcome = "review"

                    expected_recovery = float(
                        decision_dict.get(
                            "expected_recovery",
                            0
                        ) or 0
                    )


                else:

                    automatic += 1

                    outcome = "automatic"

                    expected_recovery = float(
                        decision_dict.get(
                            "expected_recovery",
                            0
                        ) or 0
                    )


                if expected_recovery > 0:

                    recoverable_revenue += (
                        expected_recovery
                    )


                # Simulated recovery is deliberately
                # conservative. It uses the final expected
                # recovery estimate only for cases that
                # reached an executable/review action.

                if outcome in {
                    "automatic",
                    "review",
                }:

                    simulated_recovery += (
                        max(
                            0.0,
                            expected_recovery
                        )
                    )


                # =========================================
                # BATCH TRANSACTION RESULT
                # =========================================

                batch_transactions.append({

                    "transaction_id":
                        transaction_id,

                    "customer_id":
                        transaction.get(
                            "customer_id"
                        ),

                    "amount":
                        amount,

                    "failure_reason":
                        transaction.get(
                            "failure_reason"
                        ),

                    "customer_segment":
                        transaction.get(
                            "customer_segment"
                        ),

                    "payment_status":
                        transaction.get(
                            "payment_status"
                        ),

                    "retry_count":
                        retry_count,

                    "risk_level":
                        risk_level,

                    "outcome":
                        outcome,

                    "final_action":
                        action,

                    "expected_recovery":
                        round(
                            expected_recovery,
                            2
                        ),

                    "discount_percent":
                        decision_dict.get(
                            "discount_percent",
                            0
                        ),

                    "guardrail_status":
                        decision_dict.get(
                            "guardrail_status"
                        ),

                    "confidence":
                        decision_dict.get(
                            "confidence"
                        ),
                })


            except Exception as transaction_error:

                # One bad row must not destroy the
                # entire portfolio simulation.

                blocked += 1

                batch_transactions.append({

                    "transaction_id":
                        transaction.get(
                            "transaction_id"
                        ),

                    "customer_id":
                        transaction.get(
                            "customer_id"
                        ),

                    "amount":
                        get_amount(
                            transaction
                        ),

                    "failure_reason":
                        transaction.get(
                            "failure_reason"
                        ),

                    "payment_status":
                        transaction.get(
                            "payment_status"
                        ),

                    "outcome":
                        "blocked",

                    "final_action":
                        "DO_NOT_RETRY",

                    "expected_recovery":
                        0.0,

                    "error":
                        str(
                            transaction_error
                        ),
                })


        # -------------------------------------------------
        # Recovery rate
        # -------------------------------------------------

        if revenue_at_risk > 0:

            recovery_rate = round(
                (
                    simulated_recovery
                    / revenue_at_risk
                )
                * 100,
                2
            )

        else:

            recovery_rate = 0.0


        # -------------------------------------------------
        # Recoverable revenue
        # -------------------------------------------------

        recoverable_revenue = round(
            max(
                recoverable_revenue,
                simulated_recovery
            ),
            2
        )


        # -------------------------------------------------
        # Audit summary event
        # -------------------------------------------------

        add_audit_event(
            transaction_id="BATCH",
            event_type="BATCH_RECOVERY",
            title="Batch recovery completed",
            description=(
                "Portfolio-wide recovery "
                "simulation completed."
            ),
            status="completed",
            details={
                "total_transactions":
                    total_transactions,

                "failed_payments":
                    failed_payments,

                "revenue_at_risk":
                    revenue_at_risk,

                "recoverable_revenue":
                    recoverable_revenue,

                "simulated_recovery":
                    round(
                        simulated_recovery,
                        2
                    ),

                "automatic":
                    automatic,

                "review":
                    review,

                "blocked":
                    blocked,
            },
        )


        # -------------------------------------------------
        # Final response
        # -------------------------------------------------

        return {
            "summary": {

                "total_transactions":
                    total_transactions,

                "failed_payments":
                    failed_payments,

                "revenue_at_risk":
                    revenue_at_risk,

                "recoverable_revenue":
                    recoverable_revenue,

                "recovered_revenue":
                    round(
                        simulated_recovery,
                        2
                    ),

                "simulated_recovery":
                    round(
                        simulated_recovery,
                        2
                    ),

                "recovery_rate":
                    recovery_rate,

            },

            "outcomes": {

                "automatic":
                    automatic,

                "review":
                    review,

                "blocked":
                    blocked,

            },

            "stopping_rules": {

                "retry_limit":
                    retry_limit_count,

                "high_risk":
                    high_risk_count,

                "finance_guardrail":
                    finance_guardrail_count,

                "repeated_failure":
                    repeated_failure_count,

            },

            "transactions":
                batch_transactions,
        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "BATCH RECOVERY ERROR:",
            repr(error)
        )


        raise HTTPException(
            status_code=500,
            detail=(
                f"Batch recovery failed: "
                f"{error}"
            ),
        )


# =========================================================
# AUDIT TRAIL
# =========================================================

@app.get("/api/audit")
def get_audit() -> dict[str, Any]:

    return {
        "count": len(
            AUDIT_LOG
        ),
        "events":
            AUDIT_LOG,
    }


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root() -> dict[str, Any]:

    return {
        "name": "RevPilot AI",
        "status": "online",
        "docs": "/docs",
        "endpoints": [
            "/health",
            "/api/transactions",
            "/api/recover",
            "/api/batch-recovery",
            "/api/audit",
        ],
    }