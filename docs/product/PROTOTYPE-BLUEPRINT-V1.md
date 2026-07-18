# KEY Prototype Blueprint v1

## Purpose

The KEY prototype program is a sequence of small experiments, not an attempt to build the complete KEY experience at once.

> The prototype is not a miniature version of the final product. It is a laboratory for testing the smallest useful behaviors that KEY must eventually perform.

## Program Objective

Prove that a small simulated world can maintain coherent state, support situated agents, preserve memory, produce understandable consequences, and generate meaningful divergence through player action.

The program does not yet attempt to prove adaptive genres, large worlds, dynamic combat, fully generative UI, or complete game design intelligence.

## Experimental Sequence

### Module 0.1 — Persistent Consequence

Question:

Can one player action alter later character behavior and available options in a way the player understands?

Minimum environment:

- one location
- three agents
- one disputed resource
- one delayed consequence

### Module 0.2 — Situated Character Agency

Question:

Can agents make coherent decisions from their own knowledge, beliefs, desires, fears, relationships, and constraints without waiting for the player?

### Module 0.3 — Active History

Question:

Can a past event continue shaping present trust, interpretation, obligation, and available solutions?

### Module 0.4 — Relationship Memory

Question:

Can promises, betrayals, mercy, humiliation, and withholding produce persistent directional relationship change?

### Module 0.5 — Emergent Local Story

Question:

Can pressure, choice, consequence, and memory produce a recountable story without a predetermined scene sequence?

### Module 0.6 — Adaptive Gameplay Emphasis

Question:

Can the system detect a player's repeated mode of engagement and deepen that mode without changing the experience arbitrarily?

Candidate modes:

- diplomacy
- investigation
- resource management

### Module 0.7 — Adaptive Information View

Question:

Can interface emphasis change with role and activity while preserving stable controls and visual grammar?

## The First Experimental World

The initial environment is **The Room**.

It contains:

- one location
- three agents
- one scarce or disputed resource
- one immediate conflict
- one relevant past event
- one hour of simulated time

Each agent has:

- private knowledge
- one dominant desire
- one fear
- one relationship history
- one mistaken belief or incomplete interpretation
- one current constraint

The player may:

- speak
- ask
- reveal information
- withhold information
- promise
- lie
- give the resource
- take the resource
- leave

## First Core State

The smallest reusable simulation should represent:

- Agent
- Knowledge
- Belief
- Desire
- Fear
- Goal
- Relationship
- Promise
- Resource
- Memory
- Identity
- Pressure
- Event
- Consequence
- Possibility

## First Core Loop

```text
Player or agent observes
    ↓
Observation updates situated knowledge
    ↓
Agent interprets through belief, memory, and relationship
    ↓
Desire and pressure produce candidate actions
    ↓
Agent selects and performs an action
    ↓
Canonical world state changes
    ↓
Observers receive partial information
    ↓
Memories, relationships, obligations, and possibilities update
    ↓
Time advances
```

## Measurement Strategy

System instrumentation must capture:

- event provenance
- state before and after each action
- who observed each event
- knowledge changes
- belief changes
- relationship changes
- promises created, fulfilled, or violated
- resource ownership
- generated candidate actions
- selected action and causal rationale
- possibilities opened or closed

## Human Playtest Questions

After each run, ask:

1. Why did each character act as they did?
2. Which earlier action mattered later?
3. Did anyone seem to know something they should not know?
4. Did the characters feel as though they continued thinking when the player was absent?
5. Did the later situation feel caused, scripted, or random?
6. Which relationship changed, and why?
7. What future possibilities appeared to open or close?
8. Would the player recount what happened as a story?

## Success Criteria for Module 0.1

The first module succeeds when:

- players can correctly identify at least one earlier cause of a later consequence
- agents remain within their knowledge boundaries
- a promise or resource decision persists after time advances
- at least two player choices produce meaningfully different later states
- agent behavior can be traced to modeled causes
- repeated runs do not require a predetermined narrative sequence

## Failure Criteria

The module fails when:

- later behavior appears random or disconnected
- agents reveal unavailable information
- relationship changes occur without traceable causes
- player choices change wording but not state or possibility
- the system requires hidden scripting to force the intended result
- players cannot explain why the later situation occurred

## Non-Goals

The first modules do not include:

- kingdoms
- generated cosmology
- large historical timelines
- combat
- procedural maps
- open-world traversal
- crafting
- economies beyond one local resource
- voice or cinematic presentation
- adaptive genre
- fully dynamic UI
- multiplayer
- finished-game polish

## Advancement Rule

> Scope expands only when the current layer demonstrates coherent, observable, and repeatable behavior.

No module advances merely because implementation is complete.

It advances only after evidence is reviewed and the relevant hypotheses are supported, revised, or rejected.