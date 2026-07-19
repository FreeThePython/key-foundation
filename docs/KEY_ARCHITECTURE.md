# KEY Architecture

This document records the living technical principles of the KEY Cognitive World Model (KCWM). It is intentionally implementation-facing: each principle should constrain code, tests, simulation behavior, and the World Lab.

## Purpose

KEY is a cognitive world engine in which objective reality, agent cognition, player knowledge, action, time, and narrative remain distinct but causally connected.

The engine must support worlds that can be replayed, inspected, explained, and experienced without allowing narrative or model output to silently redefine truth.

## Core invariants

### Canonical reality is objective

Canonical state represents what is true in the world, whether or not any agent knows it.

Only validated canonical mutations may change canonical reality.

### Beliefs belong to agents

A belief is owned by an agent. It may be correct, incorrect, incomplete, uncertain, or contradictory.

A belief is not automatically canonical truth.

### Observations are evidence, not omniscience

Agents acquire information through observations, testimony, memory, inference, and other bounded cognitive processes.

A statement made by an agent becomes testimony or evidence. It does not become true merely because it was spoken.

### Reality advances independently

Time and world processes may change canonical state even when the player does nothing useful.

Delay is therefore a causal choice with consequences.

### Narrative emerges from causality

Narrative should describe validated actions, observations, mutations, and consequences. It must not invent unsupported canonical facts.

### AI proposes; validation commits

Language models may propose interpretation, dialogue, plans, descriptions, or candidate actions.

They do not directly alter canonical reality. Canonical changes require validated mutations committed through the world transaction boundary.

## Player experience principle

> The player experiences change, not state.

The engine maintains complete state. The player-facing experience should establish the scene once, then primarily present meaningful changes.

Genesis introduces the starting situation. Each subsequent turn should communicate:

1. the player's decision,
2. the immediate response,
3. elapsed time,
4. meaningful observable consequences,
5. the new current situation only where needed.

The player history must not repeat the entire unchanged world after every action.

## World Delta

A World Delta is the derived bridge between canonical execution and presentation.

```text
Canonical World
      |
      v
Validated Events and Mutations
      |
      v
World Delta
   |       |
   v       v
Narration  Runtime / Research Views
```

A delta describes what changed during a validated turn rather than reproducing a complete snapshot.

A mature delta should be able to contain:

- action accepted or rejected,
- elapsed world time,
- records created,
- attributes changed with before and after values,
- locations changed,
- observations created,
- memories created or altered,
- beliefs revised,
- processes advanced,
- player-visible consequences,
- hidden canonical consequences,
- causal event and mutation identifiers.

### Delta views

The same structured delta may support multiple presentations:

- **Player narration:** only changes the player can perceive or legitimately know.
- **Runtime console:** execution details, commits, mutation counts, revisions, and causal identifiers.
- **Research view:** deterministic inputs, outputs, seeds, and evaluation data.
- **Agent view:** changes relevant to one agent's perception, cognition, goals, or memory.

### Current implementation status

Winter Medicine currently uses a first delta-narration layer in the Player Experience panel:

- Genesis establishes the scene once.
- Each round shows the decision, immediate change, and time consequence.
- The full current situation remains separately visible.

The next engine-level step is to derive structured deltas directly from committed transactions instead of relying on action-specific presentation strings.

## World Lab principle

Every meaningful engine capability must become observable in the World Lab.

Examples:

- perception must reveal who observed what and why,
- memory must reveal formation, fidelity, decay, and retrieval,
- belief revision must reveal evidence and confidence changes,
- planning must reveal goals, candidate plans, and invalidation,
- relationships must reveal changes in trust, fear, obligation, and reputation,
- replay must reconstruct player, canonical, cognitive, and runtime views together.

Backend tests are necessary but insufficient. A layer is not complete until its player-facing and developer-facing behavior can be inspected and evaluated.

## Testing model

KEY uses multiple kinds of proof.

### Contract tests

Prove schemas, validation boundaries, branded identifiers, and bounded values.

### Canonical transaction tests

Prove atomicity, optimistic concurrency, preconditions, causality, replay, rollback, and defensive reads.

### Simulation tests

Prove deterministic action resolution, time progression, process consequences, and world-specific rules.

### Presentation tests

Prove that player-visible output respects perception, knowledge, chronology, and canonical results.

### Human playtests

Evaluate meaning, clarity, pacing, consequence, plausibility, and whether the experience matches the canonical and cognitive models.

No single test category proves the whole experience.

## Development sequence

Each new capability should follow this loop:

1. Define the canonical and cognitive contract.
2. Implement deterministic behavior.
3. Add focused automated tests.
4. Expose the behavior in the World Lab.
5. Play and inspect it.
6. Refine the model based on visible inconsistencies.

## Near-term roadmap

1. Structured World Delta derived from committed transactions.
2. Entity and attribute history inspector.
3. Tick-based replay across player, world, cognition, and runtime views.
4. Expanded Winter Medicine travel and Rook's Crossing sequence.
5. Perception and attention systems.
6. Goals, intentions, and plans.
7. Relationships and social state.
8. Validated AI-assisted narration and agent proposals.

## Decision log

### 2026-07: Browser-based World Lab first

The initial lab remains browser-based during engine iteration. Desktop packaging may follow only after the browser experience is stable and verified.

### 2026-07: Human-readable diagnostics first

The World Lab presents Fahrenheit, status labels, and interpretable diagnostics before raw engine values. Raw records remain available for debugging.

### 2026-07: Delta narration

Genesis establishes state. Turn history presents decisions and changes rather than repeating full accumulated scene state.
