# RevPilot AI

### AI-Powered Revenue Recovery & Decision Intelligence Platform

RevPilot AI is a multi-agent revenue recovery platform designed to intelligently analyze failed payments, determine the safest recovery strategy, protect business margins, and maintain a transparent audit trail for every decision.

Instead of blindly retrying failed payments, RevPilot combines multiple specialized AI agents into a coordinated decision engine that evaluates **risk, timing, customer behavior, recovery offers, and financial guardrails** before producing a final recovery decision.

---

## 🚀 Overview

Failed payments can result in significant revenue leakage for businesses.

Traditional payment recovery systems often rely on:

- Fixed retry schedules
- Generic payment reminders
- Static discount rules
- Manual intervention
- One-size-fits-all recovery strategies

RevPilot AI takes a different approach.

It treats every failed payment as a decision problem.

For each transaction, specialized agents independently analyze different dimensions of the recovery opportunity. A central **Orchestrator** then combines those recommendations and produces a final action while a **Finance Guardrail** ensures that recovery incentives do not violate business constraints.

### Core Decision Flow

```text
Failed Payment
      ↓
Transaction Intake
      ↓
┌─────────────────────────────────────┐
│        Specialist AI Agents         │
│                                     │
│  Risk Agent                         │
│  Timing Agent                       │
│  Customer Agent                     │
│  Offer Agent                        │
│  Finance Guardrail                  │
└─────────────────────────────────────┘
      ↓
Orchestrator
      ↓
Final Recovery Decision
      ↓
Customer Communication
      ↓
Audit Trail
```

---

# ✨ Key Features

## 1. Multi-Agent Recovery Engine

RevPilot uses multiple specialized agents instead of relying on a single decision model.

### Risk Agent

Evaluates the likelihood and risk associated with attempting recovery.

### Timing Agent

Determines whether the payment should be retried immediately, later, or not automatically retried.

### Customer Agent

Analyzes customer characteristics and historical behavior to determine the most appropriate recovery strategy.

### Offer Agent

Evaluates potential recovery incentives such as:

- No incentive
- 5% incentive
- 10% incentive

### Finance Guardrail

Protects business margins by validating proposed incentives against financial constraints.

### Orchestrator

Acts as the final decision-maker by combining all specialist recommendations.

---

# 🧠 AI Boardroom

The **AI Boardroom** is the central decision interface of RevPilot.

It provides a transparent view into how each specialist agent evaluates a failed payment.

For every transaction, the Boardroom displays:

- Agent recommendation
- Confidence score
- Agent reasoning
- Finance validation
- Final orchestrated decision
- Retry timing
- Discount/incentive
- Expected recovery
- Customer communication

This makes the system explainable rather than treating AI as a black box.

---

# 🛡️ Finance Guardrail

RevPilot includes an explicit financial governance layer.

The Finance Guardrail evaluates recovery incentives using predefined business constraints.

### Current Guardrails

```text
Maximum Discount Percentage = 10%

Maximum Discount Amount = ₹500

Minimum Net Recovery Ratio = 70%
```

The system evaluates:

```text
Discount Cost
      ↓
Estimated Recovery Probability
      ↓
Expected Gross Recovery
      ↓
Expected Net Recovery
      ↓
Net Recovery Ratio
      ↓
Approve / Reject
```

This prevents the system from offering incentives that may recover revenue while creating excessive margin loss.

---

# 🔄 Recovery Strategies

Depending on the combined agent recommendations, RevPilot can produce different recovery actions.

Examples include:

```text
RETRY
DO_NOT_RETRY
PERSONALIZED_REMINDER
PAYMENT_METHOD_REMINDER
HUMAN_ESCALATION
```

The final action is determined by the Orchestrator rather than by a single hardcoded rule.

---

# 📊 Recovery Queue

The Recovery Queue provides a centralized workspace for failed payments requiring recovery analysis.

