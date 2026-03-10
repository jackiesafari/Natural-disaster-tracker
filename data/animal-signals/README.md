# Animal Signal Data (Bird + Frog)

This folder stores early-stage behavioral signals for future natural-disaster prediction features.

## Files
- `bird-signals.sample.json`: starter examples aligned to bird telemetry/trajectory behavior.
- `frog-signals.sample.json`: starter examples aligned to acoustic/activity behavior.

## Intended Source Mapping
- Birds:
  - Movebank MBI collection (raw track data and telemetry events)
  - Audubon Bird Migration Explorer (exploration and species/route prioritization)
- Frogs:
  - Acoustic sensor logs from local stations
  - Field observer data feeds (citizen science or institutional)

## Record Shape
Each record follows `AnimalSignalRecord` in `/Users/jackiebrain/Desktop/Natural-disaster-tracker/lib/animal-signals.ts`.

Core fields:
- `species`, `observedAt`, `location`
- `metric`: behavior measurement (`movement_km_day`, `call_rate_per_min`, etc.)
- `baseline`: seasonal expectation (`mean`, `stdDev`)
- `quality`: confidence + sample size

## Why this matters
This lets us start collecting weak signals now and score anomalies with z-scores.
These signals are not used for automated hazard decisions yet; they are evidence inputs for model research.
