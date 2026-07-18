# KEY World Physics v0.1

**Status:** Foundation specification  
**System:** KEY Cognitive World Model  
**Purpose:** Define the information primitives and invariant rules from which every KEY world is constructed.

---

## 1. Definition

KEY World Physics is the formal system governing how reality, perception, knowledge, belief, memory, identity, causality, uncertainty, and change behave inside KEY.

It is not limited to physical simulation.

It defines the informational laws that make a world coherent.

A KEY world may contain medieval villages, modern organizations, alien civilizations, historical societies, classrooms, emergency simulations, or entirely fictional realities. The surface rules may differ, but the information physics remain stable.

The central principle is:

> A world is not a stream of generated descriptions. It is a causally connected state whose inhabitants perceive, misunderstand, remember, and act within it.

---

## 2. Foundational Separation

KEY must preserve strict separation between the following:

1. **Canonical truth** — what actually exists or occurred.
2. **Observation** — what an observer was capable of sensing.
3. **Interpretation** — what the observer inferred from an observation.
4. **Knowledge** — information an agent treats as established.
5. **Belief** — a proposition an agent accepts with some confidence.
6. **Memory** — an agent-owned representation of prior experience or learned information.
7. **Narration** — a human-readable expression of approved state.

These concepts may correlate, but they are never interchangeable.

A character may confidently believe something false.

A character may observe an event but misinterpret it.

A character may know a fact but refuse to disclose it.

A narrator may describe only what the player is permitted to perceive.

Canonical truth remains unchanged by any character's confidence.

---

## 3. Core Laws

### Law 1: Reality Exists Independently of Description

Canonical state exists whether or not it is narrated, observed, loaded into AI context, or currently simulated at full resolution.

Narration does not create reality.

### Law 2: Every Mental State Has an Owner

Every belief, memory, interpretation, goal, fear, and uncertainty belongs to a specific cognitive agent or institution.

There is no ownerless belief.

### Law 3: Truth and Belief Are Separate

A proposition's canonical truth status and an agent's belief in that proposition are independent values.

### Law 4: Information Requires a Path

An agent cannot know, remember, or act upon information without a causal acquisition path.

Valid paths include:

- direct perception
- testimony
- records
- inference
- teaching
- prior memory
- institutional communication
- deliberate investigation

### Law 5: Every Change Has Provenance

Every canonical mutation must identify:

- its cause
- its time
- its affected state
- the rule that permitted it
- any randomness used
- the event or process that produced it

### Law 6: Observation Is Partial

No observer automatically receives the full canonical event.

Observation depends on location, sensory access, attention, obstruction, ability, timing, and environmental conditions.

### Law 7: Memory Is Not a Perfect Copy

Memory is an agent-owned representation of prior information.

It may weaken, compress, distort, merge, become emotionally weighted, or be reinterpreted.

The canonical event remains unchanged.

### Law 8: Uncertainty Must Be Preserved

Unknown, ambiguous, disputed, inferred, and probabilistic information must not be silently converted into certainty.

### Law 9: Identity Persists Through Change

An entity may change location, condition, ownership, role, appearance, relationships, and beliefs while retaining continuity of identity unless a world rule explicitly transforms or ends that identity.

### Law 10: Time Advances Causality

Actions consume time.

Processes continue while the player waits, travels, speaks, sleeps, investigates, or focuses elsewhere.

### Law 11: Compression Must Preserve Important Causes

Low-resolution state may be summarized, but compression must preserve enough provenance to explain significant later consequences.

### Law 12: AI Cannot Author Canonical Truth

AI may propose interpretations, dialogue, summaries, or narration.

Only validated simulation rules may commit canonical changes.

---

## 4. Primitive Types

The following primitives form the minimum information substrate of KEY.

---

## 4.1 Entity

An entity is anything with persistent canonical identity.

Examples:

- person
- animal
- object
- location
- institution
- group
- document
- resource pool
- process
- concept recognized by the world model

```typescript
interface Entity {
  id: EntityId;
  type: EntityType;
  name?: string;
  existence: ExistenceState;
  createdAt: WorldTime;
  endedAt?: WorldTime;
  attributes: Record<string, CanonicalValue>;
  tags: string[];
  provenance: ProvenanceRef;
  version: number;
}
```

### Entity invariants

- IDs are stable and globally unique within a world.
- Display names are not identity.
- Two entities may share a name.
- An entity may exist without being known to any agent.
- Deletion is normally represented as an end-state, not erasure from history.