It supports:

- Live recovery cases
- Search
- Risk filtering
- Failure-reason filtering
- Action filtering
- Pagination
- Transaction review
- Direct navigation to the AI Boardroom

The queue is populated using the backend recovery engine rather than relying purely on static frontend data.

---

# 💳 Transaction Intelligence

The Transactions page provides visibility into the underlying payment dataset.

It supports:

- 5,000 transaction records
- Pagination
- Search
- Payment status
- Payment method
- Failure reason
- Customer segment
- Transaction amount
- Transaction date
- Direct transaction review

The complete dataset remains available while only a limited number of records are rendered per page for better performance.

---

# 📦 Batch Recovery

RevPilot can evaluate failed payments across the entire transaction dataset.

The Batch Recovery engine calculates:

- Total transactions
- Failed payments
- Revenue at risk
- Recoverable revenue
- Simulated recovery
- Recovery rate
- Automatic recovery cases
- Review cases
- Blocked cases

It also tracks stopping conditions such as:

- Retry limit
- High risk
- Finance guardrail rejection
- Repeated payment failures

---

# 🔍 Audit Trail

Every important recovery decision can be represented through a structured audit trail.

Example lifecycle:

```text
Transaction Received
        ↓
Risk Agent Completed
        ↓
Timing Agent Completed
        ↓
Customer Agent Completed
        ↓
Offer Agent Completed
        ↓
Finance Guardrail Completed
        ↓
Orchestrator Decision
        ↓
Recovery Action Prepared
```

The audit system provides transparency into how a recovery decision was produced.

This is useful for:

- Governance
- Debugging
- Explainability
- Business review
- Compliance-oriented workflows

---

# 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │     Frontend UI     │
                    │                     │
                    │ HTML                │
                    │ CSS                 │
                    │ JavaScript          │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │      Backend        │
                    └──────────┬──────────┘
                               │
                               ▼
                 ┌───────────────────────────┐
                 │      Recovery Engine      │
                 └────────────┬──────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          │                   │                   │
          ▼                   ▼                   ▼
     Risk Agent        Timing Agent       Customer Agent
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                     ┌────────▼────────┐
                     │   Offer Agent   │
                     └────────┬────────┘
                              │
                     ┌────────▼────────────┐
                     │ Finance Guardrail   │
                     └────────┬────────────┘
                              │
                     ┌────────▼────────┐
                     │  Orchestrator   │
                     └────────┬────────┘
                              │
                              ▼
                     Final Decision
                              │
                              ▼
                        Audit Trail
