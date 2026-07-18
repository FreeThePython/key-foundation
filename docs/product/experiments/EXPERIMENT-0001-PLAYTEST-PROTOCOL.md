# EXPERIMENT-0001 — Playtest Protocol

## Purpose

This protocol evaluates both whether the simulation behaves correctly and whether the player experiences that behavior as coherent, consequential, and alive.

The first participant is the project creator. This is formative testing, not population-level validation. The purpose is to expose design failures early and create better hypotheses for later participants.

## Evidence Layers

### System Evidence

- knowledge boundaries
- canonical state consistency
- action provenance
- relationship persistence
- promise and obligation state
- consequence activation
- divergence across runs

### Experience Evidence

- perceived motives
- trust and suspicion
- emotional weight
- clarity of cause and effect
- surprise versus randomness
- sense of agency
- desire to continue or replay

Neither layer can validate the experiment alone.

## Session Structure

Each baseline session uses the same canonical starting state and scenario version.

### Run A — Natural Play

The participant receives only the player-facing premise and interface.

Instruction:

> Play as you naturally would. Do not try to test the system. Treat the situation as real within the fiction.

Purpose:

- determine whether the scenario engages without technical framing
- capture intuitive trust, concern, and decision-making
- expose communication failures

### Run B — Deliberate Contrast

Reset to the exact same initial state.

Instruction:

> Take a meaningfully different approach from your first run while still acting plausibly.

Purpose:

- test causal divergence
- determine whether different strategies change behavior and possibility
- identify disguised convergence

### Run C — Coherence Stress Test

Reset again.

Instruction:

> Pursue an unusual but understandable approach. You may delay, refuse responsibility, negotiate, lie, make conflicting promises, or attempt a compromise.

Purpose:

- test behavior outside the obvious path
- test ambiguity handling
- test whether characters preserve agency when the player resists the premise

## In-Play Checkpoints

At major state changes, the interface asks for a very brief optional note. These notes should not reveal hidden mechanics.

1. Who do you currently trust most, and why?
2. What do you think each person wants most?
3. What are you most worried will happen?
4. Did the latest response make sense?
5. Did anything feel forced, scripted, or random?

The player may skip a checkpoint to preserve flow.

## Post-Run Interview

### Understanding

1. What happened, in your own words?
2. Why do you think Mara acted as she did?
3. Why do you think Tomas acted as he did?
4. Why do you think Elian acted as he did?
5. Which earlier action most affected the ending state?

### Agency

6. Did your choices meaningfully affect what happened?
7. Which choice mattered most?
8. Did you believe another approach could have produced a different result?
9. Did the system prevent any action that seemed reasonable?

### Coherence

10. Did anyone behave inconsistently?
11. Did anyone appear to know something they should not know?
12. Did any consequence feel disconnected from its cause?
13. Did any event feel like it happened only to create drama?

### Experience

14. Did the decision carry emotional or strategic weight?
15. Were you surprised at any point?
16. Did the surprise make sense afterward?
17. Did you care what happened to any character?
18. Did you want to continue beyond the end of the test?
19. Did you want to replay immediately?

### Open Reflection

20. What felt most alive?
21. What felt most artificial?
22. What did you expect the system to understand that it did not?
23. What should remain unchanged?
24. What is the single most important revision?

## Inspector Review

Only after the post-run interview does the participant inspect hidden state.

Review order:

1. canonical truth
2. each character's initial knowledge
3. knowledge changes
4. relationship changes
5. promises and obligations
6. candidate actions and scores
7. selected actions
8. pending consequences

The participant then records:

- which internal causes were successfully communicated through play
- which causes were valid but invisible
- which perceived causes did not exist in the model
- which internal state appeared unnecessary
- whether the trace feels like a genuine cause or a post hoc justification

## Comparison Record

For each major character action, record:

| Field | Entry |
|---|---|
| Observed action | |
| Player's initial explanation | |
| Structured causal explanation | |
| Match quality | strong / partial / weak / contradictory |
| Communication failure? | yes / no |
| Simulation failure? | yes / no |
| Notes | |

## Rating Dimensions

Use a 1–5 scale only as a compact aid. Written explanation remains primary.

- character coherence
- causal clarity
- consequence weight
- perceived agency
- emotional engagement
- surprise without randomness
- interface clarity
- desire to replay

A score must always be accompanied by a sentence explaining it.

## Pass Criteria for the Formative Round

The first formative round is promising when:

- the participant can identify a plausible motive for each major action
- at least one later state is clearly traced to an earlier player choice
- Run A and Run B diverge in more than dialogue wording
- no critical knowledge leak occurs
- at least one character feels independently motivated
- the participant reports caring about an outcome
- the participant wants to test another approach

## Failure Classification

Every major problem is assigned one primary class.

### Scenario Failure

The situation is implausible, trivial, emotionally empty, or has an obvious correct answer.

### Simulation Failure

The structured state or decision process produces unsupported behavior.

### Model Mediation Failure

Generated language contradicts or exceeds structured state.

### Communication Failure

The internal cause is valid, but the player cannot perceive enough evidence to understand it.

### Interface Failure

The player cannot discover or express a reasonable action because of presentation or controls.

### Evaluation Failure

The protocol does not capture the player's actual reaction or cannot distinguish competing explanations.

## Research Integrity

The scenario, prompts, weights, or traces must not be altered during a run to improve the result. Revisions occur only between recorded versions.

A disappointing run is useful evidence. The objective is not to demonstrate that KEY already works. The objective is to discover precisely what must become true for KEY to work.