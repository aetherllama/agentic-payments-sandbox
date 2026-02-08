import { motion } from 'framer-motion';
import { Card, CardHeader, Slider, Badge } from '../common';
import { GuardrailSettings, MandateConstraint } from '../../types/guardrails';

interface GuardrailsConfigProps {
    settings: GuardrailSettings;
    onUpdate: (updates: Partial<GuardrailSettings>) => void;
}

export function GuardrailsConfig({ settings, onUpdate }: GuardrailsConfigProps) {
    const renderConstraint = (
        key: keyof GuardrailSettings,
        label: string,
        type: 'toggle' | 'slider',
        min?: number,
        max?: number,
        step?: number,
        format?: (v: number) => string
    ) => {
        const constraint = settings[key] as MandateConstraint;
        const severityColors = {
            low: 'bg-info-100 text-info-700',
            medium: 'bg-warning-100 text-warning-700',
            high: 'bg-danger-100 text-danger-700'
        };

        return (
            <div key={key} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h5 className="text-sm font-semibold text-slate-800">{label}</h5>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${severityColors[constraint.severity]}`}>
                                {constraint.severity}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            {constraint.description}
                        </p>
                    </div>
                    {type === 'toggle' && (
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={constraint.value as boolean}
                                onChange={(e) => onUpdate({ [key]: { ...constraint, value: e.target.checked } })}
                            />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                    )}
                </div>

                {type === 'slider' && (
                    <Slider
                        value={constraint.value as number}
                        min={min || 0}
                        max={max || 100}
                        step={step || 1}
                        onChange={(v) => onUpdate({ [key]: { ...constraint, value: v } })}
                        formatValue={format ? format : (v) => v.toString()}
                    />
                )}

                <div className="flex items-center gap-1.5 pt-1">
                    <svg className="w-3 h-3 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.333 16.676 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-tight">Governance</span>
                    <span className="text-[10px] font-medium text-primary-700">
                        Addresses Risk: <span className="italic">{constraint.riskMitigated}</span>
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="p-1 bg-primary-100 rounded text-primary-600">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </span>
                    Transaction Mandates
                </h4>
                <Badge variant="primary" className="text-[10px]">Governance v1</Badge>
            </div>

            <div className="space-y-3">
                {renderConstraint('requireVerificationForNewMerchants', 'PayNow Merchant Verification', 'toggle')}
                {renderConstraint('confirmationThreshold', 'Mandate Confirmation Threshold', 'slider', 10, 500, 10, (v) => `S$${v}`)}
                {renderConstraint('maxTransactionsPerHour', 'Autonomous Rate Limit', 'slider', 1, 20, 1, (v) => `${v} tx/hr`)}
                {renderConstraint('transactionCooldownSeconds', 'Transaction Cooldown', 'slider', 0, 300, 30, (v) => `${v}s`)}

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-2">
                        <h5 className="text-sm font-semibold text-slate-800">Allowed Payment Methods</h5>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-info-100 text-info-700">
                            LOW
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {['PayNow', 'NETS', 'GrabPay', 'DBS PayLah!'].map(method => {
                            const isAllowed = settings.allowedPaymentMethods.value.includes(method as any);
                            return (
                                <button
                                    key={method}
                                    onClick={() => {
                                        const newValue = isAllowed
                                            ? settings.allowedPaymentMethods.value.filter(m => m !== method)
                                            : [...settings.allowedPaymentMethods.value, method as any];
                                        onUpdate({ allowedPaymentMethods: { ...settings.allowedPaymentMethods, value: newValue } });
                                    }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isAllowed
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                        }`}
                                >
                                    {method}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-2">
                        <h5 className="text-sm font-semibold text-slate-800">Blocked Categories</h5>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-danger-100 text-danger-700">
                            HIGH
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {settings.blockedCategories.value.map(cat => (
                            <Badge key={cat} variant="neutral" className="text-[10px] py-0.5">{cat}</Badge>
                        ))}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2 italic">
                        Addresses Risk: {settings.blockedCategories.riskMitigated}
                    </p>
                </div>
            </div>
        </div>
    );
}
