# EXPERIMENT-0001 — The Room

## Status

Specification Complete — Ready for Implementation Review

## Primary Hypothesis

Players will perceive consequences as meaningful when an earlier choice changes later character behavior, relationship state, resource control, and available options in a traceable way.

## First Scenario Fixture

The first controlled scenario is **The Winter Medicine**.

It replaces abstract Agent A, Agent B, and Agent C placeholders with a believable local crisis involving:

- Mara Holt, a healer responsible for one remaining dose of medicine
- Tomas Venn, a mill owner whose daughter may die without it
- Elian Vale, a wounded courier carrying an uncertain warning of approaching raiders
- one village whose survival also depends on Tomas releasing grain

The scenario is intentionally small but not emotionally or causally empty.

## Implementation Packet

- [Scenario Specification — The Winter Medicine](EXPERIMENT-0001-SCENARIO-THE-WINTER-MEDICINE.md)
- [State and Decision Specification](EXPERIMENT-0001-STATE-AND-DECISION-SPEC.md)
- [Implementation Plan](EXPERIMENT-0001-IMPLEMENTATION-PLAN.md)
- [Playtest Protocol](EXPERIMENT-0001-PLAYTEST-PROTOCOL.md)

## Secondary Questions

- Can three agents remain inside distinct knowledge boundaries?
- Can agents act during player absence?
- Can a promise create a future obligation?
- Can withholding information matter differently from lying?
- Can the same initial state produce more than one coherent outcome?
- Can valid internal causality be communicated clearly enough for the player to perceive it?
- Can a player pursue an unexpected but sensible approach without breaking coherence?

## Environment

One clinic meeting room during a local crisis, with an adjacent treatment room and a village state that can be affected by decisions made inside the clinic.

Three agents dispute the use of one scarce dose of medicine before changing medical and external deadlines close available possibilities.

## Player Actions

The first interface permits:

- ask a directed question
- request evidence or clarification
- reveal known information
- withhold information
- make a promise
- make a false or uncertain claim
- negotiate a conditional agreement
- give or assign the medicine
- attempt to take or secure the medicine
- support an agent's claim
- reject coercive terms
- leave the room
- advance time
- attempt another plausible natural-language action

## Simulation State

The experiment tracks:

- canonical facts
- each observer's knowledge
- each agent's beliefs
- uncertainty and information source
- resource ownership, location, control, and access
- directional trust and resentment
- fear, dependency, gratitude, and obligation
- promises and their conditions
- remembered events
- current goals
- pressure and deadlines
- available actions
- perceived possibilities
- event provenance
- pending consequences

## Required Causal Trace

Every selected agent action must record:

1. what the agent knew
2. what the agent believed
3. what the agent wanted or feared
4. which relationship or obligation mattered
5. which actions were considered
6. which actions were rejected and why
7. why the selected action dominated
8. what state changed afterward

The trace must exist before player-facing language is rendered. It cannot be generated afterward as a persuasive explanation.

## Time Advancement

At least one segment must occur after the player leaves or explicitly advances time.

During that interval, agents may:

- speak privately
- transfer or secure the medicine
- fulfill or violate a promise
- seek witnesses or verification
- retaliate
- cooperate
- revise a belief
- release or withhold grain
- organize a response to the external warning

The system must not select these actions solely to produce a dramatic return. They must emerge from agent state, access, time, and constraints.

## Controlled Playtest Runs

### Run A — Natural Play

The creator plays instinctively without hidden-state access.

### Run B — Deliberate Contrast

The scenario resets to identical starting truth and the creator pursues a meaningfully different strategy.

### Run C — Coherence Stress Test

The creator attempts an unusual but understandable approach such as delaying, refusing responsibility, negotiating, lying, or making conflicting promises.

## Evidence Layers

### System Evidence

- invariant checks
- knowledge boundaries
- event and consequence provenance
- state persistence
- decision traces
- divergence across runs

### Experience Evidence

- character believability
- perceived motive
- emotional and strategic weight
- causal clarity
- surprise without randomness
- sense of agency
- desire to continue or replay

A technically valid but lifeless result fails. A compelling but untraceable result also fails.

## Success Signals

- The player identifies at least one earlier action that caused a later state.
- At least one agent is perceived as independently motivated.
- No agent uses inaccessible information.
- Promise, trust, resource, and knowledge changes persist across time advancement.
- Natural and contrasting playthroughs diverge beyond wording.
- Internal causal traces substantially match perceived explanations.
- Surprising behavior remains understandable after reflection.
- The player cares what happens and wants to try another approach.

## Failure Signals

- The player believes the same result would occur regardless of choice.
- Agents act mainly to manufacture drama.
- Knowledge leaks between agents.
- State changes are recorded but not expressed in behavior.
- Outcomes differ only in prose.
- The causal trace is post hoc or unsupported.
- One solution is so obviously correct that meaningful pressure collapses.
- Hidden facts operate as arbitrary twists.
- The interface prevents reasonable actions.

## Failure Classification

Observed failures must be classified as primarily:

- scenario failure
- simulation failure
- model mediation failure
- communication failure
- interface failure
- evaluation failure

This distinction is required before revision.

## Explicit Non-Goals

This experiment does not test:

- polished dialogue quality
- visual presentation
- combat
- world generation
- long-form plotting
- complete emotional realism
- adaptive UI
- adaptive game design
- procedural scenario generation
- commercial replayability

## Advancement Criteria

EXPERIMENT-0001 may enter implementation when:

- the scenario fixture is versioned
- state and action schemas are represented in code
- action provenance is inspectable
- baseline runs use the same rules and initial truth
- automated knowledge-boundary checks exist
- the playtest and recording interface is ready

It may advance to EXPERIMENT-0002 only after results are documented and the primary hypothesis is supported, revised, or rejected.

## Governing Principle

> The first experiment succeeds only when coherent internal causality becomes meaningful player experience.