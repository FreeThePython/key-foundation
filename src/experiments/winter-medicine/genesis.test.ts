import test from "node:test";
import assert from "node:assert/strict";

import type { Belief, Entity, Event, Memory, Proposition } from "../../world/primitives";
import {
  WINTER_MEDICINE_ENTITIES,
  WINTER_MEDICINE_GENESIS_EVENT,
  WINTER_MEDICINE_PROPOSITIONS,
  WINTER_MEDICINE_RECORDS,
  WINTER_MEDICINE_WORLD_ID,
  createWinterMedicineWorld,
} from "./genesis";

test("creates the complete Winter Medicine genesis world", () => {
  const world = createWinterMedicineWorld();

  assert.equal(world.worldId, WINTER_MEDICINE_WORLD_ID);
  assert.equal(world.worldRevision, 0);
  assert.equal(world.list<Entity>("entity").length, 8);
  assert.equal(world.list<Proposition>("proposition").length, 6);
  assert.equal(world.list<Event>("event").length, 1);
  assert.equal(world.list<Belief>("belief").length, 2);
  assert.equal(world.list<Memory>("memory").length, 1);
  assert.equal(WINTER_MEDICINE_RECORDS.length, 18);
});

test("places all four people in Mara's cabin at genesis", () => {
  const world = createWinterMedicineWorld();
  const cabinId = WINTER_MEDICINE_ENTITIES.cabin.id;

  for (const entity of [
    WINTER_MEDICINE_ENTITIES.player,
    WINTER_MEDICINE_ENTITIES.mara,
    WINTER_MEDICINE_ENTITIES.tomas,
    WINTER_MEDICINE_ENTITIES.elian,
  ]) {
    assert.equal(world.get<Entity>("entity", entity.id)?.locationId, cabinId);
  }
});

test("starts with Elian critically ill but not yet resolved", () => {
  const world = createWinterMedicineWorld();
  const elian = world.get<Entity>("entity", WINTER_MEDICINE_ENTITIES.elian.id)!;

  assert.equal(elian.attributes.conscious, false);
  assert.equal(elian.attributes.bodyTemperatureC, 40.1);
  assert.equal(elian.attributes.hydration, 0.38);
  assert.equal(
    world.get<Proposition>("proposition", WINTER_MEDICINE_PROPOSITIONS.elianHasFever.id)?.canonicalStatus,
    "true",
  );
});

test("keeps uncertain medicine availability distinct from canonical truth", () => {
  const world = createWinterMedicineWorld();
  const medicine = world.get<Proposition>(
    "proposition",
    WINTER_MEDICINE_PROPOSITIONS.rookCrossingMayHaveMedicine.id,
  )!;

  assert.equal(medicine.canonicalStatus, "unknown");
  assert.equal(medicine.object, "possible-fever-medicine");
});

test("gives Mara and Tomas separate beliefs", () => {
  const world = createWinterMedicineWorld();
  const beliefs = world.list<Belief>("belief");

  assert.equal(beliefs.some((belief) => belief.ownerId === WINTER_MEDICINE_ENTITIES.mara.id), true);
  assert.equal(beliefs.some((belief) => belief.ownerId === WINTER_MEDICINE_ENTITIES.tomas.id), true);
  assert.notEqual(beliefs[0]?.ownerId, beliefs[1]?.ownerId);
});

test("records one deterministic genesis event", () => {
  const world = createWinterMedicineWorld();
  const event = world.get<Event>("event", WINTER_MEDICINE_GENESIS_EVENT.id)!;

  assert.equal(event.descriptionCode, "WINTER_MEDICINE_GENESIS");
  assert.equal(event.occurredAt.tick, 0);
  assert.equal(event.payload.weather, "active-snowstorm");
  assert.equal(event.participants.length, 4);
});

test("returns independent world instances", () => {
  const first = createWinterMedicineWorld();
  const second = createWinterMedicineWorld();

  const read = first.get<Entity>("entity", WINTER_MEDICINE_ENTITIES.mara.id)!;
  (read.attributes as Record<string, unknown>).fatigue = 0;

  assert.equal(second.get<Entity>("entity", WINTER_MEDICINE_ENTITIES.mara.id)?.attributes.fatigue, 0.72);
});
