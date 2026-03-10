import { NextResponse } from 'next/server'

type RiskLevel = 'Low' | 'Elevated' | 'High' | 'Severe'

interface PredictionBlock {
  hazard: 'hurricane' | 'earthquake'
  score: number
  level: RiskLevel
  confidence: number
  summary: string
  rationale: string[]
  updatedAt: string
}

function levelFromScore(score: number): RiskLevel {
  if (score >= 75) return 'Severe'
  if (score >= 50) return 'High'
  if (score >= 25) return 'Elevated'
  return 'Low'
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)))
}

async function getHurricanePrediction(): Promise<PredictionBlock> {
  const response = await fetch('https://api.weather.gov/alerts/active', {
    headers: {
      Accept: 'application/geo+json',
      'User-Agent': 'NaturalDisasterTracker/2026 (contact: local-development)',
    },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`NWS alerts request failed (${response.status})`)
  }

  const payload = (await response.json()) as {
    features?: Array<{
      properties?: {
        event?: string
        areaDesc?: string
        sent?: string
      }
    }>
  }

  const features = payload.features ?? []
  const events = features
    .map((item) => item.properties)
    .filter((item): item is NonNullable<typeof item> => Boolean(item?.event))

  const isEvent = (name: string) => (event: { event?: string }) => event.event?.toLowerCase() === name.toLowerCase()

  const hurricaneWarnings = events.filter(isEvent('Hurricane Warning'))
  const hurricaneWatches = events.filter(isEvent('Hurricane Watch'))
  const tropicalWarnings = events.filter(isEvent('Tropical Storm Warning'))
  const tropicalWatches = events.filter(isEvent('Tropical Storm Watch'))
  const stormSurgeWarnings = events.filter(isEvent('Storm Surge Warning'))

  const rawScore =
    hurricaneWarnings.length * 32 +
    hurricaneWatches.length * 22 +
    tropicalWarnings.length * 14 +
    tropicalWatches.length * 9 +
    stormSurgeWarnings.length * 16

  const score = clampScore(rawScore)
  const level = levelFromScore(score)

  return {
    hazard: 'hurricane',
    score,
    level,
    confidence: score > 0 ? 0.84 : 0.62,
    summary:
      score > 0
        ? 'Active NWS tropical alerts indicate elevated near-term coastal hurricane/tropical-storm risk.'
        : 'No active NWS hurricane/tropical-storm alerts detected at this fetch window.',
    rationale: [
      `Hurricane warnings: ${hurricaneWarnings.length}`,
      `Hurricane watches: ${hurricaneWatches.length}`,
      `Tropical storm warnings: ${tropicalWarnings.length}`,
      `Tropical storm watches: ${tropicalWatches.length}`,
      `Storm surge warnings: ${stormSurgeWarnings.length}`,
    ],
    updatedAt: new Date().toISOString(),
  }
}

async function getEarthquakePrediction(): Promise<PredictionBlock> {
  const now = new Date()
  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setUTCDate(now.getUTCDate() - 7)
  const starttime = sevenDaysAgo.toISOString()

  const url =
    `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
    `&starttime=${encodeURIComponent(starttime)}` +
    '&minmagnitude=2.5' +
    '&minlatitude=15&maxlatitude=72&minlongitude=-170&maxlongitude=-60'

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    next: { revalidate: 300 },
  })

  if (!response.ok) {
    throw new Error(`USGS query failed (${response.status})`)
  }

  const payload = (await response.json()) as {
    features?: Array<{
      properties?: {
        mag?: number
        place?: string
        time?: number
      }
    }>
  }

  const features = payload.features ?? []
  const events = features
    .map((item) => item.properties)
    .filter((item): item is NonNullable<typeof item> => typeof item?.mag === 'number' && typeof item?.time === 'number')

  const past24hMs = 24 * 60 * 60 * 1000
  const nowMs = now.getTime()

  const m60 = events.filter((item) => (item.mag ?? 0) >= 6).length
  const m45 = events.filter((item) => (item.mag ?? 0) >= 4.5).length
  const m35Recent = events.filter((item) => (item.mag ?? 0) >= 3.5 && nowMs - (item.time ?? 0) <= past24hMs).length
  const weightedMagnitude = events.reduce((sum, item) => sum + Math.pow(Math.max((item.mag ?? 0) - 2.5, 0), 2), 0)

  const rawScore = m60 * 42 + m45 * 10 + m35Recent * 3 + Math.min(weightedMagnitude, 28)
  const score = clampScore(rawScore)
  const level = levelFromScore(score)

  const topRecent = events
    .sort((a, b) => (b.mag ?? 0) - (a.mag ?? 0))
    .slice(0, 3)
    .map((item) => `M${(item.mag ?? 0).toFixed(1)} - ${item.place ?? 'Unknown location'}`)

  return {
    hazard: 'earthquake',
    score,
    level,
    confidence: 0.7,
    summary:
      'Probabilistic seismic activity nowcast derived from USGS recent seismicity. This is not deterministic earthquake prediction.',
    rationale: [
      `M6.0+ events (7d): ${m60}`,
      `M4.5+ events (7d): ${m45}`,
      `M3.5+ events (24h): ${m35Recent}`,
      ...topRecent,
    ],
    updatedAt: new Date().toISOString(),
  }
}

export async function GET() {
  const errors: string[] = []

  const [hurricaneResult, earthquakeResult] = await Promise.allSettled([
    getHurricanePrediction(),
    getEarthquakePrediction(),
  ])

  const hurricaneFallback: PredictionBlock = {
    hazard: 'hurricane',
    score: 0,
    level: 'Low',
    confidence: 0.3,
    summary: 'Hurricane prediction feed unavailable. Showing fallback state.',
    rationale: ['NWS alert feed could not be reached during this request.'],
    updatedAt: new Date().toISOString(),
  }

  const earthquakeFallback: PredictionBlock = {
    hazard: 'earthquake',
    score: 0,
    level: 'Low',
    confidence: 0.3,
    summary: 'Earthquake nowcast feed unavailable. Showing fallback state.',
    rationale: ['USGS feed could not be reached during this request.'],
    updatedAt: new Date().toISOString(),
  }

  const hurricane =
    hurricaneResult.status === 'fulfilled'
      ? hurricaneResult.value
      : (() => {
          errors.push(hurricaneResult.reason instanceof Error ? hurricaneResult.reason.message : 'Unknown hurricane error')
          return hurricaneFallback
        })()

  const earthquake =
    earthquakeResult.status === 'fulfilled'
      ? earthquakeResult.value
      : (() => {
          errors.push(earthquakeResult.reason instanceof Error ? earthquakeResult.reason.message : 'Unknown earthquake error')
          return earthquakeFallback
        })()

  return NextResponse.json(
    {
      generatedAt: new Date().toISOString(),
      predictions: {
        hurricane,
        earthquake,
      },
      disclaimer:
        'These are probabilistic decision-support signals from official feeds (NWS and USGS), not deterministic certainty forecasts.',
      errors,
    },
    { status: 200 },
  )
}
