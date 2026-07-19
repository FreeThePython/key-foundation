# Winter Medicine Runtime Map

## Purpose

This document maps the current Winter Medicine implementation to the [KEY Runtime Blueprint](KEY-RUNTIME-BLUEPRINT.md).

It answers three questions:

1. What already exists?
2. What is currently combined or incomplete?
3. What should be separated next without weakening the working prototype?

> The goal is not to rewrite Winter Medicine. The goal is to expose the boundaries that already exist and strengthen them one at a time.

## Executive Summary

Winter Medicine already proves several important KEY principles:

- canonical world state exists independently of narration;
- player actions create structured events and mutations;
- time advances and changes the world;
- observations and memories persist;
- invalid canonical transactions can be rejected;
- committed changes are auditable and replayable.

The strongest part of the current implementation is the **canonical reality core**.

The least separated part is the **experience and orchestration edge**. The browser lab currently combines interpretation, action proposal construction, availability checks, validation messaging, narration, API routing, session history, and UI view construction in one file.

This is acceptable for a laboratory prototype. The next step is not a large rewrite. It is a controlled extraction of the Action Proposal Contract and interpreter boundary.

## Blueprint-to-Code Map

| Runtime stage | Current implementation | Status | What the player currently experiences |
|---|---|---|---|
| Player | Browser world lab and `/api/action` / `/api/interpret` routes in `src/experiments/winter-medicine/browser-lab.ts` | Present | The player can select actions or enter natural-language attempts. |
| Intent Engine | `interpretPlayerInput()` in `browser-lab.ts` | Prototype, tightly coupled | Several phrases can resolve to the same supported action; ambiguous wording can request clarification. |
| Action Proposal | Local `ActionProposal` and `ProposalCandidate` interfaces in `browser-lab.ts` | Present, not yet reusable | Interpretation can produce accepted, rejected, or clarification-required proposals without mutating reality. |
| Reality Firewall | Split between `availableActions()`, interpreter support checks, `ensurePlayerInCabin()`, action request validation, transaction validation, and canonical commit validation | Present but distributed | Impossible or unsupported actions do not change canonical reality. |
| Canonical Action | `WinterMedicineActionRequest`, `WinterMedicineActionKind`, event creation, and transaction construction in `action-resolution.ts` | Strong, world-specific | Accepted actions have deterministic IDs, timestamps, causes, events, and mutations. |
| Canonical World State | `CanonicalStateStore` in `src/world/canonical-state-store.ts` | Strong foundation | World truth persists consistently and only changes through committed transactions. |
| Memory and Knowledge | Observation, proposition, belief, and memory records created by genesis and action resolution | Present, bounded | The player can learn facts through examination, searching, and testimony; memories persist in state. |
| Time and World Progression | `advanceWinterMedicineTime()` and `resolveWinterMedicineTurn()` in `time-progression.ts` | Strong prototype | Delay worsens Elian's condition, and travel exposes the player to the storm. |
| Story Director | Implicit rules in `sceneText()`, action availability, elapsed-time conditions, and the fixed pressure surrounding Elian | Early scaffold | The situation develops, but no independent story-direction module yet recognizes or prioritizes possibilities. |
| Narrator and Experience Layer | `actionResponses`, `genesisScene`, `sceneText()`, `buildView()`, static lab assets, and HTTP server in `browser-lab.ts` | Present, highly coupled | The player receives readable scene updates and can inspect canonical and cognitive state. |

## What Is Already Strong

### 1. Canonical truth is genuinely protected

`CanonicalStateStore` validates complete transactions against an isolated working copy. State becomes visible only if every mutation succeeds. It also records world revisions and committed transaction history.

This is the strongest architectural foundation in the current runtime.

**Player value:** the world can remain consistent even when interpreters, narrators, or interfaces change.

### 2. Actions produce causes, events, and mutations

Winter Medicine actions are not direct variable assignments from the interface. They are transformed into canonical events and structured mutations with provenance, deterministic seeds, participants, affected entities, and causal relationships.

**Player value:** consequences can later be explained, remembered, tested, and replayed.

### 3. Interpretation does not mutate reality

