import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { cn } from '../../lib/utils'

interface RadarDataPoint {
  metric: string
  value: number
  benchmark?: number
}

interface RadarChartProps {
  data: RadarDataPoint[]
  size?: number
  className?: string
  showBenchmark?: boolean
  playerLabel?: string
  benchmarkLabel?: string
}

const COLORS = {
  primary: '#2563EB',
  primaryLight: '#B4C5FF',
  outlineVariant: '#434655',
  onSurfaceVariant: '#C3C6D7',
  surface: '#0B1326',
}

function RadarChart({
  data,
  size = 300,
  className,
  showBenchmark = true,
  playerLabel = 'Player',
  benchmarkLabel = 'Benchmark',
}: RadarChartProps) {
  return (
    <div className={cn('w-full', className)}>
      <ResponsiveContainer width="100%" height={size}>
        <RechartsRadarChart data={data} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid
            stroke={COLORS.outlineVariant}
            strokeWidth={1}
          />
          <PolarAngleAxis
            dataKey="metric"
            tick={{
              fill: COLORS.onSurfaceVariant,
              fontSize: 12,
              fontFamily: "'Inter', system-ui, sans-serif",
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{
              fill: COLORS.onSurfaceVariant,
              fontSize: 10,
              fontFamily: "'JetBrains Mono', monospace",
            }}
            tickCount={5}
            axisLine={false}
          />
          {showBenchmark && (
            <Radar
              name={benchmarkLabel}
              dataKey="benchmark"
              stroke={COLORS.outlineVariant}
              fill={COLORS.outlineVariant}
              fillOpacity={0.15}
              strokeWidth={1}
            />
          )}
          <Radar
            name={playerLabel}
            dataKey="value"
            stroke={COLORS.primary}
            fill={COLORS.primary}
            fillOpacity={0.25}
            strokeWidth={2}
          />
          <Legend
            wrapperStyle={{
              fontSize: 12,
              fontFamily: "'Inter', system-ui, sans-serif",
              color: COLORS.onSurfaceVariant,
            }}
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}

export { RadarChart }
export type { RadarChartProps, RadarDataPoint }
