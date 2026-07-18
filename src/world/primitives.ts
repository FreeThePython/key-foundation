/*
 * KEY World Primitives v0.1
 *
 * Dependency-free TypeScript contracts for canonical reality, perception,
 * cognition, memory, causality, and atomic world mutation.
 *
 * Design rule: language models may propose interpretations and expression,
 * but only validated CanonicalMutation objects may alter canonical state.
 */

export type Brand<T, Name extends string> = T & { readonly __brand: Name };

export type EntityId = Brand<string, "EntityId">;
export type PropositionId = Brand<string, "PropositionId">;
export type EventId = Brand<string, "EventId">;
export type ObservationId = Brand<string, "ObservationId">;
export type BeliefId = Brand<string, "BeliefId">;
export type MemoryId = Brand<string, "MemoryId">;
export type MutationId = Brand<string, "MutationId">;
export type WorldId = Brand<string, "WorldId">;
export type LocationId = Brand<string, "LocationId">;
export type ProcessId = Brand<string, "ProcessId">;
export type TransactionId = Brand<string, "TransactionId">;

export type ISODateTime = Brand<string, "ISODateTime">;
export type UnitInterval = Brand<number, "UnitInterval">;
export type SignedUnit = Brand<number, "SignedUnit">;
export type NonNegative = Brand<number, "NonNegative">;

export const asUnitInterval = (value: number): UnitInterval => {
  if (!Number.isFinite(value) || value < 0 || value > 1) {
    throw new RangeError(`Expected a finite number in [0, 1], received ${value}`);
  }
  return value as UnitInterval;
};

export const asSignedUnit = (value: number): SignedUnit => {
  if (!Number.isFinite(value) || value < -1 || value > 1) {
    throw new RangeError(`Expected a finite number in [-1, 1], received ${value}`);
  }
  return value as SignedUnit;
};

export const asNonNegative = (value: number): NonNegative => {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`Expected a finite non-negative number, received ${value}`);
  }
  return value as NonNegative;
};

export type EntityKind =
  | "agent"
  | "player"
  | "object"
  | "location"
  | "institution"
  | "group"
  | "resource"
  | "environmental_system"
  | "abstract_system";

export interface EntityRef {
  id: EntityId;
  kind?: EntityKind;
}

export interface WorldTimestamp {
  instant: ISODateTime;
  tick: number;
  calendarId?: string;
}

export interface Provenance {
  createdBy:
    | "genesis"
    | "simulation"
    | "validated_player_action"
    | "validated_agent_action"
    | "migration"
    | "research_fixture";
  sourceEventIds: EventId[];
  sourceMutationIds: MutationId[];
  transactionId?: TransactionId;
  ruleId?: string;
  deterministicSeed?: string;
  notes?: string;
}

export interface Entity {
  id: EntityId;
  worldId: WorldId;
  kind: EntityKind;
  canonicalName: string;
  aliases: string[];
  createdAt: WorldTimestamp;
  endedAt?: WorldTimestamp;
  locationId?: LocationId;
  parentEntityId?: EntityId;
  tags: string[];
  attributes: Readonly<Record<string, CanonicalValue>>;
  revision: number;
  provenance: Provenance;
}

export type CanonicalScalar = string | number | boolean | null;
export type CanonicalValue =
  | CanonicalScalar
  | EntityId
  | LocationId
  | readonly CanonicalValue[]
  | { readonly [key: string]: CanonicalValue };

export type PropositionPredicate =
  | "is"
  | "has"
  | "located_at"
  | "owns"
  | "knows"
  | "believes"
  | "caused"
  | "supports"
  | "opposes"
  | "owes"
  | "related_to"
  | "custom";

export interface Proposition {
  id: PropositionId;
  worldId: WorldId;
  subject: EntityRef;
  predicate: PropositionPredicate;
  customPredicate?: string;
  object: CanonicalValue;
  validFrom: WorldTimestamp;
  validUntil?: WorldTimestamp;
  canonicalStatus: "true" | "false" | "unknown" | "contested";
  confidence?: UnitInterval;
  supersedes?: PropositionId;
  provenance: Provenance;
}

