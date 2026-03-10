# Animal Behavior Evidence Plan (Birds + Frogs)

## Objective
Start collecting animal-behavior signals now so they can become a validated feature family in disaster prediction later.

## Scope (Initial)
- Bird movement anomalies (migration speed shifts, stopover disruptions)
- Frog activity anomalies (call suppression/spikes, unusual night activity)

## Why Bird + Frog
- Birds provide broad spatial coverage and directional movement signals.
- Frogs provide local environmental sensitivity signals (hydrology, pressure, humidity, noise ecology).

## Data Sources
### Birds
- Movebank Migratory Bird Initiative (MBI) collection
  - Primary raw telemetry source for US/Canada-focused migration studies.
- Audubon Bird Migration Explorer
  - Species and route discovery layer to prioritize ingestion.

### Frogs
- Local acoustic sensor streams
- Structured field observations from partner groups/citizen science

## Current Implementation in this repo
- Schema and anomaly utilities:
  - `/Users/jackiebrain/Desktop/Natural-disaster-tracker/lib/animal-signals.ts`
- Seed data:
  - `/Users/jackiebrain/Desktop/Natural-disaster-tracker/data/animal-signals/bird-signals.sample.json`
  - `/Users/jackiebrain/Desktop/Natural-disaster-tracker/data/animal-signals/frog-signals.sample.json`
- Ingestion + feature-table builder:
  - `/Users/jackiebrain/Desktop/Natural-disaster-tracker/scripts/build-animal-signals.mjs`
- API endpoint:
  - `/Users/jackiebrain/Desktop/Natural-disaster-tracker/app/api/animal-signals/route.ts`
- Runbook:
  - `/Users/jackiebrain/Desktop/Natural-disaster-tracker/docs/animal-ingestion-runbook.md`

## Integration Strategy
Use animal behavior only as a probabilistic evidence feature, never as a standalone trigger.

### Feature examples
- Bird:
  - `bird_migration_speed_zscore`
  - `bird_stopover_duration_zscore`
- Frog:
  - `frog_call_rate_zscore`
  - `frog_night_activity_zscore`

### Model usage
- Inject as feature group into hazard-specific models.
- Track contribution via SHAP / feature attribution logs.
- Gate promotion with out-of-time evaluation and ablation tests.

## Validation Requirements Before Production Use
1. Minimum 12 months of aligned behavior + hazard history.
2. Spatial and seasonal stratified backtests.
3. Ablation study showing incremental skill over baseline hazard models.
4. Calibration checks to prevent false confidence from noisy bio-signals.

## Ethics and Data Governance
- Respect source licenses and study-specific restrictions (especially telemetry).
- Do not expose sensitive species location details publicly when restricted.
- Keep provenance for each signal record (`source`, timestamp, confidence).

## Milestones
### M1: Data foundation (now)
- Done: schema, seed files, API endpoint.

### M2: Real ingestion connectors
- Add Movebank pull job for approved studies.
- Add frog acoustic parser/ETL for station data.

### M3: Research pipeline
- Build monthly feature tables.
- Run correlation and lead-lag analyses by hazard and region.

### M4: Model integration decision
- Only promote if validation standards are met.
