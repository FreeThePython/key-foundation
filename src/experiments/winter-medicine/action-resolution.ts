import type { CommitResult, CanonicalStateStore } from "../../world/canonical-state-store";
import {
  asUnitInterval,
  type CanonicalMutation,
  type CanonicalTransaction,
  type CanonicalValue,
  type Entity,
  type Event,
  type EventId,
  type Memory,
  type MutationId,
  type Observation,
  type Proposition,
  type TransactionId,
  type WorldTimestamp,
} from "../../world/primitives";
import {
  WINTER_MEDICINE_ENTITIES,
  WINTER_MEDICINE_GENESIS_EVENT,
  WINTER_MEDICINE_PROPOSITIONS,
  WINTER_MEDICINE_WORLD_ID,
} from "./genesis";

export type WinterMedicineActionKind =
  | "examine_elian"
  | "search_cabin"
  | "ask_mara_about_medicine"
  | "begin_journey_to_rooks_crossing";

export interface WinterMedicineActionRequest {
  actionId: string;
  kind: WinterMedicineActionKind;
  occurredAt: WorldTimestamp;
  deterministicSeed: string;
}

export type WinterMedicineActionResult =
  | { ok: true; commit: Extract<CommitResult, { ok: true }>; event: Event }
  | { ok: false; code: "invalid_action" | "invalid_world_state" | "commit_rejected"; message: string; commit?: Extract<CommitResult, { ok: false }> };

const cabinLocationId = "location:cabin" as Entity["locationId"];
const forestRoadLocationId = "location:forest-road" as Entity["locationId"];

const provenanceFor = (eventId: EventId, transactionId: TransactionId, seed: string) => ({
  createdBy: "validated_player_action" as const,
  sourceEventIds: [eventId],
  sourceMutationIds: [] as MutationId[],
  transactionId,
  deterministicSeed: seed,
});

const mutation = (
  id: MutationId,
  transactionId: TransactionId,
  eventId: EventId,
  occurredAt: WorldTimestamp,
  seed: string,
  details: Omit<CanonicalMutation, "id" | "worldId" | "transactionId" | "occurredAt" | "causeEventIds" | "provenance">,
): CanonicalMutation => ({
  id,
  worldId: WINTER_MEDICINE_WORLD_ID,
  transactionId,
  occurredAt,
  causeEventIds: [eventId],
  provenance: provenanceFor(eventId, transactionId, seed),
  ...details,
});

const ensurePlayerInCabin = (world: CanonicalStateStore): string | undefined => {
  const player = world.get<Entity>("entity", WINTER_MEDICINE_ENTITIES.player.id);
  if (!player) return "The player entity does not exist.";
  if (player.locationId !== cabinLocationId) return "This action requires the player to be inside Mara's cabin.";
  return undefined;
};

const createEvent = (
  request: WinterMedicineActionRequest,
  eventId: EventId,
  producedMutationIds: MutationId[],
): Event => {
  const common = {
    id: eventId,
    worldId: WINTER_MEDICINE_WORLD_ID,
    occurredAt: request.occurredAt,
    locationId: cabinLocationId,
    causes: [{
      causeEventId: WINTER_MEDICINE_GENESIS_EVENT.id,
      relation: "enabling" as const,
      strength: asUnitInterval(1),
    }],
    preconditions: [],
    producedMutationIds,
    provenance: provenanceFor(eventId, `transaction:${request.actionId}` as TransactionId, request.deterministicSeed),
  };

  switch (request.kind) {
    case "examine_elian":
      return {
        ...common,
        kind: "observation",
        participants: [
          { entityId: WINTER_MEDICINE_ENTITIES.player.id, role: "actor" },
          { entityId: WINTER_MEDICINE_ENTITIES.elian.id, role: "target" },
        ],
        descriptionCode: "PLAYER_EXAMINES_ELIAN",
        payload: { actionKind: request.kind, method: "basic-physical-examination" },
      };
    case "search_cabin":
      return {
        ...common,
        kind: "discovery",
        participants: [
          { entityId: WINTER_MEDICINE_ENTITIES.player.id, role: "actor" },
          { entityId: WINTER_MEDICINE_ENTITIES.mara.id, role: "witness" },
        ],
        descriptionCode: "PLAYER_SEARCHES_CABIN",
        payload: { actionKind: request.kind, searchArea: "medicine-cabinet-and-shelves" },
      };
    case "ask_mara_about_medicine":
      return {
        ...common,
        kind: "communication",
        participants: [
          { entityId: WINTER_MEDICINE_ENTITIES.player.id, role: "actor" },
          { entityId: WINTER_MEDICINE_ENTITIES.mara.id, role: "target" },
          { entityId: WINTER_MEDICINE_ENTITIES.tomas.id, role: "witness" },
        ],
        descriptionCode: "PLAYER_ASKS_MARA_ABOUT_MEDICINE",
        payload: { actionKind: request.kind, topic: "effective-fever-medicine" },
      };
    case "begin_journey_to_rooks_crossing":
      return {
        ...common,
        kind: "movement",
        participants: [
          { entityId: WINTER_MEDICINE_ENTITIES.player.id, role: "actor" },
          { entityId: WINTER_MEDICINE_ENTITIES.elian.id, role: "beneficiary" },
        ],
        descriptionCode: "PLAYER_BEGINS_JOURNEY_TO_ROOKS_CROSSING",
        payload: { actionKind: request.kind, destination: "location:far-settlement" },
      };
  }
};

