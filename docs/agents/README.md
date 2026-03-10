# Agent Framework (Simple)

This project includes a lightweight multi-agent framework designed for human engineers.

## Goal
Run three focused agents to improve trust and usefulness:
1. `verifier`: checks event naming for obvious placeholder/fictional risks.
2. `research`: produces a primary-source research checklist.
3. `safety_resources`: maps each event to relevant emergency resources.

## Run
```bash
node scripts/run-agents.mjs
```

## Output
- `/Users/jackiebrain/Desktop/Natural-disaster-tracker/reports/agent-report.latest.json`

## Why this design
- Single script, no hidden orchestration.
- Plain JSON input/output.
- Easy to review in PRs and easy to extend with real feed checks later.

## Extension points
- Replace keyword checks in `verifier` with live source matching (NWS/USGS APIs).
- Add confidence scoring per agent output.
- Add region-aware safety resources by state/county.
