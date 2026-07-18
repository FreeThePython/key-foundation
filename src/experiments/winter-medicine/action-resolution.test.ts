import test from "node:test";
import assert from "node:assert/strict";

import { CanonicalStateStore } from "../../world/canonical-state-store";
import type { Entity, Event, Memory, Observation, Proposition, WorldTimestamp } from "../../world/primitives";
import { resolveWinterMedicineAction, type WinterMedicineActionKind } from "./action-resolution";
import {
  WINTER_MEDICINE_ENTITIES,
  WINTER_MEDICINE_RECORDS,
  WINTER_MEDICINE_WORLD_ID,
  createWinterMedicineWorld,
} from "./genesis";

const at = (tick: number): WorldTimestamp => ({
  instant: `2041-01-17T06:${String(30 + tick).padStart(2, "0")}:00.000Z` as WorldTimestamp["instant"],
  tick,
  calendarId: "winter-medicine-local",
});

const act = (kind: WinterMedicineActionKind, actionId: string, tick = 1) => {
  const world = createWinterMedicineWorld();
  const result = resolveWinterMedicineAction(world, {
    actionId,
    kind,
    occurredAt: at(tick),
    deterministicSeed: `seed:${actionId}`,
  });
  return { world, result };
};

test("examining Elian atomically creates an event, observation, and player memory", () => {
  const { world, result } = act("examine_elian", "player-examines-elian");

  assert.equal(result.ok, true);
  assert.equal(world.worldRevision, 1);
  assert.equal(world.list<Event>("event").length, 2);
  assert.equal(world.list<Observation>("observation").length, 1);
  assert.equal(world.list<Memory>("memory").length, 2);

  const observation = world.list<Observation>("observation")[0]!;
  assert.equal(observation.observerId, WINTER_MEDICINE_ENTITIES.player.id);
  assert.equal(observation.rawFeatures.bodyTemperatureC, 40.1);
  assert.equal(observation.privateToObserver, true);

  const playerMemory = world.list<Memory>("memory").find(
    (memory) => memory.ownerId === WINTER_MEDICINE_ENTITIES.player.id,
  );
  assert.match(playerMemory?.summary ?? "", /burning with fever/i);
});

test("searching the cabin records what was actually found without resolving Rook's Crossing", () => {
  const { world, result } = act("search_cabin", "player-searches-cabin");

  assert.equal(result.ok, true);
  const finding = world.list<Proposition>("proposition").find(
    (proposition) => proposition.object === "no-effective-fever-medicine-found-by-player",
  );
  assert.equal(finding?.canonicalStatus, "true");

  const uncertainRooksCrossing = world.get<Proposition>(
    "proposition",
    "proposition:rook-crossing-may-have-medicine",
  );
  assert.equal(uncertainRooksCrossing?.canonicalStatus, "unknown");
});

test("Mara's testimony becomes an observation rather than canonical proof", () => {
  const { world, result } = act("ask_mara_about_medicine", "player-questions-mara");

  assert.equal(result.ok, true);
  const observation = world.list<Observation>("observation")[0]!;
  assert.equal(observation.modality, "testimony");
  assert.match(String(observation.rawFeatures.statement), /cannot promise/i);

  const medicine = world.get<Proposition>("proposition", "proposition:rook-crossing-may-have-medicine");
  assert.equal(medicine?.canonicalStatus, "unknown");
});

test("beginning the journey changes canonical player location and increments entity revision", () => {
  const { world, result } = act("begin_journey_to_rooks_crossing", "player-leaves-cabin");

  assert.equal(result.ok, true);
  const player = world.get<Entity>("entity", WINTER_MEDICINE_ENTITIES.player.id)!;
  assert.equal(player.locationId, "location:forest-road");
  assert.equal(player.revision, 1);

  const movement = world.list<Event>("event").find(
    (event) => event.descriptionCode === "PLAYER_BEGINS_JOURNEY_TO_ROOKS_CROSSING",
  );
  assert.equal(movement?.kind, "movement");
});

test("the same action ID cannot be committed twice", () => {
  const world = createWinterMedicineWorld();
  const request = {
    actionId: "duplicate-action",
    kind: "examine_elian" as const,
    occurredAt: at(1),
    deterministicSeed: "seed:duplicate-action",
  };

  assert.equal(resolveWinterMedicineAction(world, request).ok, true);
  const duplicate = resolveWinterMedicineAction(world, request);

  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.code, "commit_rejected");
  assert.match(duplicate.message, /already been committed/i);
  assert.equal(world.worldRevision, 1);
});

test("cabin-only actions are rejected after the player leaves", () => {
  const world = createWinterMedicineWorld();
  const departure = resolveWinterMedicineAction(world, {
    actionId: "departure",
    kind: "begin_journey_to_rooks_crossing",
    occurredAt: at(1),
    deterministicSeed: "seed:departure",
  });
  assert.equal(departure.ok, true);

  const search = resolveWinterMedicineAction(world, {
    actionId: "search-after-departure",
    kind: "search_cabin",
    occurredAt: at(2),
    deterministicSeed: "seed:search-after-departure",
  });

  assert.equal(search.ok, false);
  assert.equal(search.code, "invalid_action");
  assert.match(search.message, /requires the player to be inside/i);
  assert.equal(world.worldRevision, 1);
});

test("replaying the committed action reconstructs an equivalent canonical snapshot", () => {
  const world = createWinterMedicineWorld();
  const result = resolveWinterMedicineAction(world, {
    actionId: "replayable-examination",
    kind: "examine_elian",
    occurredAt: at(1),
    deterministicSeed: "seed:replayable-examination",
  });
  assert.equal(result.ok, true);

  const replayed = CanonicalStateStore.replay(
    { worldId: WINTER_MEDICINE_WORLD_ID, initialRecords: WINTER_MEDICINE_RECORDS },
    world.getHistory(),
  );

  assert.equal(replayed.worldRevision, world.worldRevision);
  assert.deepEqual(replayed.list<Event>("event"), world.list<Event>("event"));
  assert.deepEqual(replayed.list<Observation>("observation"), world.list<Observation>("observation"));
  assert.deepEqual(replayed.list<Memory>("memory"), world.list<Memory>("memory"));
});
