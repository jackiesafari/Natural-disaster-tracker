# Animal Ingestion Runbook

## Purpose
Operational steps to ingest bird and frog behavior data into feature-ready records.

## 1. Prepare raw data
- Drop Movebank bird CSVs in:
  - `/Users/jackiebrain/Desktop/Natural-disaster-tracker/data/raw/movebank`
- Drop frog acoustic/observer CSVs in:
  - `/Users/jackiebrain/Desktop/Natural-disaster-tracker/data/raw/frog-acoustic`

Column expectations are documented in each folder's README.

## 2. Build generated feature table
Run:
```bash
npm run animal:build
```

This creates:
- `/Users/jackiebrain/Desktop/Natural-disaster-tracker/data/animal-signals/generated/latest.json`

## 3. Consume in app
- API endpoint:
  - `GET /api/animal-signals`
- Behavior:
  - If generated file exists, API serves it.
  - Otherwise, API falls back to sample bird/frog datasets.

## 4. Suggested scheduling
- Start with daily rebuild.
- Move to 6-hourly once reliable raw feeds are in place.

## 5. Quality checks before model use
- Confirm no zero/invalid coordinates.
- Ensure confidence values are in `[0,1]`.
- Validate enough sample size per species/region before scoring high-severity anomalies.
