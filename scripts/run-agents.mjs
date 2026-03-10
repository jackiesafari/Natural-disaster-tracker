import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()
const REPORTS_DIR = path.join(ROOT, 'reports')
const OUTPUT_PATH = path.join(REPORTS_DIR, 'agent-report.latest.json')

function nowIso() {
  return new Date().toISOString()
}

function inferHazardType(title) {
  const t = title.toLowerCase()
  if (t.includes('hurricane') || t.includes('tropical') || t.includes('storm')) return 'hurricane'
  if (t.includes('earthquake') || t.includes('fault') || t.includes('seismic')) return 'earthquake'
  if (t.includes('fire') || t.includes('wildfire')) return 'wildfire'
  return 'unknown'
}

async function loadDisasterEvents() {
  const trackerPath = path.join(ROOT, 'components', 'TrackerMap.tsx')
  const text = await readFile(trackerPath, 'utf8')

  const itemPattern = /\{\s*id:\s*(\d+),[\s\S]*?title:\s*'([^']+)',[\s\S]*?location:\s*'([^']+)'/g
  const events = []
  let match
  while ((match = itemPattern.exec(text)) !== null) {
    const [, id, title, location] = match
    events.push({
      id: Number(id),
      title,
      location,
      hazard: inferHazardType(title),
    })
  }

  return events
}

function verifierAgent(events) {
  const suspiciousKeywords = ['sample', 'demo', 'mock', 'helios', 'fandom', 'fictional']

  const findings = events.map((event) => {
    const titleLower = event.title.toLowerCase()
    const hits = suspiciousKeywords.filter((k) => titleLower.includes(k))

    return {
      eventId: event.id,
      eventTitle: event.title,
      status: hits.length ? 'needs_review' : 'pass',
      reasons: hits.length
        ? [`Contains placeholder/fictional indicator(s): ${hits.join(', ')}`]
        : ['No obvious placeholder keywords detected in title.'],
      recommendedAction: hits.length
        ? 'Replace with verified naming from official feed or mark clearly as scenario.'
        : 'Keep, but still verify against NWS/USGS before publish.',
    }
  })

  return {
    agent: 'verifier',
    purpose: 'Double-check event naming and obvious factual red flags',
    generatedAt: nowIso(),
    findings,
  }
}

function researchAgent() {
  return {
    agent: 'research',
    purpose: 'Primary-source research checklist for disaster prediction data',
    generatedAt: nowIso(),
    recommendations: [
      {
        topic: 'Hurricane forecast inputs',
        sources: [
          'NWS API alerts (api.weather.gov)',
          'NOAA/NHC advisories and forecast discussions',
        ],
        nextStep: 'Add parser for active basin systems and advisory metadata.',
      },
      {
        topic: 'Earthquake probabilistic nowcast inputs',
        sources: [
          'USGS FDSN event feed',
          'USGS OAF / ETAS guidance',
        ],
        nextStep: 'Backtest score calibration by region with rolling windows.',
      },
      {
        topic: 'Animal evidence expansion',
        sources: [
          'Movebank MBI studies (North American bird telemetry)',
          'Audubon Bird Migration Explorer for species/route prioritization',
        ],
        nextStep: 'Map selected bird species by hazard region and build lead-lag features.',
      },
    ],
  }
}

function safetyResourcesAgent(events) {
  const resourceMap = {
    hurricane: [
      { label: 'FEMA Disaster Assistance', url: 'https://www.disasterassistance.gov/' },
      { label: 'NHC Public Advisories', url: 'https://www.nhc.noaa.gov/' },
      { label: 'Ready.gov Hurricanes', url: 'https://www.ready.gov/hurricanes' },
      { label: 'American Red Cross Shelter Finder', url: 'https://www.redcross.org/get-help/disaster-relief-and-recovery-services/find-an-open-shelter.html' },
    ],
    earthquake: [
      { label: 'USGS Earthquake Hazards Program', url: 'https://earthquake.usgs.gov/' },
      { label: 'Ready.gov Earthquakes', url: 'https://www.ready.gov/earthquakes' },
      { label: 'FEMA Earthquake Safety', url: 'https://www.fema.gov/emergency-managers/risk-management/earthquake' },
      { label: 'American Red Cross Emergency App', url: 'https://www.redcross.org/get-help/how-to-prepare-for-emergencies/mobile-apps.html' },
    ],
    wildfire: [
      { label: 'InciWeb Incident Information', url: 'https://inciweb.wildfire.gov/' },
      { label: 'AirNow Fire & Smoke Map', url: 'https://fire.airnow.gov/' },
      { label: 'Ready.gov Wildfires', url: 'https://www.ready.gov/wildfires' },
      { label: 'California Fire Foundation', url: 'https://www.cafirefoundation.org/' },
    ],
    unknown: [
      { label: 'Ready.gov', url: 'https://www.ready.gov/' },
      { label: 'American Red Cross', url: 'https://www.redcross.org/' },
    ],
  }

  const eventResources = events.map((event) => ({
    eventId: event.id,
    eventTitle: event.title,
    location: event.location,
    hazard: event.hazard,
    resources: resourceMap[event.hazard] ?? resourceMap.unknown,
  }))

  return {
    agent: 'safety_resources',
    purpose: 'Attach vetted safety/help resources for affected people',
    generatedAt: nowIso(),
    eventResources,
  }
}

async function run() {
  const events = await loadDisasterEvents()

  const report = {
    generatedAt: nowIso(),
    framework: {
      version: '1.0',
      style: 'simple sequential agents',
      agents: ['verifier', 'research', 'safety_resources'],
    },
    input: {
      eventCount: events.length,
      events,
    },
    outputs: {
      verifier: verifierAgent(events),
      research: researchAgent(),
      safetyResources: safetyResourcesAgent(events),
    },
  }

  await mkdir(REPORTS_DIR, { recursive: true })
  await writeFile(OUTPUT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  console.log(`Agent report written to ${OUTPUT_PATH}`)
  console.log(`Processed events: ${events.length}`)
}

run().catch((error) => {
  console.error('Agent framework run failed:', error)
  process.exitCode = 1
})
