# Demo Governance: Active Transaction Mandates

This document lists the specific governance mandates and safety guardrails active in the **Agentic Payments Sandbox** demo environment, including their technical implementation and security objectives.

## 1. Governance Architecture
All mandates are centralizing validated in `GuardrailValidator.ts` via the `validateMandate` method. This method acts as a synchronous gatekeeper before any payment event is committed to the simulation state.

---

## 2. Guardrails Implementation & Security Objectives

### 2.1 Authorization Mandates
| Mandate | Risk Guarded Against | Implementation Detail |
| :--- | :--- | :--- |
| **New Merchant Verification** | **Phishing / Drainer Scams**: Intercepts transactions to unknown merchant IDs before funds are committed. | `GuardrailValidator.ts#L32-41`: Checks `isNewMerchant` against `guardrails.requireVerificationForNewMerchants`. |
| **Allowed Payment Methods** | **High-Risk Channels**: Prevents agents from using untrusted or anonymous payment links. | `GuardrailValidator.ts#L82-92`: Compares `transaction.paymentMethod` against `guardrails.allowedPaymentMethods`. |

### 2.2 Spending & Velocity Mandates
| Mandate | Risk Guarded Against | Implementation Detail |
| :--- | :--- | :--- |
| **Confirmation Threshold** | **Large Unauthorized Loss**: Limits the blast radius of a compromised or malfunctioning agent. | `GuardrailValidator.ts#L43-52`: Checks `transaction.amount` > `guardrails.confirmationThreshold`. |
| **Autonomous Rate Limit** | **API Runaway / Loops**: Prevents automated errors from draining balances through infinite retry loops. | `GuardrailValidator.ts#L54-65`: Filters `history` for the last 1hr and compares count to `maxTransactionsPerHour`. |
| **Transaction Cooldown** | **Bot Exhaustion / Rapid Drainage**: Forces a "human delay" between actions to allow monitoring. | `GuardrailValidator.ts#L67-80`: Calculates seconds since `history[0]` vs. `transactionCooldownSeconds`. |

### 2.3 Categorical Restrictions (Blocklist)
The system enforces a strict regulatory blocklist based on MAS (Singapore) and AML standards.

*   **Risk Guarded Against**: Regulatory Non-Compliance, AML Red Flags, and Illegal Merchant Categories (e.g., Gambling, Unlicensed Advice).
*   **Implementation Detail**: `GuardrailValidator.ts#L21-30`: Intercepts `transaction.category` if found in high-priority restricted lists (`guardrails.blockedCategories`).

---

## 3. Demo Context
These values represent the default "Singapore Safe" profile. Parameters can be tuned per-agent via the **Governance** tab in the Playground UI, which directly modifies the `GuardrailSettings` state.

*Ref: [GuardrailValidator.ts](src/engine/GuardrailValidator.ts)*
