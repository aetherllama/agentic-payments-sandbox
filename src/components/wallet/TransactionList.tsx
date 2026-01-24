import { motion, AnimatePresence } from 'framer-motion'
import { useWallet } from '../../store'
import { Card, CardHeader, Badge } from '../common'
import { formatCurrency } from '../../utils/formatCurrency'
import type { Transaction } from '../../types'

interface TransactionItemProps {
  transaction: Transaction
}

function TransactionItem({ transaction }: TransactionItemProps) {
  const isDebit = transaction.type === 'debit'

  const statusColors = {
    pending: 'warning',
    approved: 'primary',
    rejected: 'danger',
    completed: 'success',
    failed: 'danger',
    reserved: 'neutral',
  } as const

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center ${
            isDebit ? 'bg-danger-100' : 'bg-success-100'
          }`}
        >
          {isDebit ? (
            <svg
              className="w-5 h-5 text-danger-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 13l-5 5m0 0l-5-5m5 5V6"
              />
            </svg>
          ) : (
            <svg
              className="w-5 h-5 text-success-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 11l5-5m0 0l5 5m-5-5v12"
              />
            </svg>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-slate-900 line-clamp-1">
            {transaction.description}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            {transaction.merchantName && (
              <span className="text-xs text-slate-500">
                {transaction.merchantName}
              </span>
            )}
            <Badge variant={statusColors[transaction.status]} size="sm">
              {transaction.status}
            </Badge>
          </div>
        </div>
      </div>
      <div className="text-right">
        <p
          className={`text-sm font-semibold ${
            isDebit ? 'text-danger-600' : 'text-success-600'
          }`}
        >
          {isDebit ? '-' : '+'}
          {formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-slate-400">
          {new Date(transaction.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </motion.div>
  )
}

interface TransactionListProps {
  maxItems?: number
  showHeader?: boolean
}

export function TransactionList({ maxItems = 10, showHeader = true }: TransactionListProps) {
  const wallet = useWallet()
  const transactions = wallet.transactions.slice(0, maxItems)

  return (
    <Card>
      {showHeader && (
        <CardHeader
          title="Recent Transactions"
          subtitle={`${wallet.transactions.length} total`}
        />
      )}

      {transactions.length === 0 ? (
        <div className="py-8 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-3">
            <svg
              className="w-6 h-6 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-sm text-slate-500">No transactions yet</p>
          <p className="text-xs text-slate-400 mt-1">
            Transactions will appear here as the agent makes purchases
          </p>
        </div>
      ) : (
        <div className="max-h-80 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </Card>
  )
}
