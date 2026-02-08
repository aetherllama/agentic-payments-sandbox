import { SingaporePaymentMethod } from './index';

export type Severity = 'low' | 'medium' | 'high';
export type GovernanceCategory = 'authorization' | 'spending_limit' | 'category_restriction' | 'cooldown';

export interface MandateConstraint<T = any> {
  value: T;
  riskMitigated: string;
  severity: Severity;
  category: GovernanceCategory;
  description: string;
}

export interface GuardrailSettings {
  requireVerificationForNewMerchants: MandateConstraint<boolean>;
  confirmationThreshold: MandateConstraint<number>;
  maxTransactionsPerHour: MandateConstraint<number>;
  transactionCooldownSeconds: MandateConstraint<number>;
  blockedCategories: MandateConstraint<string[]>;
  allowedPaymentMethods: MandateConstraint<SingaporePaymentMethod[]>;
}

export const DEFAULT_SG_MANDATES: GuardrailSettings = {
  requireVerificationForNewMerchants: {
    value: true,
    riskMitigated: 'Prevents Merchant Impersonation (Scam Defense)',
    severity: 'high',
    category: 'authorization',
    description: 'Requires manual verification if the merchant is not previously trusted or PayNow-registered.'
  },
  confirmationThreshold: {
    value: 50,
    riskMitigated: 'Mitigates Large Unauthorized FAST/PayNow Transfers',
    severity: 'medium',
    category: 'spending_limit',
    description: 'Threshold amount above which explicit user confirmation is cryptographically required.'
  },
  maxTransactionsPerHour: {
    value: 5,
    riskMitigated: 'Prevents Runaway Transaction Loops / API Errors',
    severity: 'medium',
    category: 'spending_limit',
    description: 'Rate limiting for autonomous payments within a 1-hour window.'
  },
  transactionCooldownSeconds: {
    value: 60,
    riskMitigated: 'Phishing Defense & Impulse Control',
    severity: 'low',
    category: 'cooldown',
    description: 'Minimum time window between consecutive autonomous transactions.'
  },
  blockedCategories: {
    value: ['Gambling', 'Unregulated Crypto', 'Offshore Investment', 'CPF Schemes', 'Unlicensed Financial Advice', 'Job Scams'],
    riskMitigated: 'Regulatory Compliance (MAS/CPF) & High-Risk Exposure',
    severity: 'high',
    category: 'category_restriction',
    description: 'Blocks processing of payments for restricted or illegal categories in Singapore (MAS FAA, SFA, CPF Act).'
  },
  allowedPaymentMethods: {
    value: ['PayNow', 'NETS', 'DBS PayLah!'],
    riskMitigated: 'Payment Channel Security',
    severity: 'low',
    category: 'authorization',
    description: 'Restricts payment to verified local Singapore payment channels.'
  }
};