export type EventKind =
  | "action"
  | "communication"
  | "movement"
  | "observation"
  | "discovery"
  | "relationship_change"
  | "resource_change"
  | "physical_change"
  | "institutional_change"
  | "process_transition"
  | "internal_cognitive_event"
  | "system";

export interface EventParticipant {
  entityId: EntityId;
  role: "actor" | "target" | "instrument" | "beneficiary" | "witness" | "affected";
}

export interface CausalLink {
  causeEventId: EventId;
  relation: "necessary" | "contributing" | "triggering" | "enabling" | "inhibiting";
  strength: UnitInterval;
}

export interface Event {
  id: EventId;
  worldId: WorldId;
  kind: EventKind;
  occurredAt: WorldTimestamp;
  endedAt?: WorldTimestamp;
  locationId?: LocationId;
  participants: EventParticipant[];
  causes: CausalLink[];
  preconditions: PropositionId[];
  producedMutationIds: MutationId[];
  descriptionCode: string;
  payload: Readonly<Record<string, CanonicalValue>>;
  provenance: Provenance;
}

export type SensoryModality =
  | "vision"
  | "hearing"
  | "touch"
  | "smell"
  | "taste"
  | "proprioception"
  | "interoception"
  | "instrument"
  | "testimony"
  | "document"
  | "inference";

export interface Observation {
  id: ObservationId;
  worldId: WorldId;
  observerId: EntityId;
  observedAt: WorldTimestamp;
  sourceEventId?: EventId;
  sourceEntityIds: EntityId[];
  modality: SensoryModality;
  rawFeatures: Readonly<Record<string, CanonicalValue>>;
  candidatePropositionIds: PropositionId[];
  perceptualConfidence: UnitInterval;
  attentionWeight: UnitInterval;
  distortionFactors: string[];
  privateToObserver: boolean;
  provenance: Provenance;
}

export type BeliefSource =
  | { type: "observation"; observationId: ObservationId }
  | { type: "testimony"; speakerId: EntityId; eventId: EventId }
  | { type: "memory"; memoryId: MemoryId }
  | { type: "inference"; premiseBeliefIds: BeliefId[]; ruleId: string }
  | { type: "cultural_prior"; institutionId?: EntityId; code: string }
  | { type: "instinct"; code: string };

export interface Belief {
  id: BeliefId;
  worldId: WorldId;
  ownerId: EntityId;
  propositionId: PropositionId;
  confidence: UnitInterval;
  stance: "accepts" | "rejects" | "suspends_judgment";
  sources: BeliefSource[];
  evidenceFor: string[];
  evidenceAgainst: string[];
  emotionalWeight: SignedUnit;
  accessibility: UnitInterval;
  formedAt: WorldTimestamp;
  updatedAt: WorldTimestamp;
  revision: number;
  provenance: Provenance;
}

export type MemoryKind =
  | "episodic"
  | "semantic"
  | "procedural"
  | "social"
  | "prospective"
  | "compressed_summary";

export interface Memory {
  id: MemoryId;
  worldId: WorldId;
  ownerId: EntityId;
  kind: MemoryKind;
  encodedAt: WorldTimestamp;
  lastRecalledAt?: WorldTimestamp;
  sourceEventIds: EventId[];
  sourceObservationIds: ObservationId[];
  propositionIds: PropositionId[];
  summary: string;
  salience: UnitInterval;
  emotionalValence: SignedUnit;
  confidence: UnitInterval;
  fidelity: UnitInterval;
  accessibility: UnitInterval;
  decayRate: UnitInterval;
  consolidationCount: number;
  supersededBy?: MemoryId;
  provenance: Provenance;
}

export type MutationOperation =
  | "create"
  | "replace"
  | "patch"
  | "end"
  | "append"
  | "remove";

export type CanonicalRecordType =
  | "entity"
  | "proposition"
  | "event"
  | "observation"
  | "belief"
  | "memory"
  | "process";

export interface MutationTarget {
  recordType: CanonicalRecordType;
  recordId: string;
  path?: string;
  expectedRevision?: number;
}

