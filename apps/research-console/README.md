# KEY Research Console

The browser-based research surface for EXPERIMENT-0001: The Winter Medicine.

## Purpose

The console separates two views of the same deterministic simulation:

- **Experience Mode** shows only what the player should perceive.
- **Research Mode** exposes canonical state, agent internals, the causal event ledger, and invariant checks.

The current build intentionally uses structured actions and deterministic state transitions. Natural-language mediation and model-generated dialogue come later, after the simulation layer is trustworthy.

## Run locally

```bash
cd apps/research-console
npm install
npm run dev
```

Open `http://localhost:3000`.

## Test

```bash
npm test
```

## Current capabilities

- deterministic canonical reset
- three structured agent states
- directional trust and obligation
- medicine ownership and one-time transfer
- grain-release consequence
- time advancement
- player departure
- autonomous event during player absence
- causal provenance on every event
- invariant validation
- Experience and Research modes
- player research notes

## Next implementation slice

1. Replace fixed relationship deltas with a transparent decision-scoring model.
2. Add observation routing and explicit knowledge transfer.
3. Add promise fulfillment and violation.
4. Add patient-condition progression.
5. Add saveable playtest sessions and perception surveys.
6. Add constrained natural-language action interpretation.
