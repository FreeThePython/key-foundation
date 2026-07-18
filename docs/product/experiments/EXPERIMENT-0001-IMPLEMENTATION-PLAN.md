# EXPERIMENT-0001 — Implementation Plan

## Objective

Build the smallest playable system capable of running The Winter Medicine from one stable canonical state while preserving inspectable character causality.

The first implementation is a research instrument, not a commercial game.

## Required Components

### 1. Scenario Loader

Loads a versioned scenario fixture containing:

- canonical facts
- agents
- resources
- relationships
- knowledge and beliefs
- time triggers
- initial location state

The fixture must be deterministic and restorable.

### 2. State Store

Maintains:

- canonical world state
- per-agent subjective state
- event log
- consequence graph
- decision traces
- playtest annotations

Every mutation must produce an event record.

### 3. Player Action Interpreter

Accepts natural-language input and returns a proposed structured action.

Requirements:

- retain raw input
- expose interpretation confidence
- ask for clarification on ambiguous high-impact actions
- never mutate state directly

### 4. Rule Validator

Checks:

- physical possibility
- access and control
- knowledge boundaries
- time requirements
- promise preconditions
- action target validity

### 5. Agent Decision Service

For each eligible agent:

- constructs perceived state
- generates candidate actions
- applies hard constraints
- scores candidates
- selects an action family
- records trace before expression

### 6. Dialogue and Description Renderer

Transforms approved structured events into player-facing language.

It may control wording, tone, and delivery. It may not add facts, transfer resources, change relationships, or create promises outside approved structured events.

### 7. Consequence Processor

Activates immediate and latent effects according to:

- source events
- elapsed time
- state conditions
- observations
- promises
- relationship thresholds

### 8. Research Interface

Minimum views:

#### Play

- current scene
- characters present
- dialogue history
- known facts
- freeform input
- fallback actions
- current time

#### Reflection

- optional quick notes
- post-run interview

#### Inspector

- canonical truth
- subjective state by agent
- event timeline
- relationship changes
- promises
- causal traces
- pending consequences
- invariant violations

## Suggested Technical Shape

The first build may be a single local web application with a server-side simulation core.

Recommended separation:

```text
UI
  ↓
Action Interpreter
  ↓
Simulation Core
  ├── State Store
  ├── Rule Validator
  ├── Observation Processor
  ├── Agent Decision Service
  ├── Consequence Processor
  └── Event Log
  ↓
Renderer
```

The simulation core must remain testable without the UI or a language model.

## Development Stages

### Stage 1 — Deterministic State Transitions

Implement the scenario fixture, state store, time, resource transfer, observations, promises, relationships, and event provenance without generated dialogue.

Exit condition:

- scripted test actions produce correct, inspectable state transitions

### Stage 2 — Rule-Based Agent Decisions

Implement a transparent candidate-action and scoring model.

Exit condition:

- agents select plausible action families from structured state
- no language model is needed to explain why

### Stage 3 — Natural-Language Mediation

Add player-input interpretation and event rendering.

Exit condition:

- freeform input maps reliably to structured actions
- rendered dialogue does not introduce unauthorized state

### Stage 4 — Research Interface

Add play, reflection, reset, run comparison, and inspector views.

Exit condition:

- one participant can complete and review all three protocol runs

### Stage 5 — Formative Playtest

Run Natural, Contrast, and Stress sessions.

Exit condition:

- findings are recorded and classified
- the primary hypothesis is supported, revised, or rejected

## Test Suite

### State Tests

- medicine cannot be used twice
- physical control changes only through valid events
- time windows update patient states
- reset returns the exact initial state

### Knowledge Tests

- agents learn only through observation or communication
- lies create beliefs, not canonical truth
- private conversation does not update absent agents
- uncertain information retains confidence and source

### Relationship Tests

- trust changes cite events
- promises create directional expectations
- violations activate only when conditions are met
- prior history influences decisions without forcing them

### Decision Tests

- action candidates respect access and knowledge
- hard moral boundaries reject actions under normal pressure
- dominant motives affect ranking
- close alternatives permit bounded variability
- every selection has a pre-action trace

### Renderer Tests

- generated text uses only approved facts
- dialogue does not silently perform actions
- character speech remains compatible with beliefs and values
- player-facing uncertainty matches structured uncertainty

## Versioning

Each run records:

- scenario version
- schema version
- decision-model version
- prompt version
- model identifier and settings
- code commit
- random seed

No run may be compared as controlled evidence without this metadata.

## Advancement Gate

Do not add a village map, combat, economy, procedural scenario generation, adaptive UI, or additional characters until:

1. the three baseline runs can be completed
2. critical invariants pass
3. divergent choices produce divergent state
4. the player can perceive at least part of the modeled causality
5. failures can be classified rather than merely described

## First Build Deliverable

A local playable research application where the creator can:

1. begin The Winter Medicine
2. interact naturally with Mara, Tomas, and Elian
3. advance or consume time
4. reach a consequential state
5. record reactions
6. reset and replay from identical truth
7. inspect why each character acted
8. compare runs

That is enough to determine whether the first fragment of KEY is genuinely alive.