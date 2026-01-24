import { useState, useCallback, useRef, useEffect } from 'react'

interface SliderProps {
  min: number
  max: number
  value: number
  onChange: (value: number) => void
  step?: number
  label?: string
  formatValue?: (value: number) => string
  disabled?: boolean
  showValue?: boolean
}

export function Slider({
  min,
  max,
  value,
  onChange,
  step = 1,
  label,
  formatValue = (v) => v.toString(),
  disabled = false,
  showValue = true,
}: SliderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const percentage = ((value - min) / (max - min)) * 100

  const updateValue = useCallback(
    (clientX: number) => {
      if (!trackRef.current || disabled) return

      const rect = trackRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const rawValue = min + percent * (max - min)
      const steppedValue = Math.round(rawValue / step) * step
      const clampedValue = Math.max(min, Math.min(max, steppedValue))
      onChange(clampedValue)
    },
    [min, max, step, onChange, disabled]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return
      setIsDragging(true)
      updateValue(e.clientX)
    },
    [disabled, updateValue]
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      updateValue(e.clientX)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, updateValue])

  return (
    <div className={`w-full ${disabled ? 'opacity-50' : ''}`}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <label className="text-sm font-medium text-slate-700">{label}</label>
          )}
          {showValue && (
            <span className="text-sm font-medium text-primary-600">
              {formatValue(value)}
            </span>
          )}
        </div>
      )}
      <div
        ref={trackRef}
        className={`relative h-2 rounded-full bg-slate-200 ${
          disabled ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
        onMouseDown={handleMouseDown}
      >
        <div
          className="absolute h-full rounded-full bg-primary-500 transition-all"
          style={{ width: `${percentage}%` }}
        />
        <div
          className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-primary-500 shadow-sm transition-all ${
            isDragging ? 'scale-110 shadow-md' : ''
          } ${disabled ? '' : 'hover:scale-105'}`}
          style={{ left: `calc(${percentage}% - 8px)` }}
        />
      </div>
    </div>
  )
}
