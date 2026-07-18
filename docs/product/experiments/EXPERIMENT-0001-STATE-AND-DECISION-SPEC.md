# EXPERIMENT-0001 — State and Decision Specification

## Purpose

This document defines the smallest inspectable simulation needed to run The Winter Medicine. It is not a universal ontology implementation. It is a controlled subset designed to test the first hypothesis.

## Canonical State

The simulation maintains an objective world state independent of any character's beliefs.

```yaml
world:
  time_minute: integer
  location_states: []
  resources: []
  patients: []
  threats: []
  events: []
  consequences: []
```

### Resource

```yaml
resource:
  id: string
  type: string
  quantity: number
  location: string
  legal_owner: string|null
  physical_controller: string|null
  access_requirements: []
  status: available|reserved|transferred|used|destroyed
```

### Agent

```yaml
agent:
  id: string
  identity:
    name: string
    role: string
  values: []
  desires: []
  fears: []
  moral_boundaries: []
  knowledge: []
  beliefs: []
  memories: []
  relationships: []
  promises: []
  obligations: []
  emotional_state: {}
  current_goals: []
  perceived_options: []
  location: string
  health_state: {}
```

### Knowledge Item

```yaml
knowledge_item:
  proposition_id: string
  confidence: 0.0-1.0
  source_event_id: string|null
  acquired_at: integer
  visibility: private|shared|public
```

Knowledge records what an agent has actually observed or been told. It does not guarantee truth.

### Belief

```yaml
belief:
  proposition_id: string
  believed_value: any
  confidence: 0.0-1.0
  basis: []
  last_revised_at: integer
```

### Relationship

Relationships are directional.

```yaml
relationship:
  from_agent: string
  to_agent: string
  trust: -1.0-1.0
  affection: -1.0-1.0
  fear: 0.0-1.0
  respect: -1.0-1.0
  dependency: 0.0-1.0
  resentment: 0.0-1.0
  obligation: 0.0-1.0
  salient_memories: []
```

### Promise

```yaml
promise:
  id: string
  promisor: string
  promisee: string
  content: string
  conditions: []
  made_at: integer
  witnesses: []
  status: active|fulfilled|violated|released|impossible
  perceived_sincerity: {}
```

### Event

```yaml
event:
  id: string
  time: integer
  actor: string|null
  action_type: string
  targets: []
  location: string
  preconditions: []
  observations: []
  state_changes: []
  provenance: []
```

### Consequence

```yaml
consequence:
  id: string
  source_event_ids: []
  affected_entities: []
  immediate_effects: []
  latent_effects: []
  activation_conditions: []
  status: pending|active|resolved|expired
```

## Player Action Model

A player action is parsed into:

```yaml
player_action:
  raw_input: string
  action_type: ask|reveal|withhold|claim|promise|request|support|oppose|transfer|take|leave|wait|other
  actor: player
  targets: []
  referenced_entities: []
  proposition_content: []
  intended_effect: string|null
  confidence: 0.0-1.0
```

The system must preserve the raw input. Interpretation is an inference, not replacement truth.

When confidence is low, the system should ask for clarification rather than commit a high-impact state change.

## Observation Model

Not every event is observed by every agent.

An observation requires:

- physical or communicative access
- adequate attention
- sensory or linguistic comprehensibility
- no blocking condition

Each observation produces a knowledge or belief update for that observer. An unobserved event cannot directly update an agent.

## Decision Cycle

For each agent eligible to act:

1. Construct the agent's perceived current state.
2. Identify active pressures.
3. Generate plausible actions available to that agent.
4. Reject actions violating hard constraints or moral boundaries unless a boundary-breaking threshold is explicitly met.
5. Score remaining actions.
6. Select an action using bounded variability.
7. Execute only if canonical preconditions still hold.
8. Record the complete causal trace.

## Candidate Action Scoring

The first implementation may use a transparent weighted model:

```text
utility(action) =
    goal_advancement
  + fear_reduction
  + value_alignment
  + relationship_effect
  + obligation_effect
  + survival_effect
  + strategic_leverage
  - moral_cost
  - expected_risk
  - uncertainty_penalty
  - effort_cost
```

Weights belong to the agent and current state. They must not be invented after selection.

The language model may propose candidate actions and expression, but the structured layer must determine eligibility and preserve the scoring basis.

## Bounded Variability

Identical state does not require identical wording, but it should usually produce behavior from the same coherent action family.

Randomness may break close ties. It may not override dominant motives without a recorded cause.

## Causal Trace

Every meaningful agent action records:

```yaml
causal_trace:
  agent_id: string
  decision_time: integer
  perceived_facts: []
  active_beliefs: []
  active_desires: []
  active_fears: []
  relevant_relationships: []
  relevant_promises: []
  constraints: []
  candidate_actions:
    - action: string
      eligible: boolean
      rejection_reason: string|null
      score_components: {}
      total_score: number|null
  selected_action: string
  selection_reason: string
  resulting_event_id: string
```

## Simulation Tick

A tick occurs after a player action or explicit time advancement.

```text
Validate player action
    ↓
Apply immediate canonical changes
    ↓
Determine observers
    ↓
Update observer knowledge and beliefs
    ↓
Update relationships, promises, and obligations
    ↓
Advance clock by action cost
    ↓
Activate time and state triggers
    ↓
Select eligible agent reactions
    ↓
Execute agent actions
    ↓
Record events and consequences
    ↓
Render player-facing state
```

## Action Costs

Initial defaults:

- simple question: 1 minute
- extended discussion: 3 minutes
- private conversation: 4 minutes
- inspect patient or object: 3 minutes
- make or negotiate promise: 2 minutes
- move between clinic rooms: 1 minute
- gather outside witness: 5 minutes
- wait: player-selected interval
- leave clinic: 2 minutes plus elapsed absence

These are provisional and must be visible in research logs.

## Automated Invariants

The implementation must check:

1. No agent references an unobserved proposition as known fact.
2. No resource is controlled by two incompatible physical controllers.
3. A promise cannot be fulfilled or violated before it exists.
4. Every relationship change cites at least one event.
5. Every selected action has a pre-action causal trace.
6. Every consequence cites source events.
7. Canonical truth is not overwritten by belief updates.
8. Time-triggered changes occur only when their conditions are met.
9. Dialogue cannot silently perform a physical transfer.
10. Narrative text cannot introduce a canonical fact absent from structured state.

## Human-Readable Inspector

The inspector must let a reviewer answer:

- What is objectively true?
- What does each person know?
- What does each person merely believe?
- What changed after my action?
- Why did this character act?
- What alternatives were considered?
- What future consequences are pending?

## Explicit Limit

This specification does not yet attempt realistic psychology. It tests whether a small, explicit causal model can produce behavior that is both technically traceable and experientially convincing.