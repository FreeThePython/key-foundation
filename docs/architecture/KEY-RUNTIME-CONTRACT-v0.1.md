# KEY Runtime Contract v0.1

**Status:** Foundational draft  
**System:** KEY Cognitive World Model (KCWM)  
**Primary orchestrator:** Causal Relevance Manager (CRM)  
**Initial implementation target:** Experiment 0001, *Winter Medicine*  

---

## 1. Purpose

This document defines the authoritative runtime path between a player's natural-language input and KEY's response.

It establishes what each subsystem may read, decide, change, and return. Its purpose is to prevent the language model, simulation, memory system, and cognitive-agent layer from silently assuming one another's responsibilities.

The contract is designed around one core rule:

> **AI may interpret and express reality. Only the simulation may authorize changes to canonical reality.**

The first implementation may use simplified or deterministic components, but all implementations must preserve the boundaries defined here.

---

## 2. Normative language

The words **MUST**, **MUST NOT**, **SHOULD**, **SHOULD NOT**, and **MAY** are used as architectural requirements.

- **MUST** means required for compliance.
- **MUST NOT** means prohibited.
- **SHOULD** means expected unless a documented reason exists.
- **MAY** means optional.

---

## 3. Runtime principles

1. **Canonical truth is singular.**  
   The Canonical State Store is the authoritative record of what exists and what has occurred.

2. **Belief is not truth.**  
   Every belief, claim, memory, rumor, and interpretation belongs to an observer or source.

3. **Every mutation has provenance.**  
   No canonical change may occur without an event record identifying its causes, actor, time, and effects.

4. **The world continues.**  
   Time and scheduled processes advance independently of player attention.

5. **Resolution follows causal relevance.**  
   The CRM allocates detail, memory, and compute according to current relevance rather than physical distance alone.

6. **Narration is downstream.**  
   Narrative output describes an approved result. It does not create the result.

7. **Uncertainty is preserved.**  
   The system must not convert uncertain evidence into objective fact merely to produce a cleaner response.

8. **The runtime is inspectable.**  
   Every stage must emit trace data sufficient to explain how the final response was produced.

---

## 4. Runtime topology

```text
Player text or speech
        ↓
1. Input Gateway
        ↓
2. Intent Interpreter
        ↓
3. Intent Normalizer and Action Planner
        ↓
4. Causal Relevance Manager
        ↓
5. Context Packet Builder
        ↓
6. Possibility and Policy Validator
        ↓
7. Simulation Resolver
        ↓
8. Cognitive Agent Resolver
        ↓
9. Canonical Commit
        ↓
10. Narrative Renderer
        ↓
11. Memory Consolidation and Compression
        ↓
12. Research and Observability Log
        ↓
Player experience
```

A stage may reject, clarify, split, defer, or partially resolve an input. A stage may not bypass a downstream authority.

---

## 5. Core runtime objects

All objects must include a schema version.

### 5.1 Runtime envelope

Every runtime request is wrapped in a shared envelope.

```ts
interface RuntimeEnvelope<T> {
  schemaVersion: "0.1";
  runId: string;
  turnId: string;
  worldId: string;
  branchId: string;
  simulationTime: string;
  playerAgentId: string;
  payload: T;
  trace: TraceReference[];
}
```

### 5.2 Trace reference

```ts
interface TraceReference {
  stage: RuntimeStage;
  artifactId: string;
  createdAt: string;
}
```

### 5.3 Runtime stages

```ts
type RuntimeStage =
  | "INPUT"
  | "INTERPRETATION"
  | "PLANNING"
  | "RELEVANCE"
  | "CONTEXT"
  | "VALIDATION"
  | "SIMULATION"
  | "COGNITION"
  | "COMMIT"
  | "NARRATION"
  | "MEMORY"
  | "RESEARCH";
```

---

## 6. Stage 1: Input Gateway

### Responsibility

Receive player text or transcribed speech without assigning world consequences.

### Input

