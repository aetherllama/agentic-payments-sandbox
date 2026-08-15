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

    describe('boundary values', () => {
        it('should allow a transaction exactly at the confirmation threshold', () => {
            const result = GuardrailValidator.validateMandate(
                mockAgent,
                { amount: 50, merchantName: 'FairPrice', category: 'Groceries' },
                [],
                false
            )
            expect(result.allowed).toBe(true)
        })

        it('should require approval one unit above the confirmation threshold', () => {
            const result = GuardrailValidator.validateMandate(
                mockAgent,
                { amount: 51, merchantName: 'FairPrice', category: 'Groceries' },
                [],
                false
            )
            expect(result.allowed).toBe(false)
            expect(result.requiresApproval).toBe(true)
        })

        it('should allow the transaction that fills exactly up to the hourly rate limit', () => {
            const now = Date.now()
            // Timestamps are pushed past the cooldown window (60s) so only the
            // rate-limit mandate is under test here.
            const history = Array.from({ length: 4 }, (_, i) => ({
                id: `txn_${i}`,
                timestamp: now - 120000 - i * 1000,
                amount: 10,
                type: 'debit' as const,
                status: 'completed' as const,
                agentId: 'agent_1',
                description: 'prior',
            }))
            const result = GuardrailValidator.validateMandate(
                mockAgent,
                { amount: 10, merchantName: 'FairPrice', category: 'Groceries' },
                history,
                false
            )
            expect(result.allowed).toBe(true)
        })

        it('should block the transaction that would exceed the hourly rate limit', () => {
            const now = Date.now()
            const history = Array.from({ length: 5 }, (_, i) => ({
                id: `txn_${i}`,
                timestamp: now - i * 1000,
                amount: 10,
                type: 'debit' as const,
                status: 'completed' as const,
                agentId: 'agent_1',
                description: 'prior',
            }))
            const result = GuardrailValidator.validateMandate(
                mockAgent,
                { amount: 10, merchantName: 'FairPrice', category: 'Groceries' },
                history,
                false
            )
            expect(result.allowed).toBe(false)
            expect(result.reason).toContain('Rate limit exceeded')
        })

        it('should enforce the cooldown when the last transaction was too recent', () => {
            const history = [{
                id: 'txn_last',
                timestamp: Date.now() - 5000,
                amount: 10,
                type: 'debit' as const,
                status: 'completed' as const,
                agentId: 'agent_1',
                description: 'prior',
            }]
            const result = GuardrailValidator.validateMandate(
                mockAgent,
                { amount: 10, merchantName: 'FairPrice', category: 'Groceries' },
                history,
                false
            )
            expect(result.allowed).toBe(false)
            expect(result.reason).toContain('Cooling period active')
        })
    })

    describe('mandate precedence', () => {
        it('should block on category restriction even when the merchant is also new', () => {
            const result = GuardrailValidator.validateMandate(
                mockAgent,
                { amount: 10, merchantName: 'Casino', category: 'Gambling' },
                [],
                true
            )
            expect(result.allowed).toBe(false)
            expect(result.requiresApproval).toBe(false)
            expect(result.reason).toContain('restricted')
        })

        it('should flag new-merchant verification before the confirmation threshold when both apply', () => {
            const result = GuardrailValidator.validateMandate(
                mockAgent,
                { amount: 999, merchantName: 'New Shop', category: 'Electronics' },
                [],
                true
            )
            expect(result.requiresApproval).toBe(true)
            expect(result.reason).toContain('New merchant detected')
        })
    })
})
