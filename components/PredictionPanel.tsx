'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Radar, Waves, Zap } from 'lucide-react'

import { Badge } from './ui/badge'

interface PredictionBlock {
  hazard: 'hurricane' | 'earthquake'
  score: number
  level: 'Low' | 'Elevated' | 'High' | 'Severe'
  confidence: number
  summary: string
  rationale: string[]
  updatedAt: string
}

interface PredictionPayload {
  generatedAt: string
  predictions: {
    hurricane: PredictionBlock
    earthquake: PredictionBlock
  }
  disclaimer: string
  errors: string[]
}

const levelStyles: Record<PredictionBlock['level'], string> = {
  Low: 'border-emerald-300/30 bg-emerald-400/10 text-emerald-100',
  Elevated: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-100',
  High: 'border-amber-300/30 bg-amber-400/10 text-amber-100',
  Severe: 'border-rose-300/30 bg-rose-400/10 text-rose-100',
}

export default function PredictionPanel() {
  const [data, setData] = useState<PredictionPayload | null>(null)

  useEffect(() => {
    let mounted = true

    async function loadPredictions() {
      try {
        const response = await fetch('/api/predictions')
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as PredictionPayload
        if (mounted) {
          setData(payload)
        }
      } catch {
        // Keep dashboard stable if network/API fails.
      }
    }

    void loadPredictions()
    const intervalId = setInterval(loadPredictions, 5 * 60 * 1000)

    return () => {
      mounted = false
      clearInterval(intervalId)
    }
  }, [])

  if (!data) {
    return (
      <section className="glass-panel mb-4 rounded-3xl p-4 sm:p-6">
        <div className="inline-flex items-center gap-2 text-slate-200">
          <Radar className="h-4 w-4" />
          Loading prediction signals...
        </div>
      </section>
    )
  }

  const blocks = [data.predictions.hurricane, data.predictions.earthquake]

  return (
    <section className="glass-panel mb-4 rounded-3xl p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2 text-slate-100">
        <Radar className="h-4 w-4 text-cyan-300" />
        <h2 className="text-lg font-semibold">Live Prediction Signals</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {blocks.map((block) => (
          <article key={block.hazard} className="rounded-2xl border border-white/12 bg-slate-950/45 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="inline-flex items-center gap-2 font-medium text-white">
                {block.hazard === 'hurricane' ? <Waves className="h-4 w-4 text-cyan-300" /> : <Zap className="h-4 w-4 text-amber-300" />}
                {block.hazard === 'hurricane' ? 'Hurricane Potential' : 'Earthquake Potential'}
              </p>
              <Badge className={levelStyles[block.level]}>{block.level}</Badge>
            </div>

            <p className="text-2xl font-semibold text-white">{block.score}/100</p>
            <p className="mt-1 text-sm text-slate-300">Confidence {(block.confidence * 100).toFixed(0)}%</p>
            <p className="mt-3 text-sm text-slate-200">{block.summary}</p>

            <ul className="mt-3 space-y-1 text-xs text-slate-400">
              {block.rationale.slice(0, 3).map((item) => (
                <li key={item}>- {item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <p className="mt-4 inline-flex items-center gap-2 text-xs text-slate-400">
        <AlertTriangle className="h-3.5 w-3.5" />
        {data.disclaimer}
      </p>
    </section>
  )
}