```ts
interface PlayerInput {
  modality: "TEXT" | "VOICE";
  rawContent: string;
  clientTimestamp: string;
  language?: string;
  channel?: "DIRECT" | "WHISPER" | "PUBLIC" | "SYSTEM";
}
```

### Output

```ts
interface AcceptedInput {
  normalizedText: string;
  detectedLanguage: string;
  inputSafetyState: "ACCEPTED" | "REJECTED" | "REQUIRES_REVIEW";
  transcriptionConfidence?: number;
}
```

### Rules

- The gateway MUST preserve the original input verbatim.
- It MUST NOT infer canonical facts.
- It MAY normalize punctuation, transcription artifacts, and encoding.
- Voice transcription confidence MUST remain available to later stages.

---

## 7. Stage 2: Intent Interpreter

### Responsibility

Translate natural language into one or more proposed intents.

It answers:

> What is the player apparently trying to do or communicate?

It does not answer:

> What happens as a result?

### Output

```ts
interface InterpretedTurn {
  intents: ProposedIntent[];
  discourseActs: DiscourseAct[];
  unresolvedReferences: ReferenceGap[];
  overallConfidence: number;
}
```

```ts
interface ProposedIntent {
  intentId: string;
  actionType: string;
  actorId: string;
  targetRefs: EntityReference[];
  topicRefs: TopicReference[];
  requestedManner?: {
    tone?: string;
    volume?: string;
    privacy?: string;
    speed?: string;
    force?: string;
  };
  requestedMovement?: MovementRequest;
  conditions?: ProposedCondition[];
  sequenceHint?: number;
  confidence: number;
  evidenceSpans: TextSpan[];
}
```

### Rules

- The interpreter MUST return proposals, never mutations.
- It MUST preserve ambiguity instead of inventing a missing referent.
- It MUST identify compound actions when present.
- It SHOULD distinguish literal action from rhetoric, sarcasm, speculation, and hypothetical language.
- It MUST NOT decide whether a claim made by the player is true.
- It MUST expose confidence and supporting text spans.

### Example

Player input:

> I tell Tomas that threatening the village makes me less likely to help him, then I ask Elian exactly what he saw on the pass.

The interpreter should produce at least two ordered intents:

1. `SPEAK_TO` Tomas, communicating disapproval and a conditional social consequence.
2. `ASK` Elian about observations at the pass.

---

## 8. Stage 3: Intent Normalizer and Action Planner

### Responsibility

Convert proposed intents into engine-recognized action plans.

### Output

```ts
interface ActionPlan {
  planId: string;
  atomicActions: AtomicAction[];
  ordering: "SEQUENTIAL" | "PARALLEL" | "CONDITIONAL";
  clarificationRequired: boolean;
  clarificationQuestion?: string;
  interpretationConfidence: number;
}
```

```ts
interface AtomicAction {
  actionId: string;
  verb: string;
  actorId: string;
  targetIds: string[];
  parameters: Record<string, unknown>;
  requestedPreconditions: ProposedCondition[];
  sourceIntentId: string;
}
```

### Rules

- The planner MUST use a registered action vocabulary.
- It MAY split one intent into movement, speech, observation, and manipulation actions.
- It MUST request clarification when ambiguity materially changes possible outcomes.
- It SHOULD continue without clarification when ambiguity can remain safely unresolved and represented as alternatives.
- It MUST NOT silently reinterpret an impossible action into a different convenient action.

---

## 9. Stage 4: Causal Relevance Manager

### Responsibility

Determine what state, memories, agents, processes, and spatial structures require attention for this turn.

The CRM does not define truth. It decides how much of truth must be resolved now.

### Inputs

- Action plan
- Current focus state
- Player attention model
- Active and scheduled world processes
- Causal dependencies
- Memory and compute budgets

### Output

