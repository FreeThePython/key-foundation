import test from "node:test";
import assert from "node:assert/strict";

import {
  asSignedUnit,
  asUnitInterval,
  validateBelief,
  validateCanonicalMutation,
  validateEntity,
  validateMemory,
  type Belief,
  type CanonicalMutation,
  type Entity,
  type Memory,
  type WorldTimestamp,
} from "./primitives";

const timestamp: WorldTimestamp = {
  instant: "2041-01-01T00:00:00.000Z" as WorldTimestamp["instant"],
  tick: 1,
};
const provenance = {
  createdBy: "research_fixture" as const,
  sourceEventIds: [],
  sourceMutationIds: [],
  deterministicSeed: "winter-medicine-test-seed",
};

test("unit interval rejects values outside [0, 1]", () => {
  assert.equal(asUnitInterval(0.5), 0.5);
  assert.throws(() => asUnitInterval(1.01), RangeError);
  assert.throws(() => asUnitInterval(-0.01), RangeError);
});

test("signed unit rejects values outside [-1, 1]", () => {
  assert.equal(asSignedUnit(-0.75), -0.75);
  assert.throws(() => asSignedUnit(1.1), RangeError);
});

test("validates a canonical entity", () => {
  const entity: Entity = {
    id: "entity:mara" as Entity["id"],
    worldId: "world:winter-medicine" as Entity["worldId"],
    kind: "agent",
    canonicalName: "Mara",
    aliases: [],
    createdAt: timestamp,
    locationId: "location:cabin" as Entity["locationId"],
    tags: ["healer"],
    attributes: { conscious: true, fatigue: 0.7 },
    revision: 0,
    provenance,
  };

  const result = validateEntity(entity);
  assert.equal(result.valid, true);
  assert.equal(result.issues.length, 0);
});

test("rejects an entity without provenance", () => {
  const result = validateEntity({
    id: "entity:mara",
    worldId: "world:winter-medicine",
    kind: "agent",
    canonicalName: "Mara",
    aliases: [],
    createdAt: timestamp,
    tags: [],
    attributes: {},
    revision: 0,
  });

  assert.equal(result.valid, false);
  assert(result.issues.some((issue) => issue.code === "missing_provenance"));
});

test("belief confidence cannot exceed one", () => {
  const belief = {
    id: "belief:mara:elian-fever",
    worldId: "world:winter-medicine",
    ownerId: "entity:mara",
    propositionId: "proposition:elian-fever",
    confidence: 1.2,
    stance: "accepts",
    sources: [],
    evidenceFor: [],
    evidenceAgainst: [],
    emotionalWeight: 0,
    accessibility: 1,
    formedAt: timestamp,
    updatedAt: timestamp,
    revision: 0,
    provenance,
  };

  const result = validateBelief(belief);
  assert.equal(result.valid, false);
  assert(result.issues.some((issue) => issue.path === "$.confidence"));
});

test("validates belief ownership independently from canonical truth", () => {
  const belief: Belief = {
    id: "belief:tomas:mara-biased" as Belief["id"],
    worldId: "world:winter-medicine" as Belief["worldId"],
    ownerId: "entity:tomas" as Belief["ownerId"],
    propositionId: "proposition:mara-biased" as Belief["propositionId"],
    confidence: asUnitInterval(0.78),
    stance: "accepts",
    sources: [{ type: "testimony", speakerId: "entity:tomas" as Belief["ownerId"], eventId: "event:accusation" as never }],
    evidenceFor: ["Mara treated Elian first"],
    evidenceAgainst: [],
    emotionalWeight: asSignedUnit(0.65),
    accessibility: asUnitInterval(0.9),
    formedAt: timestamp,
    updatedAt: timestamp,
    revision: 0,
    provenance,
  };

  assert.equal(validateBelief(belief).valid, true);
});

test("validates a memory with bounded fidelity and decay", () => {
  const memory: Memory = {
    id: "memory:mara:blizzard-rescue" as Memory["id"],
    worldId: "world:winter-medicine" as Memory["worldId"],
    ownerId: "entity:mara" as Memory["ownerId"],
    kind: "episodic",
    encodedAt: timestamp,
    sourceEventIds: ["event:rescue" as Memory["sourceEventIds"][number]],
    sourceObservationIds: [],
    propositionIds: [],
    summary: "Elian carried Mara's brother through a blizzard.",
    salience: asUnitInterval(0.95),
    emotionalValence: asSignedUnit(0.8),
    confidence: asUnitInterval(0.9),
    fidelity: asUnitInterval(0.82),
    accessibility: asUnitInterval(0.7),
    decayRate: asUnitInterval(0.02),
    consolidationCount: 4,
    provenance,
  };

  assert.equal(validateMemory(memory).valid, true);
});

test("rejects canonical mutation without a causal event", () => {
  const mutation: CanonicalMutation = {
    id: "mutation:trust-loss" as CanonicalMutation["id"],
    worldId: "world:winter-medicine" as CanonicalMutation["worldId"],
    transactionId: "transaction:1" as CanonicalMutation["transactionId"],
    occurredAt: timestamp,
    operation: "patch",
    target: {
      recordType: "entity",
      recordId: "entity:mara",
      path: "/attributes/trust/player",
      expectedRevision: 2,
    },
    before: 0.5,
    after: 0.4,
    preconditionPropositionIds: [],
    causeEventIds: [],
    affectedEntityIds: ["entity:mara" as CanonicalMutation["affectedEntityIds"][number]],
    reversible: true,
    provenance,
  };

  const result = validateCanonicalMutation(mutation);
  assert.equal(result.valid, false);
  assert(result.issues.some((issue) => issue.code === "missing_cause"));
});

test("accepts a causally grounded canonical mutation", () => {
  const mutation: CanonicalMutation = {
    id: "mutation:trust-loss" as CanonicalMutation["id"],
    worldId: "world:winter-medicine" as CanonicalMutation["worldId"],
    transactionId: "transaction:1" as CanonicalMutation["transactionId"],
    occurredAt: timestamp,
    operation: "patch",
    target: {
      recordType: "entity",
      recordId: "entity:mara",
      path: "/attributes/trust/player",
      expectedRevision: 2,
    },
    before: 0.5,
    after: 0.4,
    preconditionPropositionIds: [],
    causeEventIds: ["event:player-accusation" as CanonicalMutation["causeEventIds"][number]],
    affectedEntityIds: ["entity:mara" as CanonicalMutation["affectedEntityIds"][number]],
    reversible: true,
    provenance,
  };

  assert.equal(validateCanonicalMutation(mutation).valid, true);
});