The `/api/interpret` route records an interpretation attempt with `canonicalMutationCount: 0`. Ambiguous or unsupported language can be rejected or clarified without changing the world.

**Player value:** KEY can think about what the player meant without accidentally making it true.

### 4. Time is part of the action loop

Each action has a duration. After the action commits, time advances through a separate canonical transaction. Elian's condition worsens, and the player's exposure changes when traveling.

**Player value:** delay matters, action has cost, and the world does not wait passively.

### 5. Knowledge is distinct from world truth

The current prototype stores observations, propositions, memories, and beliefs separately. An examination can create private knowledge without rewriting the underlying truth merely because the player noticed it.

**Player value:** discovery, uncertainty, testimony, misunderstanding, and revelation can eventually become real mechanics.

## Where Responsibilities Are Currently Mixed

### `browser-lab.ts` is doing too many jobs

It currently contains:

- HTTP server and API routing;
- static file serving;
- session-level runtime history;
- natural-language normalization;
- phrase matching;
- ambiguity detection;
- proposal construction;
- current-action availability;
- validation explanations;
- fixed action labels;
- fixed narrative responses;
- scene narration;
- canonical-state projection;
- cognition-state projection;
- player-facing view construction.

None of these responsibilities is inherently wrong. The risk is that changing one concerns several others at once.

For example, replacing the deterministic interpreter with a model-backed interpreter should not require editing the HTTP server, scene narrator, world-state projection, or action executor.

## Important Architectural Distinction

The current implementation uses the word **validation** for several different questions. These should become explicit layers.

### Proposal validation

> Did the interpreter produce a structurally valid proposal?

Examples:

- actor exists;
- intent is recognized;
- target is sufficiently identified;
- required proposal fields are present;
- confidence or ambiguity rules are satisfied.

### Situation validation

> Can this actor attempt this action in the current situation?

Examples:

- the player is in the cabin;
- the target is present;
- the action is currently supported;
- geography and timing permit the attempt.

### Canonical transaction validation

> Can these exact mutations become world truth without contradiction?

Examples:

- schemas are valid;
- revisions match;
- mutation IDs are unique;
- referenced causes exist;
- every mutation belongs to the correct world;
- the transaction commits atomically.

These layers collectively form the Reality Firewall, but they should not be treated as one undifferentiated function.

## Current Gaps Relative to the Blueprint

### Gap 1: The Action Proposal Contract is local to the browser lab

The proposal interfaces exist, but only inside `browser-lab.ts`. That prevents interpreters from being swapped cleanly and encourages world-specific parsing logic to leak into the interface layer.

### Gap 2: The interpreter is not a replaceable module

`interpretPlayerInput()` directly reads current available actions and returns the browser lab's local proposal shape.

A future deterministic, model-backed, voice, controller, or accessibility interpreter should all be able to produce the same proposal contract.

### Gap 3: Interpretation and situation validation are partially combined

The interpreter marks proposals as supported by checking current action availability. Understanding what the player means and deciding whether the world permits it are related but distinct responsibilities.

The interpreter should propose. The Reality Firewall should decide.

### Gap 4: The canonical action contract remains world-specific

`WinterMedicineActionRequest` is appropriate for the current experiment, but there is not yet a reusable bridge from a general Action Proposal to a world-specific canonical action request.

That bridge is where an action registry or resolver will eventually belong.

### Gap 5: Narration is fixed and embedded

Narrative responses and scene descriptions are coded directly into `browser-lab.ts`. This is useful for deterministic testing, but narration is not yet a replaceable projection of canonical results.

### Gap 6: Story direction is implicit

The prototype contains pressure and escalation, especially Elian's worsening condition. However, there is no separate system that reads state, recognizes unresolved pressures and possibilities, and recommends what should become salient next.

This is not the next thing to build. It is simply the least implemented blueprint stage.

### Gap 7: A turn is not fully atomic across action and time

The action transaction commits before the time transaction. If time advancement were ever rejected after a successful action commit, the world would contain the action without its expected elapsed-time consequence.

The current deterministic laboratory makes this unlikely, but the architecture should eventually define whether a turn is:

