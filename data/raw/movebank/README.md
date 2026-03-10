# Movebank Raw Drop Folder

Place exported Movebank CSV files here for ingestion.

Expected minimal columns:
- `id`
- `species`
- `timestamp` (ISO-8601)
- `lat`
- `lon`
- `region`
- `movement_km_day`

Optional columns:
- `baseline_mean`
- `baseline_std`
- `confidence`
- `sample_size`
- `season`
- `notes`

Example row:
```csv
id,species,timestamp,lat,lon,region,movement_km_day,baseline_mean,baseline_std,confidence,sample_size,season,notes
bird-100,Swainson's Hawk,2026-02-21T00:00:00Z,35.2,-101.8,Texas Panhandle,305,240,32,0.9,48,late-winter migration,high-speed segment
```
