from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd

from agents.risk_agent import RiskAgent
from agents.timing_agent import TimingAgent
from agents.customer_agent import CustomerAgent
from agents.offer_agent import OfferAgent
from agents.finance_agent import FinanceAgent
from agents.orchestrator import Orchestrator


app = FastAPI(
    title="RevPilot AI",
    description="Multi-Agent Payment Recovery Boardroom",
    version="1.0.0"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# Load transaction dataset
# ==========================================

DATA_PATH = "data/transactions.csv"


# ==========================================
# Request model
# ==========================================

class RecoveryRequest(BaseModel):
    transaction_id: str


# ==========================================
# Root
# ==========================================

@app.get("/")
def root():

    return {
        "name": "RevPilot AI",
        "status": "online",
        "description": "Multi-Agent Payment Recovery Boardroom"
    }


# ==========================================
# Health
# ==========================================

@app.get("/health")
def health():

    return {
        "status": "healthy"
    }


# ==========================================
# Get transaction
# ==========================================

def get_transaction(transaction_id: str):

    try:

        df = pd.read_csv(DATA_PATH)

    except FileNotFoundError:

        raise HTTPException(
            status_code=500,
            detail="Transaction dataset not found."
        )

    transaction = df[
        df["transaction_id"] == transaction_id
    ]

    if transaction.empty:

        raise HTTPException(
            status_code=404,
            detail=f"Transaction {transaction_id} not found."
        )

    return transaction.iloc[0].to_dict()


# ==========================================
# Recovery endpoint
# ==========================================

@app.post("/api/recover")
def recover_payment(request: RecoveryRequest):

    transaction = get_transaction(
        request.transaction_id
    )

    # --------------------------------------
    # Create agents
    # --------------------------------------

    risk_agent = RiskAgent()

    timing_agent = TimingAgent()

    customer_agent = CustomerAgent()

    offer_agent = OfferAgent()

    finance_agent = FinanceAgent()

    orchestrator = Orchestrator()

    # --------------------------------------
    # Run specialist agents
    # --------------------------------------

    risk_result = risk_agent.analyze(
        transaction
    )

    timing_result = timing_agent.analyze(
        transaction
    )

    customer_result = customer_agent.analyze(
        transaction
    )

    offer_result = offer_agent.analyze(
        transaction
    )

    # --------------------------------------
    # Finance validates offer
    # --------------------------------------

    proposed_discount = 0

    if offer_result.recommendation == "OFFER_5_PERCENT":

        proposed_discount = 5

    elif offer_result.recommendation == "OFFER_10_PERCENT":

        proposed_discount = 10

    finance_result = finance_agent.analyze(
        transaction,
        proposed_discount
    )

    # --------------------------------------
    # Orchestrator
    # --------------------------------------

    final_decision = orchestrator.decide(
        transaction,
        risk_result,
        timing_result,
        customer_result,
        offer_result,
        finance_result
    )

    # --------------------------------------
    # Return complete boardroom result
    # --------------------------------------

    return {

        "transaction": {
            "id": transaction["transaction_id"],
            "customer_id": transaction["customer_id"],
            "amount": transaction["amount"],
            "payment_method": transaction["payment_method"],
            "failure_reason": transaction["failure_reason"],
            "customer_segment": transaction["customer_segment"],
        },

        "agents": {

            "risk": risk_result.model_dump(),

            "timing": timing_result.model_dump(),

            "customer": customer_result.model_dump(),

            "offer": offer_result.model_dump(),

            "finance": finance_result.model_dump(),
        },

        "decision": final_decision.model_dump()
    }