- one atomic transaction;
- a transaction group with compensation;
- or an explicitly accepted two-stage process.

This should be decided before the runtime becomes more complex.

## Recommended Refactor Sequence

The sequence below protects working behavior and avoids a broad rewrite.

### Step 1: Freeze the Action Proposal Contract

Create a reusable contract outside the browser lab containing concepts such as:

- raw player input;
- actor reference;
- intent;
- proposed action;
- target references;
- parameters;
- confidence;
- ambiguity candidates;
- interpreter identity;
- interpretation evidence;
- proposal status.

Do not add AI yet.

**Proof of success:** the existing deterministic interpreter can return the new contract with no change to player behavior.

### Step 2: Extract the deterministic interpreter

Move phrase matching and ambiguity handling from `browser-lab.ts` into a replaceable Winter Medicine interpreter module.

The interpreter may inspect a read-only context, but it must not mutate world state.

**Proof of success:** the browser lab imports an interpreter instead of containing one.

### Step 3: Create an explicit proposal validator

Separate structural interpretation confidence from current-world permission.

The validator should return clear reasons such as:

- accepted;
- clarification required;
- unsupported intent;
- target unavailable;
- actor unavailable;
- action invalid in current location;
- missing capability or knowledge.

**Proof of success:** accepted, rejected, and clarification-required paths continue to produce zero mutations until execution.

### Step 4: Add a proposal-to-action resolver

Map a validated proposal to the world-specific `WinterMedicineActionRequest`.

This is the first small form of an action registry.

**Proof of success:** `/api/action` no longer needs the interface to submit a raw `WinterMedicineActionKind` directly for interpreted actions.

### Step 5: Extract narration and view projection

Separate:

- canonical state projection;
- player knowledge projection;
- deterministic narration;
- debugging and audit projections.

**Proof of success:** changing the wording of narration cannot change canonical behavior.

### Step 6: Define turn atomicity

Decide and document how action resolution and time progression behave as one logical turn.

This can remain two transactions if the grouping and failure behavior are explicit.

**Proof of success:** tests cover a failure during the time stage after a valid action stage.

### Step 7: Evaluate a second interpreter only after the boundary is stable

Once the deterministic interpreter uses the same contract as any future interpreter, add one alternative implementation.

The purpose is not better prose. The purpose is proving replaceability.

**Proof of success:** two interpreters produce equivalent proposals for the same supported intentions, and neither can mutate canonical reality.

## What Should Not Be Refactored Yet

Do not generalize the following prematurely:

- every possible action across every future world;
- a universal Story Director;
- a universal narrator;
- a universal character cognition system;
- a full plugin framework;
- model-vendor integrations;
- dynamic world generation.

Winter Medicine should remain small enough to expose architectural mistakes clearly.

## Proposed Next Milestone

### Action Proposal Boundary v1

The next implementation milestone should prove:

```text
Player expression
    ↓
Replaceable interpreter
    ↓
Stable Action Proposal
    ↓
Explicit proposal and situation validation
    ↓
Winter Medicine action resolver
    ↓
Canonical action and time progression
    ↓
Narration
```

### Player-facing success criteria

The player should be able to express the same supported intention in multiple ways.

The runtime should:

- understand the intended action;
- request clarification when meaning is genuinely ambiguous;
- reject impossible or unsupported attempts without changing reality;
- execute accepted actions consistently;
- preserve time, memory, knowledge, and consequence;
- explain what happened in readable language.

## North Star Check

### Player Test

This refactor increases freedom of expression without weakening fairness or consequence.

### World Test

Only validated canonical transactions change reality.

### Story Test

Understanding improves, while pressure, time, memory, and consequence remain intact.

### Architecture Test

The stable core remains unchanged while the replaceable interpreter edge becomes genuinely replaceable.

## Conclusion

Winter Medicine is not missing a world engine. A meaningful portion of that engine already exists.

The immediate architectural need is to separate the path into that engine:

> **Understand the player, form a proposal, validate it against reality, and only then permit canonical change.**

That is the safest next step toward worlds where the story never stops being the game.
