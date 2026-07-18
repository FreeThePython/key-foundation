import { CanonicalStateStore, type CanonicalRecordEnvelope } from "../../world/canonical-state-store";
import {
  asSignedUnit,
  asUnitInterval,
  type Belief,
  type Entity,
  type Event,
  type Memory,
  type Proposition,
  type WorldId,
  type WorldTimestamp,
} from "../../world/primitives";

export const WINTER_MEDICINE_WORLD_ID = "world:winter-medicine" as WorldId;

export const WINTER_MEDICINE_GENESIS_TIME: WorldTimestamp = {
  instant: "2041-01-17T06:30:00.000Z" as WorldTimestamp["instant"],
  tick: 0,
  calendarId: "winter-medicine-local",
};

const provenance = {
  createdBy: "genesis" as const,
  sourceEventIds: [],
  sourceMutationIds: [],
  deterministicSeed: "winter-medicine-genesis-v1",
};

const location = (id: string, name: string, attributes: Entity["attributes"]): Entity => ({
  id: id as Entity["id"],
  worldId: WINTER_MEDICINE_WORLD_ID,
  kind: "location",
  canonicalName: name,
  aliases: [],
  createdAt: WINTER_MEDICINE_GENESIS_TIME,
  tags: ["winter-medicine", "location"],
  attributes,
  revision: 0,
  provenance,
});

const agent = (
  id: string,
  name: string,
  kind: "agent" | "player",
  locationId: string,
  attributes: Entity["attributes"],
): Entity => ({
  id: id as Entity["id"],
  worldId: WINTER_MEDICINE_WORLD_ID,
  kind,
  canonicalName: name,
  aliases: [],
  createdAt: WINTER_MEDICINE_GENESIS_TIME,
  locationId: locationId as Entity["locationId"],
  tags: ["winter-medicine", kind],
  attributes,
  revision: 0,
  provenance,
});

export const WINTER_MEDICINE_ENTITIES = {
  cabin: location("location:cabin", "Mara's Cabin", {
    temperatureC: 9,
    fireLit: true,
    medicineCabinetLocked: false,
  }),
  village: location("location:village", "Greyhaven Village", {
    population: 87,
    distanceFromCabinKm: 3.2,
    roadCondition: "snow-covered",
  }),
  forestRoad: location("location:forest-road", "North Forest Road", {
    distanceKm: 11,
    visibilityMeters: 35,
    travelRisk: "high",
  }),
  settlement: location("location:far-settlement", "Rook's Crossing", {
    distanceFromCabinKm: 18,
    apothecaryKnown: true,
    roadCondition: "uncertain",
  }),
  player: agent("entity:player", "The Traveler", "player", "location:cabin", {
    fatigue: 0.25,
    coldExposure: 0.2,
    medicalSkill: 0.15,
    conscious: true,
  }),
  mara: agent("entity:mara", "Mara", "agent", "location:cabin", {
    role: "village-healer",
    fatigue: 0.72,
    medicalSkill: 0.88,
    conscious: true,
    urgency: 0.91,
  }),
  tomas: agent("entity:tomas", "Tomas", "agent", "location:cabin", {
    role: "Elian's-brother",
    fatigue: 0.41,
    medicalSkill: 0.08,
    conscious: true,
    distrustOfMara: 0.46,
  }),
  elian: agent("entity:elian", "Elian", "agent", "location:cabin", {
    role: "patient",
    conscious: false,
    bodyTemperatureC: 40.1,
    hydration: 0.38,
    respiratoryDistress: 0.44,
  }),
} as const;

const proposition = (
  id: string,
  subjectId: string,
  predicate: Proposition["predicate"],
  object: Proposition["object"],
  status: Proposition["canonicalStatus"] = "true",
): Proposition => ({
  id: id as Proposition["id"],
  worldId: WINTER_MEDICINE_WORLD_ID,
  subject: { id: subjectId as Entity["id"] },
  predicate,
  object,
  validFrom: WINTER_MEDICINE_GENESIS_TIME,
  canonicalStatus: status,
  provenance,
});

export const WINTER_MEDICINE_PROPOSITIONS = {
  elianHasFever: proposition("proposition:elian-has-fever", "entity:elian", "has", "severe-fever"),
  elianIsDehydrated: proposition("proposition:elian-is-dehydrated", "entity:elian", "has", "dehydration"),
  cabinHasNoEffectiveMedicine: proposition("proposition:cabin-lacks-effective-medicine", "location:cabin", "has", "no-confirmed-effective-medicine"),
  rookCrossingMayHaveMedicine: proposition("proposition:rook-crossing-may-have-medicine", "location:far-settlement", "has", "possible-fever-medicine", "unknown"),
  roadIsDangerous: proposition("proposition:forest-road-dangerous", "location:forest-road", "is", "dangerous-in-current-weather"),
  maraIsHealer: proposition("proposition:mara-is-healer", "entity:mara", "is", "village-healer"),
} as const;