const buildTransaction = (
  world: CanonicalStateStore,
  request: WinterMedicineActionRequest,
): { transaction: CanonicalTransaction; event: Event } | { error: string } => {
  if (!request.actionId.trim()) return { error: "actionId must be non-empty." };
  if (!request.deterministicSeed.trim()) return { error: "deterministicSeed must be non-empty." };
  if (!Number.isInteger(request.occurredAt.tick) || request.occurredAt.tick <= 0) {
    return { error: "Action ticks must be positive integers after genesis." };
  }

  const cabinError = ensurePlayerInCabin(world);
  if (cabinError) return { error: cabinError };

  const transactionId = `transaction:${request.actionId}` as TransactionId;
  const eventId = `event:${request.actionId}` as EventId;
  const eventMutationId = `mutation:${request.actionId}:event` as MutationId;
  const mutations: CanonicalMutation[] = [];

  const addCreate = (
    id: MutationId,
    recordType: CanonicalMutation["target"]["recordType"],
    recordId: string,
    after: unknown,
    affectedEntityIds: Entity["id"][],
  ) => mutations.push(mutation(id, transactionId, eventId, request.occurredAt, request.deterministicSeed, {
    operation: "create",
    target: { recordType, recordId },
    after: after as CanonicalValue,
    preconditionPropositionIds: [],
    affectedEntityIds,
    reversible: true,
  }));

  switch (request.kind) {
    case "examine_elian": {
      const observationId = `observation:${request.actionId}` as Observation["id"];
      const memoryId = `memory:${request.actionId}` as Memory["id"];
      const observationMutationId = `mutation:${request.actionId}:observation` as MutationId;
      const memoryMutationId = `mutation:${request.actionId}:memory` as MutationId;
      const event = createEvent(request, eventId, [eventMutationId, observationMutationId, memoryMutationId]);

      addCreate(eventMutationId, "event", event.id, event, [WINTER_MEDICINE_ENTITIES.player.id, WINTER_MEDICINE_ENTITIES.elian.id]);

      const observation: Observation = {
        id: observationId,
        worldId: WINTER_MEDICINE_WORLD_ID,
        observerId: WINTER_MEDICINE_ENTITIES.player.id,
        observedAt: request.occurredAt,
        sourceEventId: eventId,
        sourceEntityIds: [WINTER_MEDICINE_ENTITIES.elian.id],
        modality: "touch",
        rawFeatures: {
          bodyTemperatureC: 40.1,
          consciousness: "unresponsive",
          breathing: "rapid",
        },
        candidatePropositionIds: [
          WINTER_MEDICINE_PROPOSITIONS.elianHasFever.id,
          WINTER_MEDICINE_PROPOSITIONS.elianIsDehydrated.id,
        ],
        perceptualConfidence: asUnitInterval(0.91),
        attentionWeight: asUnitInterval(1),
        distortionFactors: ["limited-medical-training"],
        privateToObserver: true,
        provenance: provenanceFor(eventId, transactionId, request.deterministicSeed),
      };
      addCreate(observationMutationId, "observation", observation.id, observation, [WINTER_MEDICINE_ENTITIES.player.id, WINTER_MEDICINE_ENTITIES.elian.id]);

      const memory: Memory = {
        id: memoryId,
        worldId: WINTER_MEDICINE_WORLD_ID,
        ownerId: WINTER_MEDICINE_ENTITIES.player.id,
        kind: "episodic",
        encodedAt: request.occurredAt,
        sourceEventIds: [eventId],
        sourceObservationIds: [observationId],
        propositionIds: [WINTER_MEDICINE_PROPOSITIONS.elianHasFever.id],
        summary: "Elian was burning with fever, unresponsive, and breathing rapidly.",
        salience: asUnitInterval(0.95),
        emotionalValence: -0.72 as Memory["emotionalValence"],
        confidence: asUnitInterval(0.91),
        fidelity: asUnitInterval(0.94),
        accessibility: asUnitInterval(0.96),
        decayRate: asUnitInterval(0.02),
        consolidationCount: 0,
        provenance: provenanceFor(eventId, transactionId, request.deterministicSeed),
      };
      addCreate(memoryMutationId, "memory", memory.id, memory, [WINTER_MEDICINE_ENTITIES.player.id]);
      return { transaction: {
        id: transactionId,
        worldId: WINTER_MEDICINE_WORLD_ID,
        startedAt: request.occurredAt,
        status: "validated",
        mutations,
        causeEventIds: [eventId],
        validationErrors: [],
        deterministicSeed: request.deterministicSeed,
      }, event };
    }

    case "search_cabin": {
      const observationId = `observation:${request.actionId}` as Observation["id"];
      const propositionId = `proposition:${request.actionId}:cabinet-searched` as Proposition["id"];
      const observationMutationId = `mutation:${request.actionId}:observation` as MutationId;
      const propositionMutationId = `mutation:${request.actionId}:proposition` as MutationId;
      const event = createEvent(request, eventId, [eventMutationId, observationMutationId, propositionMutationId]);
      addCreate(eventMutationId, "event", event.id, event, [WINTER_MEDICINE_ENTITIES.player.id]);

      const proposition: Proposition = {
        id: propositionId,
        worldId: WINTER_MEDICINE_WORLD_ID,
        subject: { id: WINTER_MEDICINE_ENTITIES.cabin.id },
        predicate: "has",
        object: "no-effective-fever-medicine-found-by-player",
        validFrom: request.occurredAt,
        canonicalStatus: "true",
        provenance: provenanceFor(eventId, transactionId, request.deterministicSeed),
      };
      addCreate(propositionMutationId, "proposition", proposition.id, proposition, [WINTER_MEDICINE_ENTITIES.player.id]);

      const observation: Observation = {
        id: observationId,
        worldId: WINTER_MEDICINE_WORLD_ID,
        observerId: WINTER_MEDICINE_ENTITIES.player.id,
        observedAt: request.occurredAt,
        sourceEventId: eventId,
        sourceEntityIds: [WINTER_MEDICINE_ENTITIES.cabin.id],
        modality: "vision",
        rawFeatures: { cabinetSearched: true, usefulMedicineFound: false },
        candidatePropositionIds: [propositionId, WINTER_MEDICINE_PROPOSITIONS.cabinHasNoEffectiveMedicine.id],
        perceptualConfidence: asUnitInterval(0.94),
        attentionWeight: asUnitInterval(0.93),
        distortionFactors: ["unfamiliar-labels"],
        privateToObserver: false,
        provenance: provenanceFor(eventId, transactionId, request.deterministicSeed),
      };
      addCreate(observationMutationId, "observation", observation.id, observation, [WINTER_MEDICINE_ENTITIES.player.id]);
      return { transaction: {
        id: transactionId,
        worldId: WINTER_MEDICINE_WORLD_ID,
        startedAt: request.occurredAt,
        status: "validated",
        mutations,
        causeEventIds: [eventId],
        validationErrors: [],
        deterministicSeed: request.deterministicSeed,
      }, event };
    }

    case "ask_mara_about_medicine": {
      const observationId = `observation:${request.actionId}` as Observation["id"];
      const observationMutationId = `mutation:${request.actionId}:observation` as MutationId;
      const event = createEvent(request, eventId, [eventMutationId, observationMutationId]);
      addCreate(eventMutationId, "event", event.id, event, [WINTER_MEDICINE_ENTITIES.player.id, WINTER_MEDICINE_ENTITIES.mara.id]);

      const observation: Observation = {
        id: observationId,
        worldId: WINTER_MEDICINE_WORLD_ID,
        observerId: WINTER_MEDICINE_ENTITIES.player.id,
        observedAt: request.occurredAt,
        sourceEventId: eventId,
        sourceEntityIds: [WINTER_MEDICINE_ENTITIES.mara.id],
        modality: "testimony",
        rawFeatures: {
          statement: "Rook's Crossing had an apothecary last winter, but I cannot promise it still has what Elian needs.",
          speakerUrgency: "high",
        },
        candidatePropositionIds: [WINTER_MEDICINE_PROPOSITIONS.rookCrossingMayHaveMedicine.id],
        perceptualConfidence: asUnitInterval(0.99),
        attentionWeight: asUnitInterval(1),
        distortionFactors: [],
        privateToObserver: false,
        provenance: provenanceFor(eventId, transactionId, request.deterministicSeed),
      };
      addCreate(observationMutationId, "observation", observation.id, observation, [WINTER_MEDICINE_ENTITIES.player.id, WINTER_MEDICINE_ENTITIES.mara.id]);
      return { transaction: {
        id: transactionId,
        worldId: WINTER_MEDICINE_WORLD_ID,
        startedAt: request.occurredAt,
        status: "validated",
        mutations,
        causeEventIds: [eventId],
        validationErrors: [],
        deterministicSeed: request.deterministicSeed,
      }, event };
    }

    case "begin_journey_to_rooks_crossing": {
      const movementMutationId = `mutation:${request.actionId}:movement` as MutationId;
      const event = createEvent(request, eventId, [eventMutationId, movementMutationId]);
      addCreate(eventMutationId, "event", event.id, event, [WINTER_MEDICINE_ENTITIES.player.id]);
      mutations.push(mutation(movementMutationId, transactionId, eventId, request.occurredAt, request.deterministicSeed, {
        operation: "replace",
        target: {
          recordType: "entity",
          recordId: WINTER_MEDICINE_ENTITIES.player.id,
          path: "locationId",
          expectedRevision: world.get<Entity>("entity", WINTER_MEDICINE_ENTITIES.player.id)?.revision,
        },
        before: cabinLocationId,
        after: forestRoadLocationId,
        preconditionPropositionIds: [WINTER_MEDICINE_PROPOSITIONS.roadIsDangerous.id],
        affectedEntityIds: [WINTER_MEDICINE_ENTITIES.player.id],
        reversible: true,
      }));
      return { transaction: {
        id: transactionId,
        worldId: WINTER_MEDICINE_WORLD_ID,
        startedAt: request.occurredAt,
        status: "validated",
        mutations,
        causeEventIds: [eventId],
        validationErrors: [],
        deterministicSeed: request.deterministicSeed,
      }, event };
    }
  }
};

export const resolveWinterMedicineAction = (
  world: CanonicalStateStore,
  request: WinterMedicineActionRequest,
): WinterMedicineActionResult => {
  if (world.worldId !== WINTER_MEDICINE_WORLD_ID) {
    return { ok: false, code: "invalid_world_state", message: "The action resolver received a different world." };
  }

  const built = buildTransaction(world, request);
  if ("error" in built) {
    return { ok: false, code: "invalid_action", message: built.error };
  }

  const commit = world.commit(built.transaction, request.occurredAt);
  if (!commit.ok) {
    return {
      ok: false,
      code: "commit_rejected",
      message: commit.issues.map((entry) => entry.message).join("; "),
      commit,
    };
  }

  return { ok: true, commit, event: built.event };
};