export interface CanonicalMutation {
  id: MutationId;
  worldId: WorldId;
  transactionId: TransactionId;
  occurredAt: WorldTimestamp;
  operation: MutationOperation;
  target: MutationTarget;
  before?: CanonicalValue;
  after?: CanonicalValue;
  preconditionPropositionIds: PropositionId[];
  causeEventIds: EventId[];
  affectedEntityIds: EntityId[];
  reversible: boolean;
  inverseMutation?: Omit<CanonicalMutation, "id" | "transactionId" | "inverseMutation">;
  provenance: Provenance;
}

export interface CanonicalTransaction {
  id: TransactionId;
  worldId: WorldId;
  startedAt: WorldTimestamp;
  committedAt?: WorldTimestamp;
  status: "proposed" | "validated" | "committed" | "rejected" | "rolled_back";
  mutations: CanonicalMutation[];
  causeEventIds: EventId[];
  validationErrors: ValidationIssue[];
  deterministicSeed: string;
}

export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
  severity: "error" | "warning";
}

export interface ValidationResult<T> {
  valid: boolean;
  value?: T;
  issues: ValidationIssue[];
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isString = (value: unknown): value is string => typeof value === "string";
const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);
const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isString);
const inUnitInterval = (value: unknown): value is UnitInterval =>
  isFiniteNumber(value) && value >= 0 && value <= 1;
const inSignedUnit = (value: unknown): value is SignedUnit =>
  isFiniteNumber(value) && value >= -1 && value <= 1;

const requiredString = (
  object: Record<string, unknown>,
  key: string,
  issues: ValidationIssue[],
  path = "$",
): void => {
  if (!isString(object[key]) || (object[key] as string).trim().length === 0) {
    issues.push({ code: "required_string", path: `${path}.${key}`, message: `${key} must be a non-empty string`, severity: "error" });
  }
};

const validateTimestamp = (value: unknown, path: string, issues: ValidationIssue[]): void => {
  if (!isRecord(value)) {
    issues.push({ code: "invalid_timestamp", path, message: "Expected a WorldTimestamp object", severity: "error" });
    return;
  }
  requiredString(value, "instant", issues, path);
  if (!Number.isInteger(value.tick) || (value.tick as number) < 0) {
    issues.push({ code: "invalid_tick", path: `${path}.tick`, message: "tick must be a non-negative integer", severity: "error" });
  }
};

export const validateEntity = (input: unknown): ValidationResult<Entity> => {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) return { valid: false, issues: [{ code: "invalid_entity", path: "$", message: "Expected an object", severity: "error" }] };
  for (const key of ["id", "worldId", "kind", "canonicalName"]) requiredString(input, key, issues);
  if (!isStringArray(input.aliases)) issues.push({ code: "invalid_aliases", path: "$.aliases", message: "aliases must be a string array", severity: "error" });
  if (!isStringArray(input.tags)) issues.push({ code: "invalid_tags", path: "$.tags", message: "tags must be a string array", severity: "error" });
  if (!Number.isInteger(input.revision) || (input.revision as number) < 0) issues.push({ code: "invalid_revision", path: "$.revision", message: "revision must be a non-negative integer", severity: "error" });
  validateTimestamp(input.createdAt, "$.createdAt", issues);
  if (!isRecord(input.attributes)) issues.push({ code: "invalid_attributes", path: "$.attributes", message: "attributes must be an object", severity: "error" });
  if (!isRecord(input.provenance)) issues.push({ code: "missing_provenance", path: "$.provenance", message: "Every entity requires provenance", severity: "error" });
  return { valid: issues.every((issue) => issue.severity !== "error"), value: issues.length === 0 ? input as unknown as Entity : undefined, issues };
};

export const validateProposition = (input: unknown): ValidationResult<Proposition> => {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) return { valid: false, issues: [{ code: "invalid_proposition", path: "$", message: "Expected an object", severity: "error" }] };
  for (const key of ["id", "worldId", "predicate", "canonicalStatus"]) requiredString(input, key, issues);
  if (!isRecord(input.subject)) issues.push({ code: "invalid_subject", path: "$.subject", message: "subject must be an EntityRef", severity: "error" });
  validateTimestamp(input.validFrom, "$.validFrom", issues);
  if (input.confidence !== undefined && !inUnitInterval(input.confidence)) issues.push({ code: "invalid_confidence", path: "$.confidence", message: "confidence must be in [0, 1]", severity: "error" });
  if (!isRecord(input.provenance)) issues.push({ code: "missing_provenance", path: "$.provenance", message: "Every proposition requires provenance", severity: "error" });
  return { valid: issues.every((issue) => issue.severity !== "error"), value: issues.length === 0 ? input as unknown as Proposition : undefined, issues };
};