```

---

# 🧰 Tech Stack

## Frontend

- HTML5
- CSS3
- JavaScript
- Responsive dashboard UI

## Backend

- Python
- FastAPI
- Pandas
- Pydantic
- Uvicorn

## AI / Decision Engine

- Multi-agent architecture
- Specialist agents
- Rule-based financial guardrails
- Central orchestration layer
- Explainable decision reasoning

## Data

- CSV transaction dataset
- 5,000 simulated transactions

## Development Tools

- Visual Studio Code
- Git
- GitHub
- GitHub Desktop

## Deployment

- Static frontend hosting
- FastAPI backend hosting

---

# 📁 Project Structure

```text
revpilot-ai/
│
├── backend/
│   │
│   ├── main.py
│   ├── requirements.txt
│   │
│   ├── agents/
│   │   ├── risk_agent.py
│   │   ├── timing_agent.py
│   │   ├── customer_agent.py
│   │   ├── offer_agent.py
│   │   ├── finance_agent.py
│   │   └── orchestrator.py
│   │
│   ├── models/
│   │   └── agent_models.py
│   │
│   └── data/
│       ├── generate_dataset.py
│       └── transactions.csv
│
├── frontend/
│   │
│   ├── index.html
│   ├── dashboard.html
│   ├── recovery.html
│   ├── batch-recovery.html
│   ├── transactions.html
│   ├── boardroom.html
│   ├── audit.html
│   ├── customer.html
│   │
│   ├── *.css
│   └── *.js
│
└── README.md
```

---

# ⚙️ Local Installation

## 1. Clone the Repository

```bash
git clone https://github.com/<YOUR_USERNAME>/revpilot-ai.git
```

Move into the project directory:

```bash
cd revpilot-ai
```

---

## 2. Create a Virtual Environment

### Windows

```powershell
python -m venv venv
```

Activate it:

```powershell
venv\Scripts\activate
```

### macOS / Linux

```bash
python3 -m venv venv
```

Activate it:

```bash
source venv/bin/activate
```

---

## 3. Install Backend Dependencies

```bash
pip install -r backend/requirements.txt
```

---

# 📊 Generate the Dataset

RevPilot uses a simulated transaction dataset for demonstration and testing.

The dataset generator creates:

- Transaction IDs
- Customer IDs
- Payment amounts
- Payment methods
- Failure reasons
- Customer segments
- Customer tenure
- Previous transaction history
- Recovery history
- Customer response rates
- Payment delays
- Retry counts
- Timestamps

Run:

```bash
cd backend
python data/generate_dataset.py
```

The generated dataset is saved to:

```text
backend/data/transactions.csv
```

---

# ▶️ Run the Backend

From the `backend` directory:

```bash
uvicorn main:app --reload
```

The backend will run at:

```text
http://127.0.0.1:8000
```

### Health Endpoint

```text
http://127.0.0.1:8000/health
```

Expected response:

```json
{
  "status": "healthy"
}
```

### FastAPI Documentation

```text
http://127.0.0.1:8000/docs
```

---

# 🌐 Run the Frontend

The frontend is a static HTML/CSS/JavaScript application.

You can open the frontend using a local static server such as VS Code Live Server.

Example:

```text
frontend/index.html
```

Make sure the backend is running before using features that require API access.

---

# 🔌 API Endpoints

## Health

```http
GET /health
```

Checks whether the backend is running.

---

## Transactions

```http
GET /api/transactions
```

Returns the transaction dataset.

Example response:

```json
{
  "count": 5000,
  "transactions": []
}
```

---

## Single Recovery

```http
POST /api/recover
```

Request:

```json
{
  "transaction_id": "TXN-00001"
}
```

The endpoint runs the complete recovery decision pipeline.

---

## Batch Recovery

```http
GET /api/batch-recovery
```

Runs the recovery engine across the failed-payment portfolio.

---

## Audit Trail

```http
GET /api/audit
```

Returns structured recovery decision audit events.

---

# 🧪 Example Recovery Flow

Consider a failed payment:

```text
Transaction:
TXN-00001

Amount:
₹2,499

Failure:
INSUFFICIENT_FUNDS
```

RevPilot may process the transaction as follows:

```text
Risk Agent
    ↓
Evaluates recovery risk

Timing Agent
    ↓
Determines retry timing

Customer Agent
    ↓
Determines customer strategy

Offer Agent
    ↓
Proposes recovery incentive

Finance Guardrail
    ↓
Validates financial impact

Orchestrator
    ↓
Produces final recovery action
```

Possible result:

```text
Final Action:
DO_NOT_RETRY

Guardrail:
REJECT_OFFER

Expected Recovery:
₹0

