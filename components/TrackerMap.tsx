'use client'

import { useEffect, useMemo, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { AlertTriangle, Filter, Flame, Search, Waves, Zap } from 'lucide-react'

import DisasterSidebar from './DisasterSidebar'
import PredictionPanel from './PredictionPanel'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

type DisasterType = 'Wildfire' | 'Hurricane' | 'Earthquake'
type Severity = 'Moderate' | 'High' | 'Severe'

export interface DisasterEvent {
  id: number
  type: DisasterType
  title: string
  location: string
  coordinates: [number, number]
  summary: string
  severity: Severity
  status: 'Monitoring' | 'Response Active' | 'Containment in Progress'
  updatedAt: string
  peopleImpacted: string
  area: string
  resources: Array<{ label: string; href: string }>
  details: Record<string, string>
}

const disasters: DisasterEvent[] = [
  {
    id: 1,
    type: 'Wildfire',
    title: 'Canyon Ridge Fire',
    location: 'Los Angeles County, California',
    coordinates: [34.126, -118.31],
    summary: 'Fast-moving brush fire with dry wind conditions and active evacuation zones.',
    severity: 'High',
    status: 'Response Active',
    updatedAt: '12 min ago',
    peopleImpacted: '18,400',
    area: '52,000 acres',
    resources: [
      { label: 'American Red Cross', href: 'https://www.redcross.org/donate/donation.html' },
      { label: 'California Fire Foundation', href: 'https://www.cafirefoundation.org/' },
    ],
    details: {
      'Air quality': 'Hazardous (AQI 214)',
      Evacuations: 'Mandatory in 4 zones',
      Containment: '37%',
    },
  },
  {
    id: 2,
    type: 'Hurricane',
    title: 'South Florida Tropical System (Sample)',
    location: 'Miami-Dade, Florida',
    coordinates: [25.7617, -80.1918],
    summary: 'Sample scenario for UI testing with rain bands, coastal surge risk, and severe wind potential.',
    severity: 'Severe',
    status: 'Response Active',
    updatedAt: '7 min ago',
    peopleImpacted: '2.1M',
    area: '155 mile corridor',
    resources: [
      { label: 'Direct Relief', href: 'https://www.directrelief.org/place/usa/' },
      { label: 'FEMA Disaster Assistance', href: 'https://www.disasterassistance.gov/' },
    ],
    details: {
      Winds: '121 mph sustained',
      'Storm surge': '9 - 12 ft',
      Rainfall: '6 - 10 inches expected',
    },
  },
  {
    id: 3,
    type: 'Earthquake',
    title: 'Bay Fault Sequence',
    location: 'San Francisco Bay Area, California',
    coordinates: [37.7749, -122.4194],
    summary: 'Magnitude 6.1 event followed by frequent aftershocks across surrounding counties.',
    severity: 'Moderate',
    status: 'Monitoring',
    updatedAt: '20 min ago',
    peopleImpacted: '312,000',
    area: '78 sq mi impact zone',
    resources: [
      { label: 'UNICEF Emergency Response', href: 'https://www.unicefusa.org/mission/emergencies/earthquakes' },
      { label: 'Ready.gov Earthquakes', href: 'https://www.ready.gov/earthquakes' },
    ],
    details: {
      Magnitude: '6.1 Mw',
      Depth: '11 km',
      Aftershocks: '14 recorded in 6 hours',
    },
  },
]

function createDisasterIcon(type: DisasterType, glyph: string) {
  return divIcon({
    html: `
      <span class="nd-marker nd-marker--${type.toLowerCase()}" role="img" aria-label="${type}">
        <span class="nd-marker__pulse"></span>
        <span class="nd-marker__core">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            ${glyph}
          </svg>
        </span>
      </span>
    `,
    className: '',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  })
}

const typeIcons: Record<DisasterType, ReturnType<typeof divIcon>> = {
  Wildfire: createDisasterIcon('Wildfire', '<path d="M13 3s-1 2-1 4c0 2 2 3 2 5a3 3 0 0 1-6 0c0-3 2-5 5-9z"/><path d="M14 14a4 4 0 1 1-8 0c0-1.5.8-2.7 2-4"/>'),
  Hurricane: createDisasterIcon('Hurricane', '<path d="M12 3a5 5 0 1 0 5 5"/><path d="M12 21a5 5 0 1 1-5-5"/><path d="M12 9a3 3 0 1 0 3 3"/>'),
  Earthquake: createDisasterIcon('Earthquake', '<path d="M5 4v7h4l-2 9 8-12h-4l2-4z"/>'),
}

function ZoomHandler({ onZoomChange }: { onZoomChange: (zoom: number) => void }) {
  const map = useMapEvents({
    zoomend: () => onZoomChange(map.getZoom()),
  })

  return null
}

function FocusOnDisaster({ disaster }: { disaster: DisasterEvent | null }) {
  const map = useMap()

  useEffect(() => {
    if (!disaster) {
      return
    }

    map.flyTo(disaster.coordinates, 6, { duration: 0.6 })
  }, [disaster, map])

  return null
}

const typeOptions: Array<DisasterType | 'All'> = ['All', 'Wildfire', 'Hurricane', 'Earthquake']

export default function TrackerMap() {
  const [selectedDisaster, setSelectedDisaster] = useState<DisasterEvent | null>(disasters[0])
  const [zoom, setZoom] = useState(4)
  const [query, setQuery] = useState('')
  const [activeType, setActiveType] = useState<DisasterType | 'All'>('All')
  const [animalSummary, setAnimalSummary] = useState<{
    all: number
    alert: number
    watch: number
    normal: number
  } | null>(null)

  const filteredDisasters = useMemo(() => {
    return disasters.filter((item) => {
      const typeMatch = activeType === 'All' || item.type === activeType
      const queryMatch =
        query.trim().length === 0 ||
        `${item.title} ${item.location} ${item.summary}`.toLowerCase().includes(query.toLowerCase())

      return typeMatch && queryMatch
    })
  }, [activeType, query])

  useEffect(() => {
    if (selectedDisaster && !filteredDisasters.some((item) => item.id === selectedDisaster.id)) {
      setSelectedDisaster(filteredDisasters[0] ?? null)
    }
  }, [filteredDisasters, selectedDisaster])

  useEffect(() => {
    let mounted = true

    async function loadAnimalSignals() {
      try {
        const response = await fetch('/api/animal-signals')
        if (!response.ok) {
          return
        }

        const payload = (await response.json()) as {
          totals?: {
            all: number
            alert: number
            watch: number
            normal: number
          }
        }
        if (mounted && payload.totals) {
          setAnimalSummary(payload.totals)
        }
      } catch {
        // Keep UI usable if the animal-signal endpoint is unavailable.
      }
    }

    void loadAnimalSignals()

    return () => {
      mounted = false
    }
  }, [])

  const severeCount = filteredDisasters.filter((item) => item.severity === 'Severe').length
  const activeResponseCount = filteredDisasters.filter((item) => item.status === 'Response Active').length

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[1700px] flex-col px-4 py-6 sm:px-6 lg:px-8">
      <section className="glass-panel mb-4 rounded-3xl p-4 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Natural Disaster Command</p>
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
              <h1 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
                Real-time Incident Intelligence
              </h1>
              <Badge className="w-fit border-orange-300/35 bg-orange-400/12 px-3 py-1 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-orange-100">
                Demo mode
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <Badge className="border-cyan-300/30 bg-cyan-400/10 px-3 py-1 text-cyan-100">{filteredDisasters.length} active events</Badge>
            <Badge className="border-rose-300/30 bg-rose-400/10 px-3 py-1 text-rose-100">{severeCount} severe</Badge>
            <Badge className="border-amber-300/30 bg-amber-400/10 px-3 py-1 text-amber-100">{activeResponseCount} responding</Badge>
            <Badge className="border-slate-300/20 bg-slate-500/10 px-3 py-1 text-slate-200">Zoom {zoom.toFixed(1)}x</Badge>
            {animalSummary && (
              <Badge className="border-emerald-300/30 bg-emerald-400/10 px-3 py-1 text-emerald-100">
                Animal signals beta: {animalSummary.all} ({animalSummary.alert} alert)
              </Badge>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by location or event"
              className="h-11 w-full rounded-xl border border-white/15 bg-slate-950/50 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/60 focus:ring-2 focus:ring-cyan-300/30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-sm text-slate-300">
              <Filter className="h-4 w-4" /> Type
            </span>
            {typeOptions.map((option) => (
              <Button
                key={option}
                size="sm"
                variant={activeType === option ? 'default' : 'outline'}
                className={
                  activeType === option
                    ? 'border border-cyan-200/40 bg-cyan-300/20 text-cyan-100 hover:bg-cyan-300/30'
                    : 'border-white/15 bg-slate-900/60 text-slate-200 hover:bg-slate-800/80'
                }
                onClick={() => setActiveType(option)}
              >
                {option === 'Wildfire' && <Flame className="h-4 w-4" />}
                {option === 'Hurricane' && <Waves className="h-4 w-4" />}
                {option === 'Earthquake' && <Zap className="h-4 w-4" />}
                {option === 'All' && <AlertTriangle className="h-4 w-4" />}
                {option}
              </Button>
            ))}
          </div>
        </div>
      </section>

      <PredictionPanel />

      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-[1.6fr,1fr]">
        <section className="glass-panel overflow-hidden rounded-3xl">
          <div className="relative h-[52vh] min-h-[420px] xl:h-full">
            <MapContainer center={[39.8283, -98.5795]} zoom={4} className="h-full w-full">
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              />

              <ZoomHandler onZoomChange={setZoom} />
              <FocusOnDisaster disaster={selectedDisaster} />

              {filteredDisasters.map((disaster) => (
                <Marker
                  key={disaster.id}
                  position={disaster.coordinates}
                  icon={typeIcons[disaster.type]}
                  eventHandlers={{
                    click: () => setSelectedDisaster(disaster),
                  }}
                >
                  <Popup>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold">{disaster.title}</h3>
                      <p className="text-xs text-slate-600">{disaster.location}</p>
                      <p className="text-xs">{disaster.severity}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </section>

        <DisasterSidebar
          disasters={filteredDisasters}
          selectedDisaster={selectedDisaster}
          onSelectDisaster={setSelectedDisaster}
          resetFilters={() => {
            setActiveType('All')
            setQuery('')
          }}
        />
      </div>
    </div>
  )
}