export const validateEvent = (input: unknown): ValidationResult<Event> => {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) return { valid: false, issues: [{ code: "invalid_event", path: "$", message: "Expected an object", severity: "error" }] };
  for (const key of ["id", "worldId", "kind", "descriptionCode"]) requiredString(input, key, issues);
  validateTimestamp(input.occurredAt, "$.occurredAt", issues);
  if (!Array.isArray(input.participants)) issues.push({ code: "invalid_participants", path: "$.participants", message: "participants must be an array", severity: "error" });
  if (!Array.isArray(input.causes)) issues.push({ code: "invalid_causes", path: "$.causes", message: "causes must be an array", severity: "error" });
  if (!Array.isArray(input.producedMutationIds)) issues.push({ code: "invalid_mutations", path: "$.producedMutationIds", message: "producedMutationIds must be an array", severity: "error" });
  if (!isRecord(input.provenance)) issues.push({ code: "missing_provenance", path: "$.provenance", message: "Every event requires provenance", severity: "error" });
  return { valid: issues.every((issue) => issue.severity !== "error"), value: issues.length === 0 ? input as unknown as Event : undefined, issues };
};

export const validateObservation = (input: unknown): ValidationResult<Observation> => {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) return { valid: false, issues: [{ code: "invalid_observation", path: "$", message: "Expected an object", severity: "error" }] };
  for (const key of ["id", "worldId", "observerId", "modality"]) requiredString(input, key, issues);
  validateTimestamp(input.observedAt, "$.observedAt", issues);
  if (!inUnitInterval(input.perceptualConfidence)) issues.push({ code: "invalid_confidence", path: "$.perceptualConfidence", message: "perceptualConfidence must be in [0, 1]", severity: "error" });
  if (!inUnitInterval(input.attentionWeight)) issues.push({ code: "invalid_attention", path: "$.attentionWeight", message: "attentionWeight must be in [0, 1]", severity: "error" });
  if (!isRecord(input.rawFeatures)) issues.push({ code: "invalid_features", path: "$.rawFeatures", message: "rawFeatures must be an object", severity: "error" });
  return { valid: issues.every((issue) => issue.severity !== "error"), value: issues.length === 0 ? input as unknown as Observation : undefined, issues };
};

export const validateBelief = (input: unknown): ValidationResult<Belief> => {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) return { valid: false, issues: [{ code: "invalid_belief", path: "$", message: "Expected an object", severity: "error" }] };
  for (const key of ["id", "worldId", "ownerId", "propositionId", "stance"]) requiredString(input, key, issues);
  if (!inUnitInterval(input.confidence)) issues.push({ code: "invalid_confidence", path: "$.confidence", message: "confidence must be in [0, 1]", severity: "error" });
  if (!inSignedUnit(input.emotionalWeight)) issues.push({ code: "invalid_emotional_weight", path: "$.emotionalWeight", message: "emotionalWeight must be in [-1, 1]", severity: "error" });
  if (!inUnitInterval(input.accessibility)) issues.push({ code: "invalid_accessibility", path: "$.accessibility", message: "accessibility must be in [0, 1]", severity: "error" });
  validateTimestamp(input.formedAt, "$.formedAt", issues);
  validateTimestamp(input.updatedAt, "$.updatedAt", issues);
  return { valid: issues.every((issue) => issue.severity !== "error"), value: issues.length === 0 ? input as unknown as Belief : undefined, issues };
};