```ts
interface RelevancePlan {
  focusOrigin: FocusOrigin;
  entities: RelevanceAssignment[];
  processes: RelevanceAssignment[];
  memoriesRequested: MemoryQuery[];
  spatialScopes: SpatialScopeRequest[];
  contextBudget: ContextBudget;
  backgroundUpdatesDue: string[];
}
```

```ts
interface RelevanceAssignment {
  id: string;
  score: number;
  band: 1 | 2 | 3 | 4 | 5;
  reasons: RelevanceReason[];
  requiredResolution: "FULL" | "HIGH" | "MEDIUM" | "LOW" | "AGGREGATE";
  expiresAfterTurn?: boolean;
}
```

### Baseline relevance factors

```text
Relevance =
  immediate danger
+ player attention
+ causal proximity
+ social connection
+ information value
+ temporal urgency
+ emotional significance
+ historical dependency
- computational cost
```

The initial prototype may use weighted rules. Future versions may learn weights, but learned relevance MUST remain inspectable.

### Rules

- Physical proximity MUST NOT be the sole relevance factor.
- A distant process may be promoted if it has strong causal or temporal relevance.
- An adjacent entity may remain at lower resolution if it has no meaningful role in the current action.
- Promotion or demotion MUST be logged.
- The CRM MUST never discard an unresolved causal dependency.

---

## 10. Stage 5: Context Packet Builder

### Responsibility

Construct the smallest sufficient context for validation, simulation, cognition, and narration.

### Output

```ts
interface RuntimeContextPacket {
  packetId: string;
  canonicalSnapshotRef: string;
  sceneState: SceneState;
  activeEntities: EntityContext[];
  activeProcesses: ProcessContext[];
  retrievedMemories: RetrievedMemory[];
  knowledgeBoundaries: KnowledgeBoundary[];
  applicableRules: RuleReference[];
  uncertaintyRegister: UncertaintyRecord[];
  tokenBudget?: number;
  computeBudgetMs?: number;
}
```

### Rules

- The packet MUST distinguish canonical facts from beliefs, memories, claims, and rumors.
- It MUST identify the owner and source of subjective information.
- It MUST include only context justified by the relevance plan.
- It MUST include enough spatial, social, and temporal context to validate the proposed actions.
- It MUST preserve uncertainty and conflicting accounts.
- An AI-facing context packet SHOULD be narrower than the full engine packet.

---

## 11. Stage 6: Possibility and Policy Validator

### Responsibility

Determine what portions of the action plan are physically, socially, institutionally, and systemically possible.

### Output

```ts
interface ValidationResult {
  planId: string;
  status: "VALID" | "PARTIAL" | "INVALID" | "CLARIFICATION_REQUIRED";
  actionResults: ActionValidation[];
  requiredCosts: ActionCost[];
  witnessesLikely: WitnessEstimate[];
  constraintsApplied: ConstraintReference[];
}
```

```ts
interface ActionValidation {
  actionId: string;
  executable: boolean;
  executableForm?: AtomicAction;
  failureReasons: string[];
  partialConditions?: string[];
  uncertainty?: number;
}
```

### Validation domains

- Physical possibility
- Spatial reachability
- Available time
- Resource ownership and availability
- Agent consent or resistance
- Social rules and institutional authority
- Player capabilities
- Ongoing hazards
- Knowledge prerequisites
- Safety and product policies

### Rules

- Validation MUST occur before canonical mutation.
- A partial result MUST identify which requested aspects failed.
- The validator MAY estimate likely witnesses, but actual perception is resolved during simulation.
- The validator MUST NOT guarantee outcomes that depend on another agent's choice.

---

## 12. Stage 7: Simulation Resolver

### Responsibility

Resolve validated actions and due background processes against canonical reality.

### Output

```ts
interface SimulationProposal {
  transactionId: string;
  resolvedActions: ResolvedAction[];
  proposedEvents: ProposedEvent[];
  proposedMutations: StateMutation[];
  perceptionCandidates: PerceptionCandidate[];
  timeAdvance: TimeAdvance;
  randomDraws: RandomDrawRecord[];
  invariantChecks: InvariantCheck[];
}
```

