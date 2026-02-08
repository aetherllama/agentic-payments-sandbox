# Demo Governance: Active Transaction Mandates

This document lists the specific governance mandates and safety guardrails active in the **Agentic Payments Sandbox** demo environment. These rules are designed to align with Singapore's financial security standards (MAS/AP2).

## 1. Authorization Mandates

| Mandate | Risk Mitigated | Intensity | Description |
| :--- | :--- | :--- | :--- |
| **New Merchant Verification** | Merchant Impersonation | **HIGH** | Requires manual verification for unknown or first-time merchants. |
| **Allowed Payment Methods** | Channel Security | **LOW** | Restricts transactions to trusted SG channels: `PayNow`, `NETS`, `DBS PayLah!`. |

## 2. Spending & Velocity Mandates

| Mandate | Risk Mitigated | Threshold | Description |
| :--- | :--- | :--- | :--- |
| **Confirmation Threshold** | Unauthorized Transfers | **S$50** | Any single transaction above this amount requires cryptographic approval. |
| **Autonomous Rate Limit** | Runaway Loops / Bugs | **5 tx/hr** | Maximum number of autonomous payments allowed per agent, per hour. |
| **Transaction Cooldown** | Phishing / Impulse | **60s** | Minimum enforced pause between consecutive autonomous actions. |

## 3. Categorical Restrictions (Blocklist)

The following categories are **strictly prohibited** for autonomous execution. Transactions in these areas result in an immediate block (non-approvalable).

- **Gambling**
- **Unregulated Crypto**
- **Offshore Investment**
- **CPF Schemes**
- **Unlicensed Financial Advice**
- **Job Scams**

---
*Note: These values represent the default "Singapore Safe" profile. Parameters can be tuned per-agent via the Governance tab in the Playground.*