export const validateMemory = (input: unknown): ValidationResult<Memory> => {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) return { valid: false, issues: [{ code: "invalid_memory", path: "$", message: "Expected an object", severity: "error" }] };
  for (const key of ["id", "worldId", "ownerId", "kind", "summary"]) requiredString(input, key, issues);
  validateTimestamp(input.encodedAt, "$.encodedAt", issues);
  for (const key of ["salience", "confidence", "fidelity", "accessibility", "decayRate"]) {
    if (!inUnitInterval(input[key])) issues.push({ code: `invalid_${key}`, path: `$.${key}`, message: `${key} must be in [0, 1]`, severity: "error" });
  }
  if (!inSignedUnit(input.emotionalValence)) issues.push({ code: "invalid_emotional_valence", path: "$.emotionalValence", message: "emotionalValence must be in [-1, 1]", severity: "error" });
  if (!Number.isInteger(input.consolidationCount) || (input.consolidationCount as number) < 0) issues.push({ code: "invalid_consolidation_count", path: "$.consolidationCount", message: "consolidationCount must be a non-negative integer", severity: "error" });
  return { valid: issues.every((issue) => issue.severity !== "error"), value: issues.length === 0 ? input as unknown as Memory : undefined, issues };
};

export const validateCanonicalMutation = (input: unknown): ValidationResult<CanonicalMutation> => {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) return { valid: false, issues: [{ code: "invalid_mutation", path: "$", message: "Expected an object", severity: "error" }] };
  for (const key of ["id", "worldId", "transactionId", "operation"]) requiredString(input, key, issues);
  validateTimestamp(input.occurredAt, "$.occurredAt", issues);
  if (!isRecord(input.target)) issues.push({ code: "invalid_target", path: "$.target", message: "target must identify a canonical record", severity: "error" });
  if (!Array.isArray(input.causeEventIds) || input.causeEventIds.length === 0) issues.push({ code: "missing_cause", path: "$.causeEventIds", message: "Canonical mutations require at least one cause event", severity: "error" });
  if (!Array.isArray(input.affectedEntityIds)) issues.push({ code: "invalid_affected_entities", path: "$.affectedEntityIds", message: "affectedEntityIds must be an array", severity: "error" });
  if (!isRecord(input.provenance)) issues.push({ code: "missing_provenance", path: "$.provenance", message: "Every mutation requires provenance", severity: "error" });
  if (input.operation === "create" && input.after === undefined) issues.push({ code: "missing_after", path: "$.after", message: "create mutations require an after value", severity: "error" });
  if (["replace", "patch", "end", "remove"].includes(String(input.operation)) && input.before === undefined) issues.push({ code: "missing_before", path: "$.before", message: `${String(input.operation)} mutations require a before value`, severity: "error" });
  return { valid: issues.every((issue) => issue.severity !== "error"), value: issues.length === 0 ? input as unknown as CanonicalMutation : undefined, issues };
};

export const validateCanonicalTransaction = (input: unknown): ValidationResult<CanonicalTransaction> => {
  const issues: ValidationIssue[] = [];
  if (!isRecord(input)) return { valid: false, issues: [{ code: "invalid_transaction", path: "$", message: "Expected an object", severity: "error" }] };
  for (const key of ["id", "worldId", "status", "deterministicSeed"]) requiredString(input, key, issues);
  validateTimestamp(input.startedAt, "$.startedAt", issues);
  if (!Array.isArray(input.mutations) || input.mutations.length === 0) {
    issues.push({ code: "empty_transaction", path: "$.mutations", message: "A canonical transaction requires at least one mutation", severity: "error" });
  } else {
    input.mutations.forEach((mutation, index) => {
      for (const issue of validateCanonicalMutation(mutation).issues) {
        issues.push({ ...issue, path: `$.mutations[${index}]${issue.path === "$" ? "" : issue.path.slice(1)}` });
      }
    });
  }
  return { valid: issues.every((issue) => issue.severity !== "error"), value: issues.length === 0 ? input as unknown as CanonicalTransaction : undefined, issues };
};

export const assertValid = <T>(result: ValidationResult<T>): T => {
  if (!result.valid || result.value === undefined) {
    const message = result.issues.map((issue) => `${issue.path}: ${issue.message}`).join("; ");
    throw new TypeError(message || "Validation failed");
  }
  return result.value;
};

export const WORLD_PRIMITIVES_VERSION = "0.1.0" as const;
