"use client"

import { memo } from "react"
import { ResponsiveContainer } from "recharts"

interface MemoizedChartProps {
  children: React.ReactNode
  height?: number
  className?: string
}

export const MemoizedChart = memo(({ children, height = 250, className }: MemoizedChartProps) => {
  return (
    <ResponsiveContainer width="100%" height={height} className={className}>
      {children}
    </ResponsiveContainer>
  )
})

MemoizedChart.displayName = "MemoizedChart"

