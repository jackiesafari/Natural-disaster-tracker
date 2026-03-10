import { existsSync } from 'node:fs'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const movebankDir = path.join(root, 'data', 'raw', 'movebank')
const frogDir = path.join(root, 'data', 'raw', 'frog-acoustic')
const outputDir = path.join(root, 'data', 'animal-signals', 'generated')
const outputFile = path.join(outputDir, 'latest.json')

function parseNumber(value, fallback = 0) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function inferSeason(isoDate) {
  const month = new Date(isoDate).getUTCMonth() + 1
  if (month >= 3 && month <= 5) return 'spring'
  if (month >= 6 && month <= 8) return 'summer'
  if (month >= 9 && month <= 11) return 'fall'
  return 'winter'
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean)
  if (lines.length < 2) return []

  const headers = lines[0].split(',').map((item) => item.trim())
  return lines.slice(1).map((line) => {
    const values = line.split(',')
    const row = {}
    headers.forEach((header, index) => {
      row[header] = (values[index] ?? '').trim()
    })
    return row
  })
}

function toBirdRecord(row, index) {
  const observedAt = row.timestamp || row.observedAt || new Date().toISOString()
  const value = parseNumber(row.movement_km_day || row.movement || row.value)
  const baselineMean = parseNumber(row.baseline_mean, 220)
  const baselineStd = parseNumber(row.baseline_std, 35)

  return {
    id: row.id || `bird-${index + 1}`,
    animalType: 'bird',
    species: row.species || 'Unknown Bird',
    source: 'movebank',
    observedAt,
    location: {
      lat: parseNumber(row.lat),
      lon: parseNumber(row.lon),
      region: row.region || 'Unknown Region',
    },
    metric: {
      name: 'movement_km_day',
      value,
      unit: row.unit || 'km/day',
    },
    baseline: {
      mean: baselineMean,
      stdDev: baselineStd,
      season: row.season || inferSeason(observedAt),
    },
    quality: {
      confidence: parseNumber(row.confidence, 0.75),
      sampleSize: parseNumber(row.sample_size, 20),
    },
    notes: row.notes || 'Imported from Movebank CSV',
  }
}

function toFrogRecord(row, index) {
  const observedAt = row.timestamp || row.observedAt || new Date().toISOString()
  const value = parseNumber(row.call_rate_per_min || row.night_activity_index || row.value)
  const metricName = row.metric === 'night_activity_index' ? 'night_activity_index' : 'call_rate_per_min'
  const unit = metricName === 'night_activity_index' ? 'index' : 'calls/min'

  return {
    id: row.id || `frog-${index + 1}`,
    animalType: 'frog',
    species: row.species || 'Unknown Frog',
    source: row.source === 'field-observer' ? 'field-observer' : 'acoustic-sensor',
    observedAt,
    location: {
      lat: parseNumber(row.lat),
      lon: parseNumber(row.lon),
      region: row.region || 'Unknown Region',
    },
    metric: {
      name: metricName,
      value,
      unit,
    },
    baseline: {
      mean: parseNumber(row.baseline_mean, 4.8),
      stdDev: parseNumber(row.baseline_std, 1.2),
      season: row.season || inferSeason(observedAt),
    },
    quality: {
      confidence: parseNumber(row.confidence, 0.68),
      sampleSize: parseNumber(row.sample_size, 15),
    },
    notes: row.notes || 'Imported from frog acoustic CSV',
  }
}

async function loadCsvRecords(dirPath, mapper) {
  if (!existsSync(dirPath)) {
    return []
  }

  const entries = await readdir(dirPath)
  const csvFiles = entries.filter((entry) => entry.toLowerCase().endsWith('.csv'))

  const all = []
  for (const file of csvFiles) {
    const filePath = path.join(dirPath, file)
    const raw = await readFile(filePath, 'utf8')
    const parsed = parseCsv(raw)
    parsed.forEach((row, idx) => {
      all.push(mapper(row, idx))
    })
  }

  return all
}

async function loadSampleRecords(fileName) {
  const filePath = path.join(root, 'data', 'animal-signals', fileName)
  const text = await readFile(filePath, 'utf8')
  return JSON.parse(text)
}

function computeFeature(record) {
  const std = record.baseline.stdDev > 0 ? record.baseline.stdDev : 0.0001
  const zScore = (record.metric.value - record.baseline.mean) / std
  const abs = Math.abs(zScore)
  const anomalyLevel = abs >= 2.5 ? 'alert' : abs >= 1.5 ? 'watch' : 'normal'

  return {
    recordId: record.id,
    animalType: record.animalType,
    species: record.species,
    zScore,
    anomalyLevel,
    observedAt: record.observedAt,
    lat: record.location.lat,
    lon: record.location.lon,
    region: record.location.region,
  }
}

async function run() {
  await mkdir(outputDir, { recursive: true })

  const [birdCsvRecords, frogCsvRecords] = await Promise.all([
    loadCsvRecords(movebankDir, toBirdRecord),
    loadCsvRecords(frogDir, toFrogRecord),
  ])

  const hasRawData = birdCsvRecords.length > 0 || frogCsvRecords.length > 0
  const birds = hasRawData ? birdCsvRecords : await loadSampleRecords('bird-signals.sample.json')
  const frogs = hasRawData ? frogCsvRecords : await loadSampleRecords('frog-signals.sample.json')
  const records = [...birds, ...frogs]
  const features = records.map(computeFeature)

  const totals = {
    all: features.length,
    alert: features.filter((item) => item.anomalyLevel === 'alert').length,
    watch: features.filter((item) => item.anomalyLevel === 'watch').length,
    normal: features.filter((item) => item.anomalyLevel === 'normal').length,
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    hasRawData,
    totals,
    records,
    features,
  }

  await writeFile(outputFile, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')

  console.log(`Animal signals built: ${outputFile}`)
  console.log(`Records: ${totals.all} | alert: ${totals.alert} | watch: ${totals.watch} | normal: ${totals.normal}`)
  if (!hasRawData) {
    console.log('No raw CSV found, used sample bird/frog datasets.')
  }
}

run().catch((error) => {
  console.error('Failed to build animal signals:', error)
  process.exitCode = 1
})