### Rules

- The simulation MUST be authoritative for physical, temporal, resource, and causal resolution.
- It MUST use a seeded deterministic random source when randomness is required.
- All random draws MUST be recorded.
- The same world state, seed, and ordered actions MUST reproduce the same canonical resolution.
- Background processes due within the resolved interval MUST be considered.
- The resolver MUST NOT generate dialogue prose.
- Proposed mutations are not canonical until Stage 9 commits them.

---

## 13. Stage 8: Cognitive Agent Resolver

### Responsibility

Resolve perception, interpretation, decision, disclosure, and response intent for affected cognitive agents.

### Agent context

Each active cognitive agent may include:

- identity
- current perceptions
- knowledge
- beliefs and confidence
- memories
- values
- goals
- fears
- relationships
- obligations
- emotional state
- active plans
- communication style
- deception and disclosure policies

### Output

```ts
interface CognitiveResolution {
  agentUpdates: AgentStateMutation[];
  perceivedEvents: AgentPerception[];
  beliefUpdates: BeliefMutation[];
  memoryCandidates: MemoryCandidate[];
  chosenResponses: AgentResponseIntent[];
  autonomousActions: ProposedEvent[];
}
```

```ts
interface AgentResponseIntent {
  agentId: string;
  responseType: "SPEAK" | "ACT" | "WITHHOLD" | "DECEIVE" | "IGNORE" | "DEFER";
  addresseeIds: string[];
  communicableContent: InformationUnit[];
  prohibitedContent: InformationBoundary[];
  emotionalExpression: string[];
  socialGoal?: string;
  confidence: number;
}
```

### Rules

- An agent MUST NOT access canonical facts it has not perceived, learned, inferred, or been configured to know.
- An agent MAY be wrong.
- An agent MAY lie only if its cognitive state and policies permit deception.
- A generated response MUST remain inside the supplied communicable-content boundary.
- The cognition layer MUST distinguish what an agent knows from what it believes.
- Belief updates MUST record evidence and confidence change.

---

## 14. Stage 9: Canonical Commit

### Responsibility

Atomically validate and write approved events and mutations to canonical state.

### Output

```ts
interface CommitResult {
  transactionId: string;
  committed: boolean;
  canonicalVersionBefore: string;
  canonicalVersionAfter?: string;
  committedEventIds: string[];
  rejectedMutations: RejectedMutation[];
  invariantResults: InvariantCheck[];
}
```

### Rules

- The commit MUST be atomic.
- All canonical mutations MUST reference one or more causal events.
- Events MUST be immutable after commit. Corrections occur through new events.
- A failed invariant check MUST reject the transaction.
- Narration MUST NOT begin from uncommitted state.
- The store MUST support replay by event sequence.

---

## 15. Event and provenance minimum

Every committed event MUST contain:

```ts
interface CanonicalEvent {
  eventId: string;
  worldId: string;
  branchId: string;
  simulationTime: string;
  eventType: string;
  actorIds: string[];
  targetIds: string[];
  locationIds: string[];
  causes: CausalReference[];
  enablingConditions: string[];
  mutations: StateMutation[];
  observerCandidates: string[];
  randomDrawRefs: string[];
  sourceTurnId?: string;
  significance: number;
  resolutionBand: 1 | 2 | 3 | 4 | 5;
}
```

Each event must answer:

- What happened?
- When and where did it happen?
- Who or what caused it?
- What conditions enabled it?
- What changed?
- Who could have perceived it?
- What future processes depend on it?

---

## 16. Stage 10: Narrative Renderer

### Responsibility

Transform committed state and approved response intents into player-facing language.

### Input boundary

The renderer receives:

- committed event results
- player-perceivable details
- approved agent-response intents
- style and sensory settings
- uncertainty boundaries
- prohibited information boundaries

### Output