---

## 4.2 Proposition

A proposition is a structured statement that may be evaluated, believed, disputed, observed, or remembered.

Examples:

- `Elian has a fever.`
- `Mara owes Elian a debt.`
- `The northern pass is blocked.`
- `Tomas caused the fire.`

```typescript
interface Proposition {
  id: PropositionId;
  predicate: string;
  subjectIds: EntityId[];
  object?: CanonicalValue | EntityId;
  temporalScope?: TimeRange;
  spatialScope?: EntityId;
  qualifiers?: Record<string, CanonicalValue>;
}
```

A proposition is not itself truth.

Truth is an evaluation of a proposition against canonical state at a specified time.

---

## 4.3 Canonical Fact

A canonical fact is a proposition currently supported by canonical state.

```typescript
interface CanonicalFact {
  propositionId: PropositionId;
  truthStatus: "true" | "false" | "indeterminate";
  validFrom: WorldTime;
  validUntil?: WorldTime;
  evidenceRefs: ProvenanceRef[];
  confidence?: number;
  version: number;
}
```

Canonical confidence is permitted for worlds where truth is probabilistic or unresolved by the model.

It must not be confused with agent confidence.

---

## 4.4 Event

An event is a bounded canonical occurrence that changes state, communicates information, or records a meaningful transition.

```typescript
interface Event {
  id: EventId;
  type: string;
  startTime: WorldTime;
  endTime?: WorldTime;
  locationIds: EntityId[];
  participantIds: EntityId[];
  causeRefs: CauseRef[];
  enablingConditionRefs: StateRef[];
  mutations: CanonicalMutation[];
  observationOpportunities: ObservationOpportunity[];
  generatedProcessIds: ProcessId[];
  randomDrawRefs: RandomDrawRef[];
  provenance: ProvenanceRef;
}
```

### Event invariants

Every event must answer:

- What happened?
- When did it happen?
- Where did it happen?
- What caused it?
- What conditions enabled it?
- Who participated?
- Who could perceive it?
- What changed?
- What future processes began or ended?

---

## 4.5 Process

A process is an ongoing causal mechanism extending across time.

Examples:

- disease progression
- crop growth
- political unrest
- travel
- rumor spread
- construction
- economic inflation
- healing
- institutional decline

```typescript
interface Process {
  id: ProcessId;
  type: string;
  status: "scheduled" | "active" | "paused" | "completed" | "cancelled";
  startedAt: WorldTime;
  nextEvaluationAt: WorldTime;
  resolutionBand: ResolutionBand;
  inputStateRefs: StateRef[];
  affectedEntityIds: EntityId[];
  governingRuleId: RuleId;
  parameters: Record<string, CanonicalValue>;
  provenance: ProvenanceRef;
}
```

A process may generate events when thresholds are reached.

---

## 4.6 Observation

An observation is a record that an agent had sensory or informational access to some portion of an event or state.

```typescript
interface Observation {
  id: ObservationId;
  observerId: EntityId;
  sourceEventId?: EventId;
  sourceStateRefs?: StateRef[];
  modality: ObservationModality;
  observedAt: WorldTime;
  locationId?: EntityId;
  rawSignal: ObservationSignal;
  clarity: number;
  completeness: number;
  attentionLevel: number;
  obstructionRefs: EntityId[];
  provenance: ProvenanceRef;
}
```

### Observation is not interpretation

The raw observation might be:

> Mara's hand shook while she held the cup.

An interpretation might be:

> Mara is afraid.

A belief might be:

> Mara poisoned the drink and fears discovery.

KEY must preserve these as separate objects.

---

## 4.7 Interpretation

An interpretation is an agent-generated explanation of one or more observations.

```typescript
interface Interpretation {
  id: InterpretationId;
  ownerId: EntityId;
  observationIds: ObservationId[];
  propositionId: PropositionId;
  formedAt: WorldTime;
  reasoningType: "direct" | "deductive" | "inductive" | "abductive" | "associative";
  confidence: number;
  biasRefs: string[];
  emotionalInfluence: number;
  provenance: ProvenanceRef;
}
```

Interpretations may be correct, partially correct, or false.

---

## 4.8 Knowledge

Knowledge is a proposition an agent treats as sufficiently established for decision-making.

