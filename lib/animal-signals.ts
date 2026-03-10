export type AnimalType = 'bird' | 'frog'

export interface AnimalSignalRecord {
  id: string
  animalType: AnimalType
  species: string
  source: 'movebank' | 'audubon' | 'field-observer' | 'acoustic-sensor'
  observedAt: string
  location: {
    lat: number
    lon: number
    region: string
  }
  metric: {
    name: 'movement_km_day' | 'stopover_duration_hr' | 'call_rate_per_min' | 'night_activity_index'
    value: number
    unit: string
  }
  baseline: {
    mean: number
    stdDev: number
    season: string
  }
  quality: {
    confidence: number
    sampleSize: number
  }
  notes?: string
}

export interface AnimalSignalFeature {
  recordId: string
  animalType: AnimalType
  species: string
  zScore: number
  anomalyLevel: 'normal' | 'watch' | 'alert'
  observedAt: string
  lat: number
  lon: number
  region: string
}

function safeStdDev(stdDev: number): number {
  return stdDev > 0 ? stdDev : 0.0001
}

export function computeZScore(value: number, mean: number, stdDev: number): number {
  return (value - mean) / safeStdDev(stdDev)
}

export function classifyAnomaly(zScore: number): AnimalSignalFeature['anomalyLevel'] {
  const magnitude = Math.abs(zScore)
  if (magnitude >= 2.5) {
    return 'alert'
  }
  if (magnitude >= 1.5) {
    return 'watch'
  }
  return 'normal'
}

export function toFeature(record: AnimalSignalRecord): AnimalSignalFeature {
  const zScore = computeZScore(record.metric.value, record.baseline.mean, record.baseline.stdDev)

  return {
    recordId: record.id,
    animalType: record.animalType,
    species: record.species,
    zScore,
    anomalyLevel: classifyAnomaly(zScore),
    observedAt: record.observedAt,
    lat: record.location.lat,
    lon: record.location.lon,
    region: record.location.region,
  }
}

export function summarizeSignals(records: AnimalSignalRecord[]) {
  const features = records.map(toFeature)
  const totals = {
    all: features.length,
    alert: features.filter((feature) => feature.anomalyLevel === 'alert').length,
    watch: features.filter((feature) => feature.anomalyLevel === 'watch').length,
    normal: features.filter((feature) => feature.anomalyLevel === 'normal').length,
  }

  return { totals, features }
}