```ts
interface ExperienceOutput {
  narration: string;
  dialogueSegments: DialogueSegment[];
  perceivedChanges: PerceivedChange[];
  interactionAffordances?: SuggestedAffordance[];
  rendererTrace: RendererTrace;
}
```

### Rules

- The renderer MUST describe only committed or explicitly perceived state.
- It MUST NOT reveal hidden canonical information.
- It MUST NOT convert agent belief into omniscient narration.
- It MUST NOT add new objects, relationships, history, injuries, promises, or outcomes.
- It MAY choose wording, pacing, imagery, and voice.
- If the rendering model attempts to introduce unsupported facts, the output MUST be rejected or repaired before delivery.

### Rendering principle

> The renderer owns expression, not reality.

---

## 17. Stage 11: Memory Consolidation and Compression

### Responsibility

Create durable memories, update indexes, and reduce inactive detail without destroying causality.

### Output

```ts
interface MemoryResult {
  createdMemories: MemoryRecord[];
  updatedMemories: MemoryRecord[];
  compressedRecords: CompressionRecord[];
  retrievalIndexUpdates: IndexMutation[];
  promotedDependencies: string[];
}
```

### Required memory distinctions

- Episodic memory: experienced events
- Semantic knowledge: accepted information
- Belief memory: interpreted claims and confidence
- Relational memory: promises, betrayals, gratitude, suspicion
- Procedural memory: learned methods or routines
- Historical summary: compressed causal record

### Compression rule

Compression MAY remove low-value sensory detail, but MUST retain:

- what changed
- why it changed
- who caused it
- who observed it
- who learned of it
- confidence and uncertainty
- unresolved obligations
- future dependencies
- links to the source events

### Rules

- Memory creation MUST follow perception and cognition, not global omniscience.
- Compression MUST be reversible to source events when source retention policy permits.
- Important causal links MUST survive demotion to outer resolution bands.
- Agent memory and canonical history MUST remain separate.

---

## 18. Stage 12: Research and Observability Log

### Responsibility

Record the complete runtime trace without exposing protected state during Player Mode.

### Required trace artifacts

For every turn, KEY records:

1. Original player input
2. Interpreter output and confidence
3. Action plan
4. Relevance scoring and band movements
5. Retrieved context and memory identifiers
6. Validation decisions
7. Simulation resolution
8. Cognitive-agent updates
9. Canonical commit
10. Narrative constraints and final output
11. Memory consolidation
12. Latency, token, and compute measurements

### Output

```ts
interface TurnResearchRecord {
  turnId: string;
  artifacts: TraceReference[];
  latencyByStageMs: Record<RuntimeStage, number>;
  tokenUsageByStage?: Record<string, number>;
  memoryReads: number;
  memoryWrites: number;
  entitiesPromoted: string[];
  entitiesDemoted: string[];
  invariantViolations: string[];
}
```

### Rules

- Research data MUST be available after the experiment according to study policy.
- Hidden state MUST remain sealed during Player Mode.
- The trace MUST be sufficient to distinguish failures in interpretation, retrieval, validation, simulation, cognition, and narration.

---

## 19. Clarification and failure behavior

KEY must fail visibly and locally rather than inventing a convenient interpretation.

### Clarification is required when

- multiple targets are equally plausible and outcomes differ materially
- a reference has no resolvable entity
- requested sequencing is essential but unclear
- transcription confidence is too low for a consequential action
- the interpreter cannot map the request to an action family

### Clarification should not be required when

- uncertainty can be preserved in the action
- a partial action can proceed without violating intent
- ordinary descriptive language does not change mechanics

### Runtime failure classes

```ts
type RuntimeFailure =
  | "INTERPRETATION_FAILURE"
  | "REFERENCE_FAILURE"
  | "CONTEXT_FAILURE"
  | "VALIDATION_FAILURE"
  | "SIMULATION_CONFLICT"
  | "COGNITIVE_BOUNDARY_FAILURE"
  | "COMMIT_CONFLICT"
  | "NARRATIVE_GROUNDING_FAILURE"
  | "MEMORY_FAILURE";
```

