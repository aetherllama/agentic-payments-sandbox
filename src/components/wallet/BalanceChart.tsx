import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useWallet } from '../../store'
import { Card, CardHeader } from '../common'
import { formatCurrency } from '../../utils/formatCurrency'

export function BalanceChart() {
  const wallet = useWallet()

  const chartData = useMemo(() => {
    const data: { time: number; balance: number }[] = []
    let runningBalance = wallet.balance

    const sortedTransactions = [...wallet.transactions]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20)
      .reverse()

    sortedTransactions.forEach((txn) => {
      if (txn.type === 'debit') {
        runningBalance += txn.amount
      } else {
        runningBalance -= txn.amount
      }
      data.push({ time: txn.timestamp, balance: runningBalance })
    })

    data.push({ time: Date.now(), balance: wallet.balance })

    return data
  }, [wallet.transactions, wallet.balance])

  const maxBalance = Math.max(...chartData.map((d) => d.balance), wallet.balance * 1.1)
  const minBalance = Math.min(...chartData.map((d) => d.balance), 0)
  const range = maxBalance - minBalance || 1

  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * 100
    const y = 100 - ((d.balance - minBalance) / range) * 100
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,100 ${points} 100,100`

  return (
    <Card>
      <CardHeader
        title="Balance History"
        action={
          <span className="text-sm text-slate-500">
            {chartData.length} data points
          </span>
        }
      />

      <div className="relative h-40">
        {chartData.length < 2 ? (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
            Not enough data to display chart
          </div>
        ) : (
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <defs>
              <linearGradient id="balanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(14, 165, 233)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(14, 165, 233)" stopOpacity="0" />
              </linearGradient>
            </defs>

            <motion.polygon
              points={areaPoints}
              fill="url(#balanceGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />

            <motion.polyline
              points={points}
              fill="none"
              stroke="rgb(14, 165, 233)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />

            {chartData.map((d, i) => {
              const x = (i / (chartData.length - 1)) * 100
              const y = 100 - ((d.balance - minBalance) / range) * 100
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="1.5"
                  fill="white"
                  stroke="rgb(14, 165, 233)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                />
              )
            })}
          </svg>
        )}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
        <div>
          <p className="text-xs text-slate-500">Starting</p>
          <p className="text-sm font-medium text-slate-700">
            {formatCurrency(chartData[0]?.balance || wallet.balance)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">Current</p>
          <p className="text-sm font-medium text-slate-900">
            {formatCurrency(wallet.balance)}
          </p>
        </div>
      </div>
    </Card>
  )
}