```typescript
interface KnowledgeRecord {
  id: KnowledgeId;
  ownerId: EntityId;
  propositionId: PropositionId;
  acquiredAt: WorldTime;
  acquisitionPath: InformationPath;
  sourceRefs: InformationSourceRef[];
  certainty: number;
  validityState: "active" | "questioned" | "superseded" | "forgotten";
  lastValidatedAt?: WorldTime;
  provenance: ProvenanceRef;
}
```

Knowledge need not be canonically true.

The term describes the owner's epistemic status, not omniscient correctness.

---

## 4.9 Belief

A belief is an owner-specific commitment to a proposition.

```typescript
interface Belief {
  id: BeliefId;
  ownerId: EntityId;
  propositionId: PropositionId;
  confidence: number;
  formedAt: WorldTime;
  updatedAt: WorldTime;
  sourceRefs: InformationSourceRef[];
  supportingEvidenceRefs: InformationSourceRef[];
  contradictingEvidenceRefs: InformationSourceRef[];
  emotionalWeight: number;
  identityRelevance: number;
  socialReinforcement: number;
  resistanceToRevision: number;
  status: "active" | "dormant" | "questioned" | "rejected";
  provenance: ProvenanceRef;
}
```

### Belief update principle

Belief revision should consider:

- source credibility
- evidence strength
- prior confidence
- emotional investment
- identity relevance
- consistency with other beliefs
- social reinforcement
- cognitive ability
- bias
- immediate incentives

A belief should not flip merely because contradictory information was presented.

---

## 4.10 Memory

A memory is an agent-owned representation of an experience, observation, communication, thought, or previously held state.

```typescript
interface Memory {
  id: MemoryId;
  ownerId: EntityId;
  memoryType: "episodic" | "semantic" | "procedural" | "social" | "emotional";
  formedAt: WorldTime;
  lastRecalledAt?: WorldTime;
  sourceEventRefs: EventId[];
  sourceObservationRefs: ObservationId[];
  propositionRefs: PropositionId[];
  representation: MemoryRepresentation;
  confidence: number;
  salience: number;
  emotionalValence: number;
  accessibility: number;
  distortion: number;
  consolidationState: "active" | "consolidated" | "compressed" | "fragmented";
  provenance: ProvenanceRef;
}
```

### Memory rules

- Recall does not recreate the original event.
- Recalling a memory may update the memory.
- Repeated retelling may alter representation while preserving provenance.
- Emotion may increase salience without increasing accuracy.
- Compression may remove detail but may not invent detail.
- Forgotten memory is not erased canonical history.

---

## 4.11 Information Path

An information path records how information moved from source to recipient.

```typescript
interface InformationPath {
  id: InformationPathId;
  originRef: EventId | EntityId | DocumentId | PropositionId;
  hops: InformationHop[];
  destinationId: EntityId;
  startedAt: WorldTime;
  arrivedAt: WorldTime;
  degradation: number;
  distortion: number;
  provenance: ProvenanceRef;
}

interface InformationHop {
  senderId?: EntityId;
  receiverId: EntityId;
  channel: "speech" | "gesture" | "writing" | "record" | "broadcast" | "inference" | "observation";
  sentAt: WorldTime;
  receivedAt: WorldTime;
  messageRef: MessageRef;
  fidelity: number;
}
```

This structure enables rumor propagation, testimony chains, misinformation, and institutional communication.

---

## 4.12 Relationship

A relationship is a directional, multi-dimensional state between entities.

```typescript
interface Relationship {
  id: RelationshipId;
  subjectId: EntityId;
  objectId: EntityId;
  trust: number;
  affection: number;
  respect: number;
  fear: number;
  obligation: number;
  dependency: number;
  familiarity: number;
  perceivedPower: number;
  hostility: number;
  historyRefs: EventId[];
  updatedAt: WorldTime;
  provenance: ProvenanceRef;
}
```

Relationships are directional.

Mara's trust in Tomas is not automatically equal to Tomas's trust in Mara.

---

## 4.13 Identity

Identity is the persistent self-model and recognized continuity of an entity.

```typescript
interface IdentityModel {
  ownerId: EntityId;
  selfConcepts: PropositionId[];
  roles: RoleRecord[];
  affiliations: EntityId[];
  values: ValueCommitment[];
  commitments: Commitment[];
  reputationModels: ReputationModel[];
  continuityRefs: EventId[];
  updatedAt: WorldTime;
}
```

Identity influences:

- belief resistance
- decision priorities
- shame and pride
- loyalty
- role obligations
- disclosure
- interpretation
- memory salience

Canonical identity, self-perceived identity, and socially perceived identity are distinct.

---

## 4.14 Goal

A goal is an owner-specific desired future state.

```typescript
interface Goal {
  id: GoalId;
  ownerId: EntityId;
  desiredPropositionIds: PropositionId[];
  priority: number;
  urgency: number;
  commitment: number;
  deadline?: WorldTime;
  status: "active" | "blocked" | "achieved" | "abandoned" | "superseded";
  parentGoalId?: GoalId;
  provenance: ProvenanceRef;
}
```

Goals do not directly cause action.

Actions emerge from goals interacting with beliefs, values, abilities, opportunity, emotion, and constraints.

---

## 4.15 Plan

A plan is an agent-owned proposed causal sequence intended to advance one or more goals.

```typescript
interface Plan {
  id: PlanId;
  ownerId: EntityId;
  goalIds: GoalId[];
  steps: PlannedAction[];
  assumptions: PropositionId[];
  status: "forming" | "active" | "interrupted" | "completed" | "abandoned";
  confidence: number;
  createdAt: WorldTime;
  updatedAt: WorldTime;
}
```

Plans may rely on false beliefs.

---

## 4.16 Commitment and Obligation

A commitment is an agent's accepted responsibility to produce or avoid a future state.

An obligation may be personal, social, legal, institutional, moral, or coercive.

```typescript
interface Commitment {
  id: CommitmentId;
  ownerId: EntityId;
  beneficiaryId?: EntityId;
  propositionId: PropositionId;
  originEventId: EventId;
  strength: number;
  legitimacyBelief: number;
  consequenceRefs: PropositionId[];
  status: "active" | "fulfilled" | "violated" | "released";
}
```

---

## 4.17 Emotion

Emotion is a time-varying cognitive state produced by appraisals of events relative to goals, values, relationships, threats, and identity.

```typescript
interface EmotionalState {
  ownerId: EntityId;
  dimensions: {
    valence: number;
    arousal: number;
    dominance: number;
  };
  namedStates: EmotionalActivation[];
  causes: CauseRef[];
  startedAt: WorldTime;
  decayModel: string;
  updatedAt: WorldTime;
}
```

Emotion modifies cognition and action selection but does not rewrite truth.

---

## 4.18 Uncertainty

Uncertainty is a first-class value.

```typescript
interface UncertaintyRecord {
  ownerId?: EntityId;
  propositionId: PropositionId;
  uncertaintyType: "unknown" | "ambiguous" | "probabilistic" | "conflicting" | "unresolved";
  confidenceRange?: [number, number];
  competingPropositionIds?: PropositionId[];
  sourceRefs: InformationSourceRef[];
  updatedAt: WorldTime;
}
```

KEY must distinguish:

- no information
- weak information
- conflicting information
- probabilistic outcomes
- deliberately concealed information
- information that cannot yet be resolved

---

## 4.19 Causality

Causality is represented as a graph connecting conditions, actions, processes, events, and mutations.

```typescript
interface CausalEdge {
  id: CausalEdgeId;
  fromRef: CauseRef;
  toRef: EventId | ProcessId | MutationId;
  relation: "caused" | "enabled" | "prevented" | "accelerated" | "delayed" | "amplified" | "constrained";
  strength: number;
  ruleId: RuleId;
  provenance: ProvenanceRef;
}
```

Not every prior condition is a cause.

The model must distinguish:

- direct cause
- enabling condition
- contributing factor
- trigger
- constraint
- correlation
- inferred cause

---

## 4.20 Provenance

Provenance is the chain that explains where a state, event, belief, memory, or interpretation came from.

```typescript
interface ProvenanceRecord {
  id: ProvenanceRef;
  createdBy: "genesis" | "simulation" | "observation" | "cognition" | "import" | "research";
  ruleId?: RuleId;
  sourceRefs: string[];
  eventId?: EventId;
  worldTime: WorldTime;
  systemTime: string;
  version: number;
}
```

Provenance must survive compression for all causally significant state.

---

## 5. Epistemic Pipeline

Information becomes mentally usable through a sequence.

```text
Canonical event or state
        ↓
Observation opportunity
        ↓
Observation
        ↓
Interpretation
        ↓
Belief formation or revision
        ↓
Knowledge classification
        ↓
Memory formation
        ↓
Decision influence
        ↓
Action
        ↓
New canonical event
```

