# Live Prediction Layer (MVP)

This app now exposes a live prediction/nowcast API:
- `/api/predictions`

## Data feeds
- Hurricane potential: NWS active alerts feed (`api.weather.gov`)
- Earthquake potential: USGS FDSN event query API (`earthquake.usgs.gov`)

## Important
- Earthquake output is a probabilistic nowcast based on recent seismicity patterns.
- It is not deterministic earthquake prediction.

## Scoring
- Hurricane score combines active warning/watch counts (hurricane/tropical/storm surge) into a 0-100 risk score.
- Earthquake score combines recent US seismic activity counts and weighted magnitudes into a 0-100 risk score.

## UI
- `/Users/jackiebrain/Desktop/Natural-disaster-tracker/components/PredictionPanel.tsx` displays both risks with level, confidence, and rationale.
