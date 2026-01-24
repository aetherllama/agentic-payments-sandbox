import { motion } from 'framer-motion'
import { useWallet } from '../../store'
import { Card, CardHeader, Badge } from '../common'
import { formatCurrency } from '../../utils/formatCurrency'

export function WalletDisplay() {
  const wallet = useWallet()
  const availableBalance = wallet.balance - wallet.reservedAmount

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-primary-600/5 rounded-full -mr-16 -mt-16" />

      <CardHeader
        title="Wallet"
        action={
          wallet.reservations.length > 0 && (
            <Badge variant="warning">
              {wallet.reservations.length} pending
            </Badge>
          )
        }
      />

      <div className="space-y-4">
        <div>
          <p className="text-sm text-slate-500 mb-1">Available Balance</p>
          <motion.p
            key={availableBalance}
            initial={{ scale: 1.1, color: '#0ea5e9' }}
            animate={{ scale: 1, color: '#1e293b' }}
            className="text-3xl font-bold text-slate-900"
          >
            {formatCurrency(availableBalance)}
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-slate-50">
            <p className="text-xs text-slate-500 mb-0.5">Total Balance</p>
            <p className="text-lg font-semibold text-slate-700">
              {formatCurrency(wallet.balance)}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-warning-50">
            <p className="text-xs text-slate-500 mb-0.5">Reserved</p>
            <p className="text-lg font-semibold text-warning-600">
              {formatCurrency(wallet.reservedAmount)}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Daily Spending</span>
            <span className="text-sm font-medium text-slate-900">
              {formatCurrency(wallet.dailySpent)} / {formatCurrency(wallet.dailyLimit)}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                wallet.dailySpent / wallet.dailyLimit > 0.9
                  ? 'bg-danger-500'
                  : wallet.dailySpent / wallet.dailyLimit > 0.7
                  ? 'bg-warning-500'
                  : 'bg-success-500'
              }`}
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, (wallet.dailySpent / wallet.dailyLimit) * 100)}%`,
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