Not every stage is required.

A reflexive action may occur after observation without explicit interpretation.

A rumor may produce belief without direct observation.

A forgotten fact may remain in memory but not be accessible during decision-making.

---

## 6. Truth Evaluation

Truth is evaluated relative to time and scope.

The statement:

> The door is open.

is incomplete without temporal and spatial grounding.

A valid proposition should identify:

- which door
- at what time or interval
- in which world branch
- under what interpretation of open

Truth evaluation must support:

```typescript
type TruthStatus =
  | "true"
  | "false"
  | "indeterminate"
  | "not_applicable"
  | "temporally_out_of_scope";
```

The system must not use `false` when the actual status is `unknown` or `indeterminate`.

---

## 7. Perception Physics

Observation depends on an observation function:

```text
Observation = f(
  event signal,
  sensory capability,
  distance,
  obstruction,
  attention,
  environment,
  duration,
  prior expectation,
  cognitive condition
)
```

### Observation opportunity

Before an observation exists, the simulation creates an opportunity.

```typescript
interface ObservationOpportunity {
  eventId: EventId;
  potentialObserverId: EntityId;
  availableModalities: ObservationModality[];
  signalStrength: number;
  obstruction: number;
  duration: number;
}
```

The cognition system then determines what portion became an actual observation.

This prevents all nearby agents from receiving identical information.

---

## 8. Belief Physics

Beliefs should update through transparent rules rather than arbitrary dialogue generation.

A conceptual update function is:

```text
New confidence = f(
  prior confidence,
  evidence reliability,
  source trust,
  evidence independence,
  contradiction strength,
  emotional investment,
  identity relevance,
  social pressure,
  cognitive biases
)
```

### Belief conflict

An agent may hold partially conflicting beliefs.

The system does not need to force immediate logical consistency.

Conflict may produce:

- doubt
- rationalization
- investigation
- avoidance
- emotional stress
- compartmentalization

### Belief disclosure

Possessing a belief does not imply disclosing it.

Disclosure is a separate decision influenced by:

- trust
- fear
- goals
- social norms
- secrecy
- obligation
- expected consequences

---

## 9. Memory Physics

Memory formation should be driven by:

- attention
- repetition
- emotional intensity
- novelty
- identity relevance
- goal relevance
- cognitive state
- elapsed time

### Recall

A recall request returns a reconstructed representation, not canonical history.

```text
Recall = f(
  stored representation,
  current context,
  active beliefs,
  emotion,
  retrieval cues,
  decay,
  prior recalls
)
```

### Consolidation

Memory may move through levels:

1. active experience
2. short-term representation
3. consolidated memory
4. compressed summary
5. inaccessible or fragmented trace

Important provenance references remain available even when descriptive detail is compressed.

---

## 10. Social Information Physics

Communication creates an event and an information path.

A message has at least three distinct forms:

1. what the sender intended
2. what was physically transmitted
3. what the receiver understood

```typescript
interface MessageEvent {
  senderId: EntityId;
  receiverIds: EntityId[];
  intendedMeaning: PropositionId[];
  transmittedRepresentation: string | StructuredSignal;
  channel: string;
  privacyExpectation: number;
  overhearingOpportunities: ObservationOpportunity[];
}
```

Rumors emerge when information paths accumulate distortion across hops.

Institutions may store, validate, suppress, publish, or alter information.

---

## 11. Decision Physics

A cognitive agent chooses actions from perceived possibilities, not canonical omniscience.

```text
Action choice = f(
  accessible beliefs,
  active goals,
  values,
  emotional state,
  identity,
  relationships,
  perceived affordances,
  predicted consequences,
  capability,
  time pressure,
  uncertainty
)
```

### Decision record

```typescript
interface DecisionRecord {
  id: DecisionId;
  agentId: EntityId;
  decidedAt: WorldTime;
  perceivedOptions: ActionOption[];
  selectedAction: PlannedAction;
  activeGoalIds: GoalId[];
  beliefRefs: BeliefId[];
  memoryRefs: MemoryId[];
  relationshipRefs: RelationshipId[];
  emotionalStateRef: string;
  expectedOutcomes: PredictedOutcome[];
  provenance: ProvenanceRef;
}
```

The research layer should be able to inspect why an agent acted without exposing that reasoning to the player during normal play.

