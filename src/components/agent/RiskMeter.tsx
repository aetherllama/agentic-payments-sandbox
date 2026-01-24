import { motion } from 'framer-motion'
import { Card, CardHeader } from '../common'

interface RiskMeterProps {
  level: number
  maxLevel?: number
  showLabels?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function RiskMeter({
  level,
  maxLevel = 5,
  showLabels = true,
  size = 'md',
}: RiskMeterProps) {
  const percentage = (level / maxLevel) * 100
  const angle = (percentage / 100) * 180 - 90

  const riskColors = [
    { threshold: 20, color: '#22c55e', label: 'Very Low' },
    { threshold: 40, color: '#84cc16', label: 'Low' },
    { threshold: 60, color: '#eab308', label: 'Medium' },
    { threshold: 80, color: '#f97316', label: 'High' },
    { threshold: 100, color: '#ef4444', label: 'Very High' },
  ]

  const currentRisk = riskColors.find((r) => percentage <= r.threshold) || riskColors[4]

  const sizes = {
    sm: { width: 120, height: 70, needleLength: 40 },
    md: { width: 180, height: 100, needleLength: 60 },
    lg: { width: 240, height: 130, needleLength: 80 },
  }

  const { width, height, needleLength } = sizes[size]
  const centerX = width / 2
  const centerY = height - 10

  return (
    <Card>
      <CardHeader title="Risk Level" subtitle={`${level}/${maxLevel}`} />

      <div className="flex flex-col items-center">
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {riskColors.map((risk, index) => {
            const startAngle = -90 + (index * 180) / 5
            const endAngle = -90 + ((index + 1) * 180) / 5
            const startRad = (startAngle * Math.PI) / 180
            const endRad = (endAngle * Math.PI) / 180

            const innerRadius = needleLength - 15
            const outerRadius = needleLength + 5

            const x1 = centerX + Math.cos(startRad) * innerRadius
            const y1 = centerY + Math.sin(startRad) * innerRadius
            const x2 = centerX + Math.cos(endRad) * innerRadius
            const y2 = centerY + Math.sin(endRad) * innerRadius
            const x3 = centerX + Math.cos(endRad) * outerRadius
            const y3 = centerY + Math.sin(endRad) * outerRadius
            const x4 = centerX + Math.cos(startRad) * outerRadius
            const y4 = centerY + Math.sin(startRad) * outerRadius

            return (
              <path
                key={risk.label}
                d={`M ${x1} ${y1} A ${innerRadius} ${innerRadius} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${outerRadius} ${outerRadius} 0 0 0 ${x4} ${y4} Z`}
                fill={risk.color}
                opacity={0.8}
              />
            )
          })}

          <motion.g
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            style={{ originX: centerX, originY: centerY }}
          >
            <line
              x1={centerX}
              y1={centerY}
              x2={centerX}
              y2={centerY - needleLength}
              stroke="#1e293b"
              strokeWidth="3"
              strokeLinecap="round"
              transform={`rotate(${angle} ${centerX} ${centerY})`}
            />
          </motion.g>

          <circle cx={centerX} cy={centerY} r="8" fill="#1e293b" />
          <circle cx={centerX} cy={centerY} r="4" fill="#f8fafc" />
        </svg>

        {showLabels && (
          <div className="flex items-center justify-between w-full mt-2 px-4">
            <span className="text-xs text-success-600">Low</span>
            <motion.span
              key={level}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-sm font-semibold"
              style={{ color: currentRisk.color }}
            >
              {currentRisk.label}
            </motion.span>
            <span className="text-xs text-danger-600">High</span>
          </div>
        )}
      </div>
    </Card>
  )
}

interface RiskBarProps {
  level: number
  maxLevel?: number
  label?: string
}

export function RiskBar({ level, maxLevel = 5, label }: RiskBarProps) {
  const segments = Array.from({ length: maxLevel }, (_, i) => i + 1)

  return (
    <div>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-600">{label}</span>
          <span className="text-sm font-medium text-slate-900">
            {level}/{maxLevel}
          </span>
        </div>
      )}
      <div className="flex gap-1">
        {segments.map((segment) => (
          <motion.div
            key={segment}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: segment * 0.05 }}
            className={`h-3 flex-1 rounded-sm ${
              segment <= level
                ? segment <= 2
                  ? 'bg-success-500'
                  : segment <= 3
                  ? 'bg-warning-500'
                  : 'bg-danger-500'
                : 'bg-slate-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
