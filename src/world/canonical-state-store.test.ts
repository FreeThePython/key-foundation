import test from "node:test";
import assert from "node:assert/strict";

import {
  CanonicalStateStore,
  type CanonicalRecordEnvelope,
} from "./canonical-state-store";
import {
  type CanonicalMutation,
  type CanonicalTransaction,
  type CanonicalValue,
  type Entity,
  type Event,
  type Proposition,
} from "./primitives";

const worldId = "world:winter-medicine" as Entity["worldId"];
const timestamp = { instant: "2041-01-01T00:00:00.000Z", tick: 1 } as const;
const provenance = {
  createdBy: "research_fixture" as const,
  sourceEventIds: [],
  sourceMutationIds: [],
  deterministicSeed: "winter-medicine-store-test",
};

const systemEvent: Event = {
  id: "event:genesis" as Event["id"],
  worldId,
  kind: "system",
  occurredAt: timestamp,
  participants: [],
  causes: [],
  preconditions: [],
  producedMutationIds: [],
  descriptionCode: "GENESIS_COMPLETE",
  payload: {},
  provenance,
};

const mara: Entity = {
  id: "entity:mara" as Entity["id"],
  worldId,
  kind: "agent",
  canonicalName: "Mara",
  aliases: [],
  createdAt: timestamp,
  tags: ["healer"],
  attributes: { fatigue: 0.7, conscious: true },
  revision: 0,
  provenance,
};

const elianFever: Proposition = {
  id: "proposition:elian-fever" as Proposition["id"],
  worldId,
  subject: { id: "entity:elian" as Entity["id"], kind: "agent" },
  predicate: "has",
  object: "fever",
  validFrom: timestamp,
  canonicalStatus: "true",
  provenance,
};

const fixtures: CanonicalRecordEnvelope[] = [
  { recordType: "event", recordId: systemEvent.id, value: systemEvent },
  { recordType: "entity", recordId: mara.id, value: mara },
  { recordType: "proposition", recordId: elianFever.id, value: elianFever },
];

const transaction = (
  id: string,
  mutations: CanonicalMutation[],
): CanonicalTransaction => ({
  id: id as CanonicalTransaction["id"],
  worldId,
  startedAt: timestamp,
  status: "proposed",
  mutations,
  causeEventIds: [systemEvent.id],
  validationErrors: [],
  deterministicSeed: id,
});

const mutation = (
  partial: Omit<CanonicalMutation, "worldId" | "occurredAt" | "preconditionPropositionIds" | "affectedEntityIds" | "reversible" | "provenance">,
): CanonicalMutation => ({
  ...partial,
  worldId,
  occurredAt: timestamp,
  preconditionPropositionIds: [],
  affectedEntityIds: [mara.id],
  reversible: true,
  provenance,
});

test("commits a valid patch atomically and increments revisions", () => {
  const store = new CanonicalStateStore({ worldId, initialRecords: fixtures });
  const txId = "transaction:mara-fatigue";
  const tx = transaction(txId, [
    mutation({
      id: "mutation:mara-fatigue" as CanonicalMutation["id"],
      transactionId: txId as CanonicalMutation["transactionId"],
      operation: "replace",
      target: { recordType: "entity", recordId: mara.id, path: "attributes.fatigue", expectedRevision: 0 },
      before: 0.7,
      after: 0.8,
      causeEventIds: [systemEvent.id],
    }),
  ]);

  const result = store.commit(tx);
  assert.equal(result.ok, true);
  assert.equal(store.worldRevision, 1);
  const updated = store.get<Entity>("entity", mara.id)!;
  assert.equal(updated.attributes.fatigue, 0.8);
  assert.equal(updated.revision, 1);
  assert.equal(store.getHistory().length, 1);
});

test("rejects the entire transaction when a later mutation fails", () => {
  const store = new CanonicalStateStore({ worldId, initialRecords: fixtures });
  const txId = "transaction:atomic-failure";
  const tx = transaction(txId, [
    mutation({
      id: "mutation:first-valid" as CanonicalMutation["id"],
      transactionId: txId as CanonicalMutation["transactionId"],
      operation: "replace",
      target: { recordType: "entity", recordId: mara.id, path: "attributes.fatigue", expectedRevision: 0 },
      before: 0.7,
      after: 0.9,
      causeEventIds: [systemEvent.id],
    }),
    mutation({
      id: "mutation:second-invalid" as CanonicalMutation["id"],
      transactionId: txId as CanonicalMutation["transactionId"],
      operation: "replace",
      target: { recordType: "entity", recordId: "entity:missing" },
      before: {} as CanonicalValue,
      after: {} as CanonicalValue,
      causeEventIds: [systemEvent.id],
    }),
  ]);

  const result = store.commit(tx);
  assert.equal(result.ok, false);
  assert(result.issues.some((entry) => entry.code === "record_missing"));
  assert.equal(store.get<Entity>("entity", mara.id)!.attributes.fatigue, 0.7);
  assert.equal(store.worldRevision, 0);
  assert.equal(store.getHistory().length, 0);
});

