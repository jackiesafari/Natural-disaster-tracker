import { Activity, ArrowUpRight, Clock4, MapPin, Siren, Users } from 'lucide-react'

import type { DisasterEvent } from './TrackerMap'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface DisasterSidebarProps {
  disasters: DisasterEvent[]
  selectedDisaster: DisasterEvent | null
  onSelectDisaster: (disaster: DisasterEvent) => void
  resetFilters: () => void
}

const severityStyles = {
  Severe: 'border-rose-300/30 bg-rose-400/10 text-rose-100',
  High: 'border-amber-300/30 bg-amber-400/10 text-amber-100',
  Moderate: 'border-cyan-300/30 bg-cyan-400/10 text-cyan-100',
}

export default function DisasterSidebar({
  disasters,
  selectedDisaster,
  onSelectDisaster,
  resetFilters,
}: DisasterSidebarProps) {
  return (
    <aside className="glass-panel h-full overflow-hidden rounded-3xl">
      <div className="grid h-full grid-rows-[auto,1fr]">
        <Card className="border-0 bg-transparent text-white shadow-none">
          <CardHeader className="space-y-3 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-xl">Event Brief</CardTitle>
              <Badge className="border-white/15 bg-white/5 text-slate-200">{disasters.length} listed</Badge>
            </div>

            {selectedDisaster ? (
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-lg font-semibold">{selectedDisaster.title}</h3>
                  <Badge className={severityStyles[selectedDisaster.severity]}>{selectedDisaster.severity}</Badge>
                </div>

                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  <p className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-cyan-300" />
                    {selectedDisaster.location}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Clock4 className="h-4 w-4 text-cyan-300" />
                    Updated {selectedDisaster.updatedAt}
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Users className="h-4 w-4 text-cyan-300" />
                    {selectedDisaster.peopleImpacted} people impacted
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <Siren className="h-4 w-4 text-cyan-300" />
                    {selectedDisaster.status}
                  </p>
                </div>

                <p className="mt-4 text-sm text-slate-200">{selectedDisaster.summary}</p>

                <div className="mt-4 space-y-2 rounded-xl border border-white/10 bg-slate-900/60 p-3">
                  {Object.entries(selectedDisaster.details).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-slate-300">{key}</span>
                      <span className="font-medium text-white">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {selectedDisaster.resources.map((resource) => (
                    <Button
                      key={resource.href}
                      asChild
                      variant="outline"
                      className="justify-between border-white/15 bg-slate-900/70 text-slate-100 hover:bg-slate-800"
                    >
                      <a href={resource.href} target="_blank" rel="noopener noreferrer">
                        {resource.label}
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-sm text-slate-300">
                No event selected. Pick a marker or event to view details.
              </div>
            )}
          </CardHeader>
        </Card>

        <CardContent className="overflow-y-auto p-4 pt-0 sm:p-5 sm:pt-0">
          {disasters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/20 bg-slate-950/45 p-5 text-sm text-slate-300">
              <p>No events match the current filters.</p>
              <Button
                onClick={resetFilters}
                variant="outline"
                className="mt-3 border-white/20 bg-transparent text-slate-100 hover:bg-slate-800"
              >
                Reset filters
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {disasters.map((disaster) => {
                const isSelected = selectedDisaster?.id === disaster.id

                return (
                  <button
                    key={disaster.id}
                    onClick={() => onSelectDisaster(disaster)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      isSelected
                        ? 'border-cyan-300/40 bg-cyan-400/10'
                        : 'border-white/10 bg-slate-950/45 hover:border-white/20 hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <p className="font-medium text-white">{disaster.title}</p>
                      <Badge className={severityStyles[disaster.severity]}>{disaster.severity}</Badge>
                    </div>
                    <p className="text-sm text-slate-300">{disaster.summary}</p>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400">
                      <Activity className="h-3.5 w-3.5" />
                      {disaster.area}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </CardContent>
      </div>
    </aside>
  )
}
