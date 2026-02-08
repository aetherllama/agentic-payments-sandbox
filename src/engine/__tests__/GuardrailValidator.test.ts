import { describe, it, expect } from 'vitest'
import { GuardrailValidator } from '../GuardrailValidator'
import { AgentConfig } from '../../types'
import { DEFAULT_SG_MANDATES } from '../../types/guardrails'

describe('GuardrailValidator', () => {
    const mockAgent: AgentConfig = {
        id: 'agent_1',
        name: 'Test Agent',
        type: 'shopping',
        enabled: true,
        spendingLimits: {
            perTransaction: 100,
            daily: 500,
            autoApproveThreshold: 25,
        },
        riskSettings: {
            maxRiskLevel: 5,
            requireApprovalAbove: 3,
        },
        allowedCategories: [],
        blockedMerchants: [],
        customRules: [],
        guardrails: { ...DEFAULT_SG_MANDATES },
    }

    it('should allow transaction within limits', () => {
        const result = GuardrailValidator.validateMandate(
            mockAgent,
            { amount: 20, merchantName: 'FairPrice', category: 'Groceries' },
            [],
            false
        )
        expect(result.allowed).toBe(true)
        expect(result.requiresApproval).toBe(false)
    })

    it('should block restricted categories', () => {
        const result = GuardrailValidator.validateMandate(
            mockAgent,
            { amount: 10, merchantName: 'Casino', category: 'Gambling' },
            [],
            false
        )
        expect(result.allowed).toBe(false)
        expect(result.requiresApproval).toBe(false)
        expect(result.reason).toContain('restricted')
    })

    it('should require approval for new merchants', () => {
        const result = GuardrailValidator.validateMandate(
            mockAgent,
            { amount: 10, merchantName: 'New Shop', category: 'Electronics' },
            [],
            true
        )
        expect(result.allowed).toBe(false)
        expect(result.requiresApproval).toBe(true)
        expect(result.reason).toContain('New merchant detected')
    })

    it('should require approval for amounts exceeding threshold', () => {
        const result = GuardrailValidator.validateMandate(
            mockAgent,
            { amount: 60, merchantName: 'FairPrice', category: 'Groceries' },
            [],
            false
        )
        expect(result.allowed).toBe(false)
        expect(result.requiresApproval).toBe(true)
        expect(result.reason).toContain('exceeds autonomous mandate threshold')
    })

    it('should block non-allowed payment methods', () => {
        const result = GuardrailValidator.validateMandate(
            mockAgent,
            {
                amount: 10,
                merchantName: 'FairPrice',
                category: 'Groceries',
                paymentMethod: 'GrabPay' // GrabPay is NOT in DEFAULT_SG_MANDATES.allowedPaymentMethods
            } as any,
            [],
            false
        )
        // Wait, let's check DEFAULT_SG_MANDATES.allowedPaymentMethods
        // value: ['PayNow', 'NETS', 'DBS PayLah!']

        expect(result.allowed).toBe(false)
        expect(result.requiresApproval).toBe(true)
        expect(result.reason).toContain("Payment method 'GrabPay' is restricted")
    })

    it('should allow allowed payment methods', () => {
        const result = GuardrailValidator.validateMandate(
            mockAgent,
            {
                amount: 10,
                merchantName: 'FairPrice',
                category: 'Groceries',
                paymentMethod: 'PayNow'
            } as any,
            [],
            false
        )
        expect(result.allowed).toBe(true)
    })
})