---

## 12. Change Physics

Canonical state changes only through validated mutations.

```typescript
interface CanonicalMutation {
  id: MutationId;
  targetRef: StateRef;
  operation: "create" | "set" | "increment" | "decrement" | "append" | "remove" | "transition";
  beforeValue?: CanonicalValue;
  afterValue?: CanonicalValue;
  governingRuleId: RuleId;
  causeRefs: CauseRef[];
  appliedAt: WorldTime;
  provenance: ProvenanceRef;
}
```

### Mutation invariants

- The target must exist or be validly created.
- The governing rule must permit the operation.
- Preconditions must be recorded.
- Failed mutations do not partially commit unless explicitly modeled.
- Multi-step interactions should commit atomically where required.
- State versions must advance monotonically.

---

## 13. Time Physics

KEY uses world time as part of canonical state.

```typescript
interface WorldClock {
  currentTime: WorldTime;
  calendarId: string;
  tickResolution: number;
  paused: boolean;
  seed: string;
}
```

Time may advance in variable increments depending on action and resolution band.

The causal relevance system may simulate:

- active focus in seconds
- local activity in minutes
- community systems in hours
- regional systems in days
- deep world systems in months or years

Different resolution does not imply different truth.

It implies different evaluation frequency and stored detail.

---

## 14. Relevance and Resolution

The Causal Relevance Manager does not decide what is true.

It decides how much computation and memory should be allocated to truth at a given moment.

A relevance score may consider:

```text
relevance =
  player attention
+ immediate danger
+ causal proximity
+ social connection
+ information value
+ emotional significance
+ time sensitivity
- computational cost
```

Resolution changes may alter:

- update frequency
- number of tracked variables
- memory detail
- agent planning depth
- event granularity

Resolution changes may not alter:

- identity continuity
- important causal provenance
- already committed events
- ownership
- established canonical history

---

## 15. Compression Physics

Compression transforms detailed state into a lower-cost representation.

```typescript
interface CompressedState {
  sourceRefs: StateRef[];
  timeRange: TimeRange;
  summary: StructuredSummary;
  preservedCauses: CauseRef[];
  preservedChanges: CanonicalMutation[];
  unresolvedProcesses: ProcessId[];
  rehydrationHints: RehydrationHint[];
  compressionLevel: number;
  provenance: ProvenanceRef;
}
```

### Compression rule

A compressed representation must answer:

- What materially changed?
- Why did it change?
- Who or what was affected?
- Which unresolved processes continue?
- Which facts would matter if this region returned to focus?

Compression may discard decorative detail.

It may not discard causally necessary structure.

---

## 16. Narration Physics

Narration is a projection of approved information into language.

It is constrained by:

- player perception
- player knowledge
- current point of view
- validated event results
- permitted stylistic framing
- disclosure rules

```typescript
interface NarrativeGroundingPacket {
  perceivableEventRefs: EventId[];
  approvedFactRefs: PropositionId[];
  approvedDialogueActs: DialogueAct[];
  forbiddenFactRefs: PropositionId[];
  uncertaintyRefs: UncertaintyRecord[];
  styleContext: NarrativeStyle;
}
```

The narrator may vary wording.

The narrator may not:

- reveal hidden canonical facts
- invent actions
- add uncommitted state changes
- resolve uncertainty without authorization
- grant agents knowledge they did not acquire

---

## 17. Randomness Physics

Randomness must be deterministic under replay.

```typescript
interface RandomDraw {
  id: RandomDrawRef;
  seedPath: string;
  distribution: string;
  parameters: Record<string, number>;
  result: number | string | boolean;
  usedByRuleId: RuleId;
  worldTime: WorldTime;
}
```

The same initial state, seed, action sequence, and rule versions must produce the same canonical results.

Narrative wording may be nondeterministic if configured, but canonical outcomes may not be.

---

## 18. Contradiction Handling

KEY must distinguish four types of contradiction:

1. **Canonical contradiction** — two canonical facts cannot both hold in the same scope.
2. **Epistemic contradiction** — an agent holds incompatible beliefs.
3. **Testimonial contradiction** — sources make incompatible claims.
4. **Narrative contradiction** — generated language conflicts with approved state.

Canonical and narrative contradictions are system errors.

Epistemic and testimonial contradictions are valid world states.

---

## 19. Institutional Minds

Institutions may possess structured information states without being treated as human minds.

