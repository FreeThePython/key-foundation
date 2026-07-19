import type { CanonicalStateStore, CommitResult } from "../../world/canonical-state-store";
import {
  type CanonicalMutation,
  type CanonicalTransaction,
  type CanonicalValue,
  type Entity,
  type Event,
  type EventId,
  type MutationId,
  type TransactionId,
  type WorldTimestamp,
} from "../../world/primitives";
import { resolveWinterMedicineAction, type WinterMedicineActionRequest, type WinterMedicineActionResult } from "./action-resolution";
import {
  WINTER_MEDICINE_ENTITIES,
  WINTER_MEDICINE_GENESIS_EVENT,
  WINTER_MEDICINE_WORLD_ID,
} from "./genesis";

export const WINTER_MEDICINE_MINUTES_PER_TICK = 5;

export const WINTER_MEDICINE_ACTION_DURATIONS = {
  examine_elian: 1,
  search_cabin: 2,
  ask_mara_about_medicine: 1,
  begin_journey_to_rooks_crossing: 1,
} as const;

export interface WinterMedicineTimeAdvanceRequest {
  advanceId: string;
  fromTick: number;
  ticks: number;
  occurredAt: WorldTimestamp;
  deterministicSeed: string;
  causeEventId?: EventId;
}

export type WinterMedicineTimeAdvanceResult =
  | { ok: true; commit: Extract<CommitResult, { ok: true }>; event: Event }
  | { ok: false; code: "invalid_time_advance" | "invalid_world_state" | "commit_rejected"; message: string; commit?: Extract<CommitResult, { ok: false }> };

export type WinterMedicineTurnResult =
  | {
      ok: true;
      action: Extract<WinterMedicineActionResult, { ok: true }>;
      time: Extract<WinterMedicineTimeAdvanceResult, { ok: true }>;
    }
  | {
      ok: false;
      stage: "action" | "time";
      message: string;
      action?: WinterMedicineActionResult;
      time?: WinterMedicineTimeAdvanceResult;
    };

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const numberAttribute = (entity: Entity, key: string): number => {
  const value = entity.attributes[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`Entity ${entity.id} is missing numeric attribute ${key}`);
  }
  return value;
};

const latestEvent = (world: CanonicalStateStore): Event | undefined =>
  world.list<Event>("event").sort((left, right) => right.occurredAt.tick - left.occurredAt.tick)[0];

const asCanonicalValue = (value: unknown): CanonicalValue => value as CanonicalValue;