export const WINTER_MEDICINE_GENESIS_EVENT: Event = {
  id: "event:winter-medicine-genesis" as Event["id"],
  worldId: WINTER_MEDICINE_WORLD_ID,
  kind: "system",
  occurredAt: WINTER_MEDICINE_GENESIS_TIME,
  locationId: "location:cabin" as Event["locationId"],
  participants: [
    { entityId: WINTER_MEDICINE_ENTITIES.player.id, role: "witness" },
    { entityId: WINTER_MEDICINE_ENTITIES.mara.id, role: "actor" },
    { entityId: WINTER_MEDICINE_ENTITIES.tomas.id, role: "affected" },
    { entityId: WINTER_MEDICINE_ENTITIES.elian.id, role: "affected" },
  ],
  causes: [],
  preconditions: [],
  producedMutationIds: [],
  descriptionCode: "WINTER_MEDICINE_GENESIS",
  payload: {
    weather: "active-snowstorm",
    dilemma: "obtain-effective-medicine-before-elian-declines",
    deterministicSeed: "winter-medicine-genesis-v1",
  },
  provenance,
};

const maraBelief: Belief = {
  id: "belief:mara:elian-needs-treatment-soon" as Belief["id"],
  worldId: WINTER_MEDICINE_WORLD_ID,
  ownerId: WINTER_MEDICINE_ENTITIES.mara.id,
  propositionId: WINTER_MEDICINE_PROPOSITIONS.elianHasFever.id,
  confidence: asUnitInterval(0.96),
  stance: "accepts",
  sources: [{ type: "observation", observationId: "observation:mara-examines-elian" as never }],
  evidenceFor: ["High temperature", "Reduced consciousness", "Rapid breathing"],
  evidenceAgainst: [],
  emotionalWeight: asSignedUnit(-0.82),
  accessibility: asUnitInterval(1),
  formedAt: WINTER_MEDICINE_GENESIS_TIME,
  updatedAt: WINTER_MEDICINE_GENESIS_TIME,
  revision: 0,
  provenance,
};

const tomasBelief: Belief = {
  id: "belief:tomas:mara-withholding-options" as Belief["id"],
  worldId: WINTER_MEDICINE_WORLD_ID,
  ownerId: WINTER_MEDICINE_ENTITIES.tomas.id,
  propositionId: WINTER_MEDICINE_PROPOSITIONS.cabinHasNoEffectiveMedicine.id,
  confidence: asUnitInterval(0.37),
  stance: "rejects",
  sources: [{ type: "instinct", code: "protective-suspicion" }],
  evidenceFor: ["Mara searched the cabinet twice"],
  evidenceAgainst: ["Mara has treated the village for years"],
  emotionalWeight: asSignedUnit(-0.71),
  accessibility: asUnitInterval(0.86),
  formedAt: WINTER_MEDICINE_GENESIS_TIME,
  updatedAt: WINTER_MEDICINE_GENESIS_TIME,
  revision: 0,
  provenance,
};

const maraMemory: Memory = {
  id: "memory:mara:rook-crossing-apothecary" as Memory["id"],
  worldId: WINTER_MEDICINE_WORLD_ID,
  ownerId: WINTER_MEDICINE_ENTITIES.mara.id,
  kind: "semantic",
  encodedAt: WINTER_MEDICINE_GENESIS_TIME,
  sourceEventIds: [],
  sourceObservationIds: [],
  propositionIds: [WINTER_MEDICINE_PROPOSITIONS.rookCrossingMayHaveMedicine.id],
  summary: "Rook's Crossing had an apothecary last winter, but Mara does not know its current stock.",
  salience: asUnitInterval(0.89),
  emotionalValence: asSignedUnit(0.12),
  confidence: asUnitInterval(0.63),
  fidelity: asUnitInterval(0.78),
  accessibility: asUnitInterval(0.92),
  decayRate: asUnitInterval(0.03),
  consolidationCount: 3,
  provenance,
};

export const WINTER_MEDICINE_RECORDS: CanonicalRecordEnvelope[] = [
  ...Object.values(WINTER_MEDICINE_ENTITIES).map((value) => ({ recordType: "entity" as const, recordId: value.id, value })),
  ...Object.values(WINTER_MEDICINE_PROPOSITIONS).map((value) => ({ recordType: "proposition" as const, recordId: value.id, value })),
  { recordType: "event", recordId: WINTER_MEDICINE_GENESIS_EVENT.id, value: WINTER_MEDICINE_GENESIS_EVENT },
  { recordType: "belief", recordId: maraBelief.id, value: maraBelief },
  { recordType: "belief", recordId: tomasBelief.id, value: tomasBelief },
  { recordType: "memory", recordId: maraMemory.id, value: maraMemory },
];

export const createWinterMedicineWorld = (): CanonicalStateStore =>
  new CanonicalStateStore({
    worldId: WINTER_MEDICINE_WORLD_ID,
    initialRecords: WINTER_MEDICINE_RECORDS,
  });