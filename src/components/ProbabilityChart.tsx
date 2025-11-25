import { useEffect, useRef } from 'react'
import { Chart, LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Filler } from 'chart.js'
import type { SimulationResult } from '../lib/models'

Chart.register(LineController, LineElement, PointElement, LinearScale, Title, Tooltip, Filler)

interface Props {
  result: SimulationResult | null
}

export function ProbabilityChart({ result }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const chartRef = useRef<Chart | null>(null)

  useEffect(() => {
    if (!canvasRef.current) return
    if (!result) return
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return
    const data = result.curve.map((p) => ({ x: p.t, y: p.pSuccess }))
    if (!chartRef.current) {
      chartRef.current = new Chart(ctx, {
        type: 'line',
        data: {
          datasets: [
            {
              label: 'P(success) vs time',
              data,
              borderColor: 'rgba(13,110,253,0.9)',
              backgroundColor: 'rgba(13,110,253,0.15)',
              fill: 'origin',
              pointRadius: 0,
              tension: 0.12,
            },
          ],
        },
        options: {
          animation: false,
          maintainAspectRatio: false,
          scales: {
            x: { type: 'linear', title: { display: true, text: 'Seconds' } },
            y: { type: 'linear', min: 0, max: 1, title: { display: true, text: 'Probability' } },
          },
          plugins: { tooltip: { mode: 'index', intersect: false } },
        },
      })
    } else {
      chartRef.current.data.datasets[0].data = data as any
      chartRef.current.update()
    }
  }, [result])

  return <div className="chart" style={{ height: 300 }}><canvas ref={canvasRef} /></div>
}
