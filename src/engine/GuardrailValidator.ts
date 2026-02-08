import { Transaction, AgentConfig } from '../types';
import { GuardrailSettings, MandateConstraint } from '../types/guardrails';

export interface ValidationResult {
    allowed: boolean;
    requiresApproval: boolean;
    reason?: string;
    mitigationRisk?: string;
    severity?: 'low' | 'medium' | 'high';
}

export class GuardrailValidator {
    static validateMandate(
        agent: AgentConfig,
        transaction: Partial<Transaction>,
        history: Transaction[],
        isNewMerchant: boolean
    ): ValidationResult {
        const { guardrails } = agent;

        // 1. Blocked Categories (MAS/Regulatory Compliance)
        if (transaction.category && guardrails.blockedCategories.value.includes(transaction.category)) {
            return {
                allowed: false,
                requiresApproval: false,
                reason: `Transaction blocked: Category '${transaction.category}' is restricted.`,
                mitigationRisk: guardrails.blockedCategories.riskMitigated,
                severity: guardrails.blockedCategories.severity
            };
        }

        // 2. New Merchant Verification (Scam prevention)
        if (isNewMerchant && guardrails.requireVerificationForNewMerchants.value) {
            return {
                allowed: false,
                requiresApproval: true,
                reason: `New merchant detected: '${transaction.merchantName}'. Manual mandating required.`,
                mitigationRisk: guardrails.requireVerificationForNewMerchants.riskMitigated,
                severity: guardrails.requireVerificationForNewMerchants.severity
            };
        }

        // 3. Confirmation Threshold (High-value transfers)
        if (transaction.amount && transaction.amount > guardrails.confirmationThreshold.value) {
            return {
                allowed: false,
                requiresApproval: true,
                reason: `Amount $${transaction.amount} exceeds autonomous mandate threshold ($${guardrails.confirmationThreshold.value}).`,
                mitigationRisk: guardrails.confirmationThreshold.riskMitigated,
                severity: guardrails.confirmationThreshold.severity
            };
        }

        // 4. Rate Limiting (Runaway protection)
        const oneHourAgo = Date.now() - 3600000;
        const recentTransactions = history.filter(t => t.timestamp > oneHourAgo);
        if (recentTransactions.length >= guardrails.maxTransactionsPerHour.value) {
            return {
                allowed: false,
                requiresApproval: true,
                reason: `Rate limit exceeded: Max ${guardrails.maxTransactionsPerHour.value} transactions per hour.`,
                mitigationRisk: guardrails.maxTransactionsPerHour.riskMitigated,
                severity: guardrails.maxTransactionsPerHour.severity
            };
        }

        // 5. Cooldown (Impulse/Phishing protection)
        if (history.length > 0) {
            const lastTransaction = history[0]; // Assuming history is sorted newest first
            const secondsSinceLast = (Date.now() - lastTransaction.timestamp) / 1000;
            if (secondsSinceLast < guardrails.transactionCooldownSeconds.value) {
                return {
                    allowed: false,
                    requiresApproval: true,
                    reason: `Cooling period active. Please wait ${Math.ceil(guardrails.transactionCooldownSeconds.value - secondsSinceLast)}s.`,
                    mitigationRisk: guardrails.transactionCooldownSeconds.riskMitigated,
                    severity: guardrails.transactionCooldownSeconds.severity
                };
            }
        }

        // 6. Allowed Payment Methods (Channel security)
        const paymentMethod = (transaction as any).paymentMethod || 'PayNow';
        if (!guardrails.allowedPaymentMethods.value.includes(paymentMethod)) {
            return {
                allowed: false,
                requiresApproval: true,
                reason: `Payment method '${paymentMethod}' is restricted. Allowed: ${guardrails.allowedPaymentMethods.value.join(', ')}.`,
                mitigationRisk: guardrails.allowedPaymentMethods.riskMitigated,
                severity: guardrails.allowedPaymentMethods.severity
            };
        }

        return { allowed: true, requiresApproval: false };
    }
}
