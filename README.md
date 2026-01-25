# Agentic Payments SG

An interactive demonstration of AI-powered autonomous payment systems, tailored for the Singapore market. Experience how AI agents make financial decisions with spending limits, approval workflows, and human-in-the-loop oversight.

## Overview

This demo showcases the core concepts of agentic payments:

- **Spending Limits** - Per-transaction and daily limits that constrain agent behavior
- **Auto-Approval Thresholds** - Configurable thresholds for autonomous transactions
- **Human-in-the-Loop** - Manual approval workflows for high-value or risky transactions
- **Risk Assessment** - Real-time risk evaluation for payment decisions
- **Multi-Agent Systems** - Agents negotiating and transacting with each other

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/aetherlark/agentic-payments-sandbox.git
cd agentic-payments-sandbox

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`

## Scenario Walkthroughs

Each scenario takes 2-4 minutes to complete and teaches different aspects of agentic payments.

---

### Scenario 1: Shopping Agent (Beginner)

**Goal:** Learn how AI agents make purchase decisions with spending limits and auto-approval.

**Setup:**
- Starting balance: S$500
- Per-transaction limit: S$100
- Daily limit: S$300
- Auto-approve threshold: S$25

**Walkthrough:**

1. **Start the simulation** - Click "Start" to begin. The agent will start evaluating products from Singapore merchants (FairPrice, Challenger, Ya Kun, Maxwell Food Centre).

2. **Watch auto-approvals** - Items under S$25 (like Kaya Spread at S$6.80 or Chicken Rice at S$4.50) are purchased automatically without your input.

3. **Handle approval requests** - When the agent wants to buy something over S$25 (like Mechanical Keyboard at S$129), you'll see an approval dialog:
   - Review the item details and price
   - Check the decision tree showing the agent's reasoning
   - Click "Approve" to allow or "Reject" to deny

4. **Complete objectives:**
   - ✅ Configure agent spending limits (done at start)
   - ✅ Set auto-approval threshold (done at start)
   - ✅ Approve or reject a purchase request
   - ✅ Complete 3 successful transactions
   - ⭐ (Optional) Block a high-risk transaction

5. **Finish** - Once all required objectives are met, you'll see the results screen.

---

### Scenario 2: Subscription Manager (Intermediate)

**Goal:** Optimize recurring payments by analyzing usage patterns and finding savings.

**Setup:**
- Starting balance: S$200
- Subscriptions: Netflix, Spotify, iCloud+, Straits Times, GrabUnlimited, ActiveSG Gym

**Walkthrough:**

1. **Review subscriptions** - The agent analyzes your active subscriptions and their usage scores.

2. **Identify low-usage services** - Subscriptions with low usage scores are flagged:
   - Spotify Premium (20% usage) - S$9.90/month
   - Straits Times Premium (15% usage) - S$29.90/month

3. **Accept recommendations** - The agent suggests alternatives:
   - Switch Spotify to Free Tier (save S$9.90) or Family Plan (save S$6.90)
   - Cancel Straits Times (save S$29.90)

4. **Complete objectives:**
   - ✅ Review all active subscriptions
   - ✅ Identify low-usage subscriptions
   - ✅ Accept a cost-saving recommendation
   - ✅ Save at least S$10/month
   - ⭐ (Optional) Cancel an unused subscription

---

### Scenario 3: Bill Pay Automation (Intermediate)

**Goal:** Set up intelligent bill payment with priority scheduling.

**Setup:**
- Starting balance: S$600
- Bills: HDB S&C, SP Group Utilities, SingTel, StarHub, EZ-Link, CPF

**Walkthrough:**

1. **Review upcoming bills** - Bills appear based on their due dates:
   - SP Group Utilities (S$150) - Essential, due first
   - HDB Service & Conservancy (S$85) - Essential
   - SingTel Mobile (S$68) - Important
   - StarHub Broadband (S$45) - Essential
   - EZ-Link Auto Top-up (S$50) - Important
   - CPF Voluntary Contribution (S$500) - Optional

2. **Watch priority-based payments** - Essential bills (SP Group, HDB, StarHub) are paid automatically.

3. **Handle non-essential bills** - For optional bills like CPF Voluntary Contribution, you can:
   - Approve to pay now
   - Reject to defer payment

4. **Complete objectives:**
   - ✅ Review upcoming bills
   - ✅ Set payment priorities
   - ✅ Auto-pay an essential bill
   - ✅ Defer a non-essential bill
   - ⭐ (Optional) Pay all bills on time

---

### Scenario 4: Investment Agent (Advanced)

**Goal:** Explore risk controls for automated investment decisions.

**Setup:**
- Starting balance: S$10,000
- Per-transaction limit: S$1,000
- Risk tolerance: Configurable

**Walkthrough:**

1. **Set risk tolerance** - Configure how much risk the agent can take (1-5 scale).

2. **Review recommendations** - The agent analyzes investment opportunities and presents:
   - Asset type and expected returns
   - Risk level assessment
   - Decision reasoning in the tree view

3. **Approve/reject trades:**
   - Low-risk trades within your tolerance → Approve
   - High-risk trades exceeding tolerance → Reject

4. **Complete objectives:**
   - ✅ Set risk tolerance level
   - ✅ Review an investment recommendation
   - ✅ Approve a low-risk trade
   - ✅ Reject a high-risk trade
   - ⭐ (Optional) Maintain positive returns

---

### Scenario 5: Multi-Agent Negotiation (Advanced)

**Goal:** Watch AI agents negotiate and transact with each other.

**Setup:**
- Starting balance: S$1,000
- Multiple agents with different roles

**Walkthrough:**

1. **Observe negotiations** - Watch as agents communicate and negotiate terms with each other.

2. **Set trust parameters** - Configure how much your agent trusts other agents (affects deal acceptance).

3. **Monitor multi-agent transactions** - See transactions that involve multiple parties.

4. **Intervene when needed** - Step in to approve or modify deals that exceed your parameters.

5. **Complete objectives:**
   - ✅ Observe agent negotiation
   - ✅ Set trust parameters
   - ✅ Complete a multi-agent transaction
   - ✅ Intervene in a negotiation
   - ⭐ (Optional) Build trust with 3 agents

---

## Playground Mode

For free-form experimentation without guided objectives:

1. Navigate to **Playground** from the bottom navigation
2. **Add agents** - Create custom agents with different types (Shopping, Subscription, Bill Pay, etc.)
3. **Configure limits** - Set spending limits and risk parameters for each agent
4. **Run simulations** - Start the simulation and watch agents make decisions
5. **Experiment** - Try different configurations to see how behavior changes

## Interface Guide

| Component | Description |
|-----------|-------------|
| **Wallet Display** | Current balance and daily spending tracker |
| **Transaction List** | Real-time log of all completed transactions |
| **Event Log** | Detailed agent actions and decision reasoning |
| **Time Controls** | Start, pause, resume, and speed controls (1x, 2x, 5x, 10x) |
| **Decision Tree** | Visual representation of agent's decision process |
| **Approval Dialog** | Interface for approving/rejecting agent requests |

## Tips for Best Experience

1. **Start with Shopping Agent** - Introduces core concepts in a familiar context
2. **Use 2x speed** - Default speed; increase to 5x or 10x if you want faster progression
3. **Watch the Decision Tree** - Shows exactly why the agent made each choice
4. **Try rejecting requests** - See how the agent adapts to your preferences
5. **Check Event Log** - Contains detailed reasoning for every action

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── agent/       # Agent cards, config panels
│   ├── common/      # Buttons, cards, modals
│   ├── education/   # Progress tracking
│   ├── layout/      # App shell, navigation
│   ├── simulation/  # Time controls, event logs
│   └── wallet/      # Balance display, transactions
├── data/            # Singapore-specific scenarios
├── engine/          # Simulation engine
├── pages/           # Main page components
├── store/           # Zustand state management
└── types/           # TypeScript definitions
```

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run preview   # Preview production build
npm run test      # Run tests
npm run lint      # Run ESLint
```

## Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Zustand** - State management
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling

## Singapore Context

This demo uses Singapore-specific examples:
- **Merchants:** FairPrice, Cold Storage, Sheng Siong, Challenger, Courts, Ya Kun, Maxwell Food Centre
- **Bills:** HDB S&C, SP Group, SingTel, StarHub, EZ-Link, CPF
- **Subscriptions:** Netflix, Spotify, GrabUnlimited, Straits Times, ActiveSG
- **Currency:** Singapore Dollars (S$)

## License

MIT
