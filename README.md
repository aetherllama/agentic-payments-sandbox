# Agentic Payments Demo

An interactive demonstration of AI-powered autonomous payment systems. Experience how AI agents make financial decisions with spending limits, approval workflows, and human-in-the-loop oversight.

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

## How to Use

### Demo Scenarios

The app includes 5 interactive demo scenarios, each taking 2-4 minutes to complete:

#### 1. Shopping Agent (Beginner)
Learn the basics of agentic payments through a shopping simulation.

- Configure spending limits (per-transaction and daily)
- Set auto-approval thresholds for small purchases
- Approve or reject purchase requests manually
- See how risk assessment affects decisions

#### 2. Subscription Manager (Intermediate)
Optimize recurring payments by analyzing usage patterns.

- Review active subscriptions and their costs
- Identify low-usage subscriptions
- Accept cost-saving recommendations from the agent
- Cancel or downgrade unused services

#### 3. Bill Pay Automation (Intermediate)
Set up intelligent bill payment with priority scheduling.

- Review upcoming bills and their priorities
- Configure payment priorities (essential, important, optional)
- Watch the agent auto-pay essential bills
- Defer non-essential payments when needed

#### 4. Investment Agent (Advanced)
Explore risk controls for automated investment decisions.

- Set your risk tolerance level
- Review investment recommendations with full transparency
- Approve low-risk trades, reject high-risk ones
- Monitor portfolio performance

#### 5. Multi-Agent Negotiation (Advanced)
Watch AI agents negotiate with each other.

- Observe agent-to-agent negotiation protocols
- Set trust parameters between agents
- Complete multi-agent transactions
- Intervene when needed

### Playground Mode

For free-form experimentation:

1. Click "Playground" in the navigation
2. Add custom agents with different configurations
3. Adjust spending limits and risk settings
4. Run simulations and observe agent behavior
5. Reset and try different configurations

### Understanding the Interface

- **Wallet Display** - Shows current balance and daily spending
- **Transaction List** - Real-time log of all transactions
- **Event Log** - Detailed agent actions and decisions
- **Time Controls** - Start, pause, and adjust simulation speed
- **Decision Tree** - Visual representation of agent reasoning

### Tips for Best Experience

1. **Start with Shopping Agent** - It introduces core concepts gradually
2. **Watch the Decision Tree** - Understand why agents make specific choices
3. **Experiment with Limits** - Try different spending limits to see behavioral changes
4. **Use Speed Controls** - Speed up simulations or slow down to observe details
5. **Check the Event Log** - See detailed reasoning behind each decision

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── agent/       # Agent-related components
│   ├── common/      # Buttons, cards, modals, etc.
│   ├── education/   # Progress tracking, achievements
│   ├── layout/      # App shell, headers
│   ├── simulation/  # Time controls, event logs
│   └── wallet/      # Balance display, transactions
├── data/            # Scenario definitions, achievements
├── engine/          # Simulation engine, time controller
├── pages/           # Main page components
├── store/           # Zustand state management
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
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
- **Vite** - Build tool and dev server
- **Zustand** - State management
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling

## License

MIT
