import test from "node:test";
import assert from "node:assert/strict";

import type { Entity, Event, WorldTimestamp } from "../../world/primitives";
import { resolveWinterMedicineAction } from "./action-resolution";
import { WINTER_MEDICINE_ENTITIES, createWinterMedicineWorld } from "./genesis";
import {
  WINTER_MEDICINE_ACTION_DURATIONS,
  advanceWinterMedicineTime,
  resolveWinterMedicineTurn,
} from "./time-progression";

const at = (tick: number): WorldTimestamp => ({
  instant: `2041-01-17T06:${String(30 + tick * 5).padStart(2, "0")}:00.000Z` as WorldTimestamp["instant"],
  tick,
  calendarId: "winter-medicine-local",
});

test("advancing time worsens Elian deterministically", () => {
  const world = createWinterMedicineWorld();
  const result = advanceWinterMedicineTime(world, {
    advanceId: "wait-two-ticks",
    fromTick: 0,
    ticks: 2,
    occurredAt: at(0),
    deterministicSeed: "seed:wait-two-ticks",
  });

  assert.equal(result.ok, true);
  const elian = world.get<Entity>("entity", WINTER_MEDICINE_ENTITIES.elian.id)!;
  assert.equal(elian.attributes.bodyTemperatureC, 40.18);
  assert.equal(elian.attributes.hydration, 0.356);
  assert.equal(elian.attributes.respiratoryDistress, 0.49);
  assert.equal(elian.revision, 1);
});

test("remaining inside protects the player from storm exposure", () => {
  const world = createWinterMedicineWorld();
  const before = world.get<Entity>("entity", WINTER_MEDICINE_ENTITIES.player.id)!;

  const result = advanceWinterMedicineTime(world, {
    advanceId: "wait-inside",
    fromTick: 0,
    ticks: 3,
    occurredAt: at(0),
    deterministicSeed: "seed:wait-inside",
  });

  assert.equal(result.ok, true);
  const after = world.get<Entity>("entity", WINTER_MEDICINE_ENTITIES.player.id)!;
  assert.equal(after.attributes.coldExposure, before.attributes.coldExposure);
  assert.equal(after.attributes.fatigue, before.attributes.fatigue);
  assert.equal(after.revision, 0);
});

test("time on the forest road increases player cold exposure and fatigue", () => {
  const world = createWinterMedicineWorld();
  const departure = resolveWinterMedicineAction(world, {
    actionId: "depart-before-exposure",
    kind: "begin_journey_to_rooks_crossing",
    occurredAt: at(1),
    deterministicSeed: "seed:depart-before-exposure",
  });
  assert.equal(departure.ok, true);

  const result = advanceWinterMedicineTime(world, {
    advanceId: "road-exposure",
    fromTick: 1,
    ticks: 2,
    occurredAt: at(1),
    deterministicSeed: "seed:road-exposure",
    causeEventId: departure.ok ? departure.event.id : undefined,
  });

  assert.equal(result.ok, true);
  const player = world.get<Entity>("entity", WINTER_MEDICINE_ENTITIES.player.id)!;
  assert.equal(player.attributes.coldExposure, 0.27);
  assert.equal(player.attributes.fatigue, 0.3);
  assert.equal(player.revision, 2);
});

test("a complete turn applies the action duration and its consequences", () => {
  const world = createWinterMedicineWorld();
  const result = resolveWinterMedicineTurn(world, {
    actionId: "search-as-turn",
    kind: "search_cabin",
    occurredAt: at(1),
    deterministicSeed: "seed:search-as-turn",
  });

  assert.equal(result.ok, true);
  assert.equal(WINTER_MEDICINE_ACTION_DURATIONS.search_cabin, 2);
  assert.equal(result.ok ? result.time.event.occurredAt.tick : -1, 3);
  assert.equal(world.worldRevision, 2);

  const elian = world.get<Entity>("entity", WINTER_MEDICINE_ENTITIES.elian.id)!;
  assert.equal(elian.attributes.bodyTemperatureC, 40.18);
  assert.equal(elian.attributes.hydration, 0.356);
});

test("time advances are replayable and reject attempts to move backward", () => {
  const world = createWinterMedicineWorld();
  const first = advanceWinterMedicineTime(world, {
    advanceId: "first-advance",
    fromTick: 0,
    ticks: 2,
    occurredAt: at(0),
    deterministicSeed: "seed:first-advance",
  });
  assert.equal(first.ok, true);

  const backward = advanceWinterMedicineTime(world, {
    advanceId: "backward-advance",
    fromTick: 1,
    ticks: 1,
    occurredAt: at(1),
    deterministicSeed: "seed:backward-advance",
  });
  assert.equal(backward.ok, false);
  assert.equal(backward.code, "invalid_time_advance");
  assert.match(backward.message, /canonical time has reached tick 2/i);

  const timeEvents = world.list<Event>("event").filter(
    (event) => event.descriptionCode === "WINTER_MEDICINE_TIME_ADVANCES",
  );
  assert.equal(timeEvents.length, 1);
  assert.equal(world.getHistory().length, 1);
});
