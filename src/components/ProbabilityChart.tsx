import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

export type Series = {
  label: string
  color?: string
  t: number[]
  p: number[]
}

type Props = {
  series: Series[]
  height?: number
}

export default function ProbabilityChart({ series, height = 280 }: Props) {
  const labels = series[0]?.t ?? []
  const data = {
    labels,
    datasets: series.map((s) => ({
      label: s.label,
      data: s.p,
      borderColor: s.color ?? '#0d6efd',
      backgroundColor: s.color ?? '#0d6efd',
      pointRadius: 0,
      borderWidth: 2,
      tension: 0.15,
    })),
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: { display: true, text: 'Time (seconds)' },
        ticks: { maxTicksLimit: 8 },
      },
      y: {
        min: 0,
        max: 1,
        title: { display: true, text: 'Success probability' },
        ticks: { callback: (v: unknown) => `${v}` },
      },
    },
    plugins: {
      legend: { display: true },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `${ctx.dataset.label}: ${(ctx.parsed.y * 100).toFixed(2)}%`,
        },
      },
    },
  } as const

  return (
    <div style={{ height }}>
      <Line data={data} options={options} />
    </div>
  )
}