A failure MUST be logged with its stage, cause, recoverability, and user-facing effect.

---

## 20. Concurrency and atomicity

World processes and multiple agents may act during the same simulation interval.

The runtime MUST:

- assign deterministic ordering or explicit simultaneity
- detect conflicting mutations
- preserve event causality
- retry from a stable canonical version when safe
- reject conflicting commits that cannot be deterministically merged

Player turns are not assumed to pause the world.

---

## 21. Performance budgets

Exact budgets will be established through profiling. Version 0.1 defines measurement requirements rather than final limits.

Every turn MUST measure:

- total response latency
- latency by runtime stage
- entities evaluated
- entities promoted or demoted
- memory records scanned and returned
- canonical reads and writes
- background processes resolved
- interpreter and narrator token usage
- context packet size
- cache hits and misses

### Initial design targets

- Ordinary conversational turn: perceived response should begin within a few seconds.
- Canonical commit must complete before grounded narration is delivered.
- The amount of fully resolved state should remain bounded as total world size increases.
- Outer-band simulation cost should grow sublinearly relative to total entity count.

These are targets, not yet validated guarantees.

---

## 22. Security boundaries between AI and canonical state

AI components MUST NOT receive unrestricted write access to canonical storage.

Approved pattern:

```text
AI output
   ↓
Schema validation
   ↓
Policy validation
   ↓
Simulation authorization
   ↓
Atomic canonical commit
```

Prohibited pattern:

```text
AI prose or tool call
   ↓
Direct database mutation
```

All AI-generated structured outputs MUST be treated as untrusted proposals until validated.

---

## 23. End-to-end example

### Player input

> I pull Mara aside and quietly ask whether she is protecting Elian because she owes him.

### Interpretation

```json
{
  "intents": [
    {
      "actionType": "MOVE_WITH_TARGET",
      "targetRefs": ["mara"],
      "requestedManner": { "privacy": "private", "volume": "quiet" }
    },
    {
      "actionType": "ASK",
      "targetRefs": ["mara"],
      "topicRefs": ["possible_bias_toward_elian", "personal_obligation_to_elian"],
      "requestedManner": { "tone": "skeptical", "volume": "quiet" }
    }
  ]
}
```

### CRM relevance plan

Promote:

- player
- Mara
- Tomas, due to possible overhearing and suspicion
- Elian, due to the subject of the question
- room acoustics
- storm noise
- Mara's relevant memories and obligations
- Tomas's current attention
- both patients' health processes

### Validation

- Moving Mara fully out of hearing range is not possible without leaving the room.
- A quieter side conversation is possible.
- Tomas may still hear fragments.
- Estimated time cost: three minutes.

### Simulation

- Player and Mara reposition.
- Time advances.
- Tomas notices the private movement.
- Storm noise masks portions of the conversation.
- Patient health processes advance.

### Cognition

- Mara perceives an accusation of bias.
- Her defensiveness increases.
- She chooses to reveal that Elian once saved her brother.
- She continues to claim that her medical judgment is impartial.
- Tomas hears enough to increase his suspicion but not the complete disclosure.

### Canonical commit

Commit:

- movement
- elapsed time
- perceptions
- relationship changes
- disclosed information
- new memories
- Tomas's partial observation

### Narrative

> Mara lets you guide her a few steps toward the stove, though there is nowhere in the cramped clinic truly beyond Tomas's hearing. Wind drives snow against the shutters.
>
> At your question, her jaw tightens. “Elian carried my brother through a blizzard years ago. I have not forgotten it. But gratitude does not put fever in his blood or darkness in that wound.”
>
> Across the room, Tomas has stopped speaking. He cannot have heard every word, but he is watching both of you now.

The prose is not canonical authority. It is a grounded expression of the committed result.

---

## 24. Winter Medicine v0.1 implementation scope

The first runtime implementation should support:

### Action families

- observe
- inspect
- move
- ask
- tell
- accuse
- promise
- request
- wait
- leave
- give or withhold the medicine

### Required cognitive behavior

- knowledge boundaries
- belief confidence
- trust and suspicion changes
- selective disclosure
- partial overhearing
- memory creation
- autonomous action under time pressure

### Required CRM behavior

- five resolution bands represented in state
- promotion of relevant entities and processes
- background patient decline
- regional threat represented at aggregate resolution
- retrieval of only action-relevant memories
- post-scene compression

### Required research output

- full turn trace
- relevance-band movement
- context packet contents
- canonical event ledger
- player knowledge timeline
- agent knowledge and belief comparison
- stage latency and context-size metrics

---

## 25. Acceptance tests

The runtime contract is minimally implemented when all tests below pass.

### Interpretation

1. A compound natural-language request becomes multiple ordered actions.
2. Ambiguous consequential references request clarification.
3. Player claims remain claims rather than becoming canonical facts.

### Relevance and context

4. A distant but urgent threat is promoted over an irrelevant nearby entity.
5. Only relevant memories are retrieved for an agent response.
6. Promotion and demotion decisions appear in the research trace.

### Validation and simulation

7. Impossible privacy requests resolve as partial rather than silently succeeding.
8. Time advances according to action cost.
9. Due background processes execute during the same interval.
10. The same initial state, seed, and action sequence reproduce the same canonical outcome.

### Cognition

11. Agents cannot disclose facts they do not know.
12. Two agents may form different beliefs from the same event.
13. Partial witnesses acquire partial information.
14. Deception, when permitted, changes the listener's belief without changing canonical truth.

### Commit and narration

15. No mutation exists without a causal event.
16. Failed invariants reject the entire transaction.
17. Narration cannot reveal hidden state.
18. Unsupported narrator details are rejected or repaired.

### Memory and continuity

19. A significant promise remains retrievable after the scene is compressed.
20. An inactive location can be rehydrated with its important causal state intact.
21. Background change occurs while the player is absent.

### Research

22. A completed turn can be reconstructed stage by stage.
23. The system can identify whether a bad response originated in interpretation, retrieval, simulation, cognition, or narration.

---

## 26. Non-goals for v0.1

This contract does not yet define:

- full procedural cosmology generation
- unrestricted action ontology
- millions of concurrently detailed agents
- final relevance weights
- final database technology
- final language-model provider
- voice synthesis or character animation
- multiplayer conflict resolution
- learned cognitive psychology models

Those decisions must remain replaceable behind the interfaces defined here.

---

## 27. Architectural invariants

The following invariants apply to every compliant implementation:

1. AI cannot directly mutate canonical reality.
2. Every canonical mutation has provenance.
3. Every subjective state has an owner.
4. Agents cannot use information outside their cognitive boundary.
5. Narration cannot precede canonical commit.
6. Compression cannot erase unresolved causal dependencies.
7. World time does not depend on player observation.
8. Relevance controls resolution, not existence.
9. Hidden state remains hidden in Player Mode.
10. Every turn remains inspectable in Research Mode.

---

## 28. Next documents

This contract intentionally references schemas that require dedicated specifications:

1. **KEY Canonical State Schema v0.1**
2. **KEY Cognitive Agent Schema v0.1**
3. **KEY Causal Relevance Manager Specification v0.1**
4. **KEY Event and Provenance Schema v0.1**
5. **KEY Memory and Compression Specification v0.1**
6. **KEY AI Grounding and Narrative Boundary Specification v0.1**

The next implementation task is to create TypeScript interfaces for the runtime envelope, interpreted intents, action plans, relevance plans, context packets, validation results, simulation proposals, cognitive resolutions, commit results, and research traces.

---

## 29. Foundational statement

> **KEY does not ask an AI to invent what happens next. KEY asks AI to understand the human, resolves reality through a causally governed world model, and then asks AI to express what actually occurred.**