An institution may have:

- records
- policies
- official beliefs
- public claims
- hidden knowledge
- goals
- obligations
- decision procedures
- internal factions

The system must distinguish between:

- what an institution officially states
- what its records contain
- what individual members know
- what leadership believes
- what institutional behavior implies

---

## 20. World Branching and Counterfactuals

Canonical play occurs on one active world branch.

Research tools may create counterfactual branches.

```typescript
interface WorldBranch {
  id: BranchId;
  parentBranchId?: BranchId;
  divergenceEventId?: EventId;
  createdAtStateVersion: number;
  seed: string;
  purpose: "canonical" | "counterfactual" | "test" | "replay";
}
```

Counterfactual results must never silently merge into the canonical branch.

---

## 21. Required Validation Rules

A valid KEY implementation must reject or flag:

- knowledge without an information path
- memory without an owner
- belief without an owner
- canonical mutation without provenance
- event without temporal placement
- action based on inaccessible hidden truth
- narrator output containing forbidden facts
- unresolved ambiguity presented as certainty
- compressed history lacking significant causal links
- randomness without a recorded draw
- replay producing different canonical output under identical inputs
- relationships treated as automatically symmetrical
- observation treated as complete omniscience
- deleted entities removed from historical provenance

---

## 22. Minimal World Physics for Winter Medicine

The first vertical slice requires only a bounded implementation.

### Required entities

- player
- Mara
- Tomas
- Elian
- sick child
- cabin
- village
- medicine supply
- northern pass
- approaching threat

### Required primitives

- canonical entity state
- propositions
- events
- processes
- observations
- beliefs
- memories
- relationships
- goals
- information paths
- time
- provenance

### Required processes

- disease progression
- medicine depletion
- storm progression
- threat approach
- rumor transmission

### Required cognitive distinctions

- what Mara knows
- what Tomas believes
- what Elian remembers
- what the player has learned
- what each agent is willing to disclose

### Required research views

- canonical timeline
- observation timeline
- belief changes
- memory formation
- information propagation
- decision causes
- relationship changes
- relevance band transitions

---

## 23. Acceptance Tests

World Physics v0.1 is validated when the engine can demonstrate all of the following:

1. An unobserved event occurs and remains canonical.
2. Two agents observe different portions of the same event.
3. Two agents form different interpretations from similar observations.
4. An agent confidently believes a false proposition.
5. An agent revises a belief after receiving credible evidence.
6. An agent refuses to revise an identity-protective belief immediately.
7. A rumor changes as it passes through multiple people.
8. A character cannot use information they never acquired.
9. A character may conceal information they possess.
10. A memory loses detail without altering canonical history.
11. A recalled memory is influenced by current emotion.
12. A relationship changes directionally rather than symmetrically.
13. An action advances world time and background processes.
14. A distant process produces a local consequence later.
15. A compressed region can be rehydrated with causality intact.
16. The narrator omits facts unavailable to the player.
17. The narrator preserves uncertainty.
18. Every mutation can be traced to a rule and cause.
19. A replay with the same seed produces the same canonical state.
20. A counterfactual branch does not contaminate canonical play.

---

## 24. Architectural Guarantees

KEY World Physics guarantees:

1. Reality is not authored by prose.
2. Minds do not share omniscience.
3. Information moves through causal paths.
4. Beliefs may be wrong without corrupting truth.
5. Memories may be distorted without rewriting history.
6. Events remain explainable.
7. Time continues outside the player's attention.
8. Compression preserves consequential causes.
9. AI interprets and expresses but does not own truth.
10. The world can be inspected, replayed, and researched.

---

## 25. Summary Model

```text
REALITY
  Canonical entities, facts, events, processes, and time
        ↓
PERCEPTION
  Partial observation constrained by access and attention
        ↓
COGNITION
  Interpretation, belief, knowledge, memory, emotion, identity
        ↓
DECISION
  Goals and perceived possibilities produce selected actions
        ↓
CAUSAL CHANGE
  Validated rules commit new events and state mutations
        ↓
EXPRESSION
  AI narrates only approved, perceivable consequences
        ↓
REFLECTION
  Research tools expose provenance, causality, and mental-model evolution
```

The defining statement of KEY World Physics is:

> Canonical reality determines what happened. Perception determines what was available. Cognition determines what was understood. Agency determines what was attempted. Simulation determines what changed. Narration determines only how those consequences are expressed.