test("enforces optimistic revision checks", () => {
  const store = new CanonicalStateStore({ worldId, initialRecords: fixtures });
  const txId = "transaction:stale-write";
  const result = store.commit(transaction(txId, [
    mutation({
      id: "mutation:stale-write" as CanonicalMutation["id"],
      transactionId: txId as CanonicalMutation["transactionId"],
      operation: "replace",
      target: { recordType: "entity", recordId: mara.id, path: "attributes.fatigue", expectedRevision: 4 },
      before: 0.7,
      after: 0.8,
      causeEventIds: [systemEvent.id],
    }),
  ]));

  assert.equal(result.ok, false);
  assert(result.issues.some((entry) => entry.code === "revision_conflict"));
});

test("requires canonical preconditions to be true", () => {
  const store = new CanonicalStateStore({ worldId, initialRecords: fixtures });
  const txId = "transaction:precondition";
  const proposedMutation = mutation({
    id: "mutation:precondition" as CanonicalMutation["id"],
    transactionId: txId as CanonicalMutation["transactionId"],
    operation: "replace",
    target: { recordType: "entity", recordId: mara.id, path: "attributes.conscious", expectedRevision: 0 },
    before: true,
    after: false,
    causeEventIds: [systemEvent.id],
  });
  proposedMutation.preconditionPropositionIds = ["proposition:not-true" as Proposition["id"]];

  const result = store.commit(transaction(txId, [proposedMutation]));
  assert.equal(result.ok, false);
  assert(result.issues.some((entry) => entry.code === "failed_precondition"));
});

test("rejects duplicate transaction IDs", () => {
  const store = new CanonicalStateStore({ worldId, initialRecords: fixtures });
  const txId = "transaction:duplicate";
  const makeTransaction = () => transaction(txId, [
    mutation({
      id: "mutation:duplicate" as CanonicalMutation["id"],
      transactionId: txId as CanonicalMutation["transactionId"],
      operation: "replace",
      target: { recordType: "entity", recordId: mara.id, path: "attributes.fatigue", expectedRevision: 0 },
      before: 0.7,
      after: 0.75,
      causeEventIds: [systemEvent.id],
    }),
  ]);

  assert.equal(store.commit(makeTransaction()).ok, true);
  const second = store.commit(makeTransaction());
  assert.equal(second.ok, false);
  assert(second.issues.some((entry) => entry.code === "duplicate_transaction"));
});

test("replay reconstructs an equivalent canonical snapshot", () => {
  const original = new CanonicalStateStore({ worldId, initialRecords: fixtures });
  const txId = "transaction:replay";
  const result = original.commit(transaction(txId, [
    mutation({
      id: "mutation:replay" as CanonicalMutation["id"],
      transactionId: txId as CanonicalMutation["transactionId"],
      operation: "replace",
      target: { recordType: "entity", recordId: mara.id, path: "attributes.fatigue", expectedRevision: 0 },
      before: 0.7,
      after: 0.85,
      causeEventIds: [systemEvent.id],
    }),
  ]));
  assert.equal(result.ok, true);

  const replayed = CanonicalStateStore.replay(
    { worldId, initialRecords: fixtures },
    original.getHistory(),
  );

  assert.deepEqual(replayed.get<Entity>("entity", mara.id), original.get<Entity>("entity", mara.id));
  assert.equal(replayed.worldRevision, original.worldRevision);
});

test("read methods return defensive copies", () => {
  const store = new CanonicalStateStore({ worldId, initialRecords: fixtures });
  const read = store.get<Entity>("entity", mara.id)!;
  (read.attributes as Record<string, CanonicalValue>).fatigue = 0;

  assert.equal(store.get<Entity>("entity", mara.id)!.attributes.fatigue, 0.7);
});
