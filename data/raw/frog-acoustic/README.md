# Frog Acoustic Raw Drop Folder

Place frog acoustic or observer CSV files here for ingestion.

Expected minimal columns:
- `id`
- `species`
- `timestamp` (ISO-8601)
- `lat`
- `lon`
- `region`
- one metric column: `call_rate_per_min` or `night_activity_index`

Optional columns:
- `metric` (`night_activity_index` to force that metric name)
- `source` (`acoustic-sensor` or `field-observer`)
- `baseline_mean`
- `baseline_std`
- `confidence`
- `sample_size`
- `season`
- `notes`

Example row:
```csv
id,species,timestamp,lat,lon,region,call_rate_per_min,baseline_mean,baseline_std,confidence,sample_size,source,notes
frog-100,Green Treefrog,2026-02-21T01:00:00Z,30.45,-91.18,Baton Rouge Wetlands,2.4,5.6,1.3,0.76,24,acoustic-sensor,suppressed calls
```
