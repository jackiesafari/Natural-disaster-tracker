# Natural Disaster Prediction Model Plan

## 1) Goal
Create operational forecasts for three hazards in the app:
- Wildfire risk/spread (next 24h to 7d)
- Hurricane track/intensity impact (12h to 120h)
- Earthquake aftershock probability (minutes to 1 year)

## 2) Algorithm Strategy (Best-for-use-case)
There is not one single algorithm that is best across all three hazards. The best production approach is a hazard-specific ensemble stack:

- Wildfire: Hybrid model (physics-informed + ML), with XGBoost as the core tabular predictor.
- Hurricane: Multi-model forecast consensus using official NHC/NWP guidance as baseline, plus local impact post-processing.
- Earthquake: Probabilistic aftershock forecasting via ETAS-family models (not deterministic prediction).

Why this is the best strategy:
- It matches operational practice in each domain.
- It keeps forecasts explainable and robust.
- It avoids overfitting one model type to fundamentally different physical processes.

## 3) Data Plan
### Wildfire
- FIRMS active fire detections
- Weather reanalysis/forecast variables (wind, humidity, temperature, precipitation)
- Fuels/land cover/topography (LANDFIRE + DEM derivatives)
- Historical perimeters and burn severity

### Hurricane
- NHC advisories and forecast tracks/intensity
- Model guidance/ensemble fields
- Coastal flood/surge proxies + local exposure layers

### Earthquake
- USGS ComCat event catalog
- Fault/tectonic layers for context
- Aftershock sequence histories for ETAS calibration

## 4) Modeling Architecture
- Feature store and training pipelines per hazard.
- Shared inference API that returns:
  - probability
  - expected severity band
  - uncertainty interval
  - short explanation tokens for UI
- Model registry with champion/challenger support.

## 5) Training and Evaluation
Use rolling-origin backtesting (time-aware) and spatial holdouts.

Primary metrics:
- Wildfire: PR-AUC, Brier score, calibration error, spatial hit rate
- Hurricane: track error (km), intensity MAE, impact-area IoU
- Earthquake: log-likelihood, Brier score, reliability for aftershock probabilities

Champion selection rule:
- Promote only when statistically better on out-of-time tests and no calibration regression.

## 6) Delivery Phases
### Phase 0 (1 week)
- Define forecast targets and label windows.
- Build unified schema for all hazards.
- Stand up reproducible data ingestion jobs.

### Phase 1 (2-3 weeks)
- Baselines:
  - Wildfire: logistic regression + XGBoost
  - Hurricane: NHC baseline ingest + persistence/climatology comparator
  - Earthquake: ETAS baseline
- Add monitoring dashboards for drift and calibration.

### Phase 2 (3-5 weeks)
- Wildfire hybrid model (XGBoost + physical constraints).
- Hurricane consensus weighting + local impact model.
- ETAS parameter tuning + uncertainty communication improvements.

### Phase 3 (2-3 weeks)
- Production inference service + cache layer.
- UI integration for probabilistic forecast cards and confidence bands.
- Human-in-the-loop review workflow for high-severity alerts.

## 7) Guardrails
- Earthquake: do not claim deterministic prediction; only probabilistic forecasts.
- Always show uncertainty and update timestamps.
- Block auto-publish if model confidence/calibration is out of threshold.
- Animal behavior signals (bird/frog) are auxiliary evidence only until they pass ablation and calibration thresholds.

## 8) Immediate Build Checklist
1. Add `data/` pipelines for source connectors and daily snapshots.
2. Add `models/` package with wildfire/hurricane/earthquake submodules.
3. Implement baseline training scripts and backtest harness.
4. Expose `/api/forecast` contract for UI consumption.
5. Add model card templates and evaluation reports.
6. Add animal-behavior evidence ingestion and feature logging for research mode.

## 9) References
- USGS FAQ: [Can you predict earthquakes?](https://www.usgs.gov/faqs/can-you-predict-earthquakes)
- USGS OAF + ETAS overview: [Operational Aftershock Forecasting](https://earthquake.usgs.gov/data/oaf/)
- UCERF3-ETAS paper (BSSA): [UCERF3-ETAS: A model for operational earthquake forecasting](https://pubs.geoscienceworld.org/ssa/bssa/article/108/3A/1049/531861)
- NOAA/NHC: [NHC Forecast Verification](https://www.nhc.noaa.gov/verification/)
- NOAA/NHC: [Cone of Uncertainty explained](https://www.nhc.noaa.gov/aboutcone.shtml)
- USFS fire modeling foundation: [FlamMap and burn probability simulations](https://www.fs.usda.gov/rm/pubs/rmrs_gtr371.pdf)
- Hybrid wildfire ML model: [ELM2.1-XGBfire1.0 (GMD, 2025)](https://gmd.copernicus.org/articles/18/2021/2025/gmd-18-2021-2025.html)