Reason:
Recovery conditions do not justify another automated attempt.
```

The exact result depends on the transaction data and agent recommendations.

---

# 🛡️ Decision Governance

RevPilot follows a conservative decision philosophy:

> **Do not recover revenue at any cost. Recover revenue responsibly.**

The system therefore prioritizes:

1. Customer safety
2. Financial viability
3. Recovery probability
4. Appropriate timing
5. Human intervention when automation is unsuitable

The Orchestrator starts from a safe default:

```text
DO_NOT_RETRY
```

and moves toward recovery only when the combined evidence supports it.

---

# 📈 Business Value

RevPilot is designed around several business problems.

### Revenue Leakage

Failed payments represent potentially recoverable revenue.

### Inefficient Retry Strategies

Repeatedly retrying payments without considering context can create poor customer experiences.

### Margin Risk

Large incentives can recover revenue while damaging profitability.

### Lack of Explainability

Automated recovery systems may not clearly explain why a payment was retried or blocked.

### Manual Operations

High-volume failed-payment queues can require significant manual review.

RevPilot addresses these problems through:

```text
Intelligent Recovery
+
Financial Guardrails
+
Multi-Agent Reasoning
+
Auditability
```

---

# 🎯 Why RevPilot?

RevPilot is not simply a payment retry system.

It is a **decision intelligence layer for revenue recovery**.

Instead of asking:

> "Should we retry this payment?"

RevPilot asks:

> "Given the payment failure, customer behavior, timing, recovery probability, financial impact, and business constraints — what is the safest and most valuable action?"

That distinction is the core idea behind the platform.

---

# 🔮 Future Roadmap

## Real Payment Gateway Integration

Connect with services such as Stripe, Razorpay, Adyen, or other payment providers.

## Machine Learning Risk Models

Replace simulated risk signals with trained recovery-probability models.

## Customer-Level Learning

Learn from previous recovery outcomes for individual customers.

## Dynamic Offer Optimization

Optimize incentives using predicted incremental recovery value.

## Real-Time Event Streaming

Process payment failures as they happen rather than through batch datasets.

## Human-in-the-Loop Operations

Allow operations teams to review, approve, modify, or override AI recommendations.

## Advanced Analytics

Track:

- Recovery uplift
- Customer conversion
- Incentive efficiency
- Revenue recovered
- Margin protected
- Agent accuracy

## Persistent Audit Storage

Move the current audit mechanism to a production database for long-term governance and traceability.

---

# 🚀 Deployment

RevPilot's architecture separates the frontend and backend.

```text
                 Internet
                    │
                    ▼
          ┌────────────────────┐
          │  Static Frontend   │
          │   HTML/CSS/JS      │
          └─────────┬──────────┘
                    │
                    │ HTTPS REST API
                    ▼
          ┌────────────────────┐
          │   FastAPI Backend  │
          │    RevPilot AI     │
          └─────────┬──────────┘
                    │
                    ▼
          ┌────────────────────┐
          │ Recovery Engine    │
          │ + Specialist Agents│
          └────────────────────┘
```

The backend can be deployed using a Python-compatible cloud platform while the frontend can be deployed using static web hosting.

---

# ⚠️ Demo / Prototype Disclaimer

RevPilot currently uses a simulated transaction dataset for demonstration and testing purposes.

The project is a functional prototype of an AI-driven revenue recovery architecture and is not connected to a production payment processor.

Before production deployment, additional work would be required for:

- Authentication and authorization
- Secure secret management
- Database persistence
- Production monitoring
- Payment-provider integration
- Rate limiting
- Security hardening
- Model validation
- Compliance requirements
- Production-grade audit storage

---

# 👩‍💻 Development

RevPilot was developed as a multi-agent AI revenue recovery prototype.

The project focuses on:

```text
Artificial Intelligence
Machine Learning Architecture
Revenue Recovery
Decision Intelligence
Financial Governance
Explainable AI
Automation
```

---

# 📜 License

This project is currently intended for educational, research, prototype, and hackathon purposes.

A formal open-source license can be added when the project's distribution terms are finalized.

---

# ⭐ Project Vision

RevPilot AI aims to move revenue recovery from:

```text
Blind Retries
```

to:

```text
Intelligent Decisions
```

and from:

```text
Automation Without Context
```

to:

```text
Responsible, Explainable Automation
```

---

## RevPilot AI

**Recover revenue. Protect margins. Explain every decision.**