export const advanceWinterMedicineTime = (
  world: CanonicalStateStore,
  request: WinterMedicineTimeAdvanceRequest,
): WinterMedicineTimeAdvanceResult => {
  if (world.worldId !== WINTER_MEDICINE_WORLD_ID) {
    return { ok: false, code: "invalid_world_state", message: "The time system received a different world." };
  }
  if (!request.advanceId.trim()) {
    return { ok: false, code: "invalid_time_advance", message: "advanceId must be non-empty." };
  }
  if (!request.deterministicSeed.trim()) {
    return { ok: false, code: "invalid_time_advance", message: "deterministicSeed must be non-empty." };
  }
  if (!Number.isInteger(request.fromTick) || request.fromTick < 0) {
    return { ok: false, code: "invalid_time_advance", message: "fromTick must be a non-negative integer." };
  }
  if (!Number.isInteger(request.ticks) || request.ticks <= 0) {
    return { ok: false, code: "invalid_time_advance", message: "ticks must be a positive integer." };
  }

  const latest = latestEvent(world);
  const latestTick = latest?.occurredAt.tick ?? 0;
  if (request.fromTick < latestTick) {
    return {
      ok: false,
      code: "invalid_time_advance",
      message: `Cannot advance from tick ${request.fromTick}; canonical time has reached tick ${latestTick}.`,
    };
  }

  const elian = world.get<Entity>("entity", WINTER_MEDICINE_ENTITIES.elian.id);
  const player = world.get<Entity>("entity", WINTER_MEDICINE_ENTITIES.player.id);
  if (!elian || !player) {
    return { ok: false, code: "invalid_world_state", message: "Required Winter Medicine entities are missing." };
  }

  const transactionId = `transaction:time:${request.advanceId}` as TransactionId;
  const eventId = `event:time:${request.advanceId}` as EventId;
  const eventMutationId = `mutation:time:${request.advanceId}:event` as MutationId;
  const elianMutationId = `mutation:time:${request.advanceId}:elian` as MutationId;
  const playerMutationId = `mutation:time:${request.advanceId}:player` as MutationId;
  const causeEventId = request.causeEventId ?? latest?.id ?? WINTER_MEDICINE_GENESIS_EVENT.id;
  const toTick = request.fromTick + request.ticks;
  const elapsedMinutes = request.ticks * WINTER_MEDICINE_MINUTES_PER_TICK;
  const forestRoadLocationId = WINTER_MEDICINE_ENTITIES.forestRoad.id as unknown as Entity["locationId"];
  const playerOnRoad = player.locationId === forestRoadLocationId;
  const producedMutationIds = playerOnRoad
    ? [eventMutationId, elianMutationId, playerMutationId]
    : [eventMutationId, elianMutationId];

  const provenance = {
    createdBy: "simulation" as const,
    sourceEventIds: [causeEventId],
    sourceMutationIds: [] as MutationId[],
    transactionId,
    deterministicSeed: request.deterministicSeed,
    ruleId: "winter-medicine-time-progression-v1",
  };

  const event: Event = {
    id: eventId,
    worldId: WINTER_MEDICINE_WORLD_ID,
    kind: "process_transition",
    occurredAt: { ...request.occurredAt, tick: toTick },
    locationId: player.locationId,
    participants: [
      { entityId: WINTER_MEDICINE_ENTITIES.elian.id, role: "affected" },
      { entityId: WINTER_MEDICINE_ENTITIES.player.id, role: playerOnRoad ? "affected" : "witness" },
    ],
    causes: [{ causeEventId, relation: "triggering", strength: 1 as Event["causes"][number]["strength"] }],
    preconditions: [],
    producedMutationIds,
    descriptionCode: "WINTER_MEDICINE_TIME_ADVANCES",
    payload: {
      fromTick: request.fromTick,
      toTick,
      elapsedMinutes,
      stormActive: true,
      playerExposedToStorm: playerOnRoad,
    },
    provenance,
  };

  const elianBefore = elian.attributes;
  const elianAfter = {
    bodyTemperatureC: Number(clamp(numberAttribute(elian, "bodyTemperatureC") + 0.04 * request.ticks, 35, 42.5).toFixed(2)),
    hydration: Number(clamp(numberAttribute(elian, "hydration") - 0.012 * request.ticks, 0, 1).toFixed(3)),
    respiratoryDistress: Number(clamp(numberAttribute(elian, "respiratoryDistress") + 0.025 * request.ticks, 0, 1).toFixed(3)),
  };

  const mutations: CanonicalMutation[] = [
    {
      id: eventMutationId,
      worldId: WINTER_MEDICINE_WORLD_ID,
      transactionId,
      occurredAt: event.occurredAt,
      operation: "create",
      target: { recordType: "event", recordId: event.id },
      after: asCanonicalValue(event),
      preconditionPropositionIds: [],
      causeEventIds: [eventId],
      affectedEntityIds: [WINTER_MEDICINE_ENTITIES.elian.id, WINTER_MEDICINE_ENTITIES.player.id],
      reversible: true,
      provenance,
    },
    {
      id: elianMutationId,
      worldId: WINTER_MEDICINE_WORLD_ID,
      transactionId,
      occurredAt: event.occurredAt,
      operation: "patch",
      target: {
        recordType: "entity",
        recordId: elian.id,
        path: "attributes",
        expectedRevision: elian.revision,
      },
      before: elianBefore,
      after: elianAfter,
      preconditionPropositionIds: [],
      causeEventIds: [eventId],
      affectedEntityIds: [elian.id],
      reversible: true,
      provenance,
    },
  ];

  if (playerOnRoad) {
    mutations.push({
      id: playerMutationId,
      worldId: WINTER_MEDICINE_WORLD_ID,
      transactionId,
      occurredAt: event.occurredAt,
      operation: "patch",
      target: {
        recordType: "entity",
        recordId: player.id,
        path: "attributes",
        expectedRevision: player.revision,
      },
      before: player.attributes,
      after: {
        coldExposure: Number(clamp(numberAttribute(player, "coldExposure") + 0.035 * request.ticks, 0, 1).toFixed(3)),
        fatigue: Number(clamp(numberAttribute(player, "fatigue") + 0.025 * request.ticks, 0, 1).toFixed(3)),
      },
      preconditionPropositionIds: [],
      causeEventIds: [eventId],
      affectedEntityIds: [player.id],
      reversible: true,
      provenance,
    });
  }

  const transaction: CanonicalTransaction = {
    id: transactionId,
    worldId: WINTER_MEDICINE_WORLD_ID,
    startedAt: event.occurredAt,
    status: "validated",
    mutations,
    causeEventIds: [causeEventId],
    validationErrors: [],
    deterministicSeed: request.deterministicSeed,
  };

  const commit = world.commit(transaction, event.occurredAt);
  if (!commit.ok) {
    return {
      ok: false,
      code: "commit_rejected",
      message: commit.issues.map((entry) => entry.message).join("; "),
      commit,
    };
  }

  return { ok: true, commit, event };
};

export const resolveWinterMedicineTurn = (
  world: CanonicalStateStore,
  request: WinterMedicineActionRequest,
): WinterMedicineTurnResult => {
  const action = resolveWinterMedicineAction(world, request);
  if (!action.ok) return { ok: false, stage: "action", message: action.message, action };

  const ticks = WINTER_MEDICINE_ACTION_DURATIONS[request.kind];
  const time = advanceWinterMedicineTime(world, {
    advanceId: request.actionId,
    fromTick: request.occurredAt.tick,
    ticks,
    occurredAt: request.occurredAt,
    deterministicSeed: `${request.deterministicSeed}:time`,
    causeEventId: action.event.id,
  });
  if (!time.ok) return { ok: false, stage: "time", message: time.message, action, time };

  return { ok: true, action, time };
};