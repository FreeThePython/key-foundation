import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { dirname, extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";
import type { Belief, Entity, Event, Memory, Observation, Proposition, WorldTimestamp } from "../../world/primitives";
import type { WinterMedicineActionKind } from "./action-resolution";
import { createWinterMedicineWorld, WINTER_MEDICINE_ENTITIES, WINTER_MEDICINE_GENESIS_TIME } from "./genesis";
import { resolveWinterMedicineTurn } from "./time-progression";

const PORT = Number(process.env.PORT ?? 4173);
const STATIC_ROOT = join(dirname(fileURLToPath(import.meta.url)), "world-lab");

type ProposalStatus = "accepted" | "clarification_required" | "rejected";

interface RuntimeEntry {
  turn: number;
  action: string;
  actionKind: string;
  accepted: boolean;
  elapsedMinutes: number;
  actionEvent: string;
  timeEvent: string;
  actionMutationCount: number;
  timeMutationCount: number;
  worldRevision: number;
  resultingTick: number;
  resultingLocation: string;
  elian: {
    bodyTemperatureC: unknown;
    hydration: unknown;
    respiratoryDistress: unknown;
  };
}

interface PlayerRound {
  round: number;
  action: string;
  response: string;
  elapsedMinutes: number;
  resultingTick: number;
  resultingTime: WorldTimestamp["instant"];
  resultingLocation: string;
  situation: string[];
}

interface ProposalCandidate {
  kind: WinterMedicineActionKind | null;
  action: string;
  target: string | null;
  intent: string;
  confidence: number;
  supported: boolean;
}

interface ActionProposal {
  input: string;
  status: ProposalStatus;
  kind: WinterMedicineActionKind | null;
  action: string;
  actor: string;
  target: string | null;
  intent: string;
  confidence: number;
  supported: boolean;
  validation: string;
  candidates: ProposalCandidate[];
  interpreter: "deterministic-scaffold";
}

interface InterpretationEntry {
  attempt: number;
  input: string;
  status: ProposalStatus;
  action: string;
  intent: string;
  target: string | null;
  confidence: number;
  validation: string;
  candidates: ProposalCandidate[];
  interpreter: "deterministic-scaffold";
  canonicalMutationCount: 0;
  worldRevision: number;
  tick: number;
}

let world = createWinterMedicineWorld();
let actionSequence = 0;
let interpretationSequence = 0;
let runtimeEntries: RuntimeEntry[] = [];
let interpretationEntries: InterpretationEntry[] = [];
let playerRounds: PlayerRound[] = [];

const actionLabels: Record<WinterMedicineActionKind, string> = {
  examine_elian: "Examine Elian",
  search_cabin: "Search the cabin",
  ask_mara_about_medicine: "Ask Mara about the medicine",
  begin_journey_to_rooks_crossing: "Leave for Rook's Crossing",
};

const actionResponses: Record<WinterMedicineActionKind, string> = {
  examine_elian: "You kneel beside Elian and examine him. His skin is burning hot, his breathing is rapid, and he does not respond to you.",
  search_cabin: "You search Mara's shelves and cabinet carefully. You find no medicine you can identify as effective for Elian's condition.",
  ask_mara_about_medicine: "Mara tells you that Rook's Crossing had an apothecary last winter, but she cannot promise that medicine remains there now.",
  begin_journey_to_rooks_crossing: "You leave the warmth of the cabin and step onto the North Forest Road. Driving snow begins covering your tracks behind you.",
};

const genesisScene = [
  "Snow strikes the cabin windows hard enough to rattle the frames.",
  "Elian lies motionless near the fire. Mara kneels beside him while Tomas watches her with open suspicion.",
];

const isoAtTick = (tick: number): WorldTimestamp["instant"] =>
  new Date(Date.parse(WINTER_MEDICINE_GENESIS_TIME.instant) + tick * 5 * 60_000).toISOString() as WorldTimestamp["instant"];

const latestTick = (): number =>
  world.list<Event>("event").reduce((maximum, event) => Math.max(maximum, event.occurredAt.tick), 0);

const getEntity = (id: Entity["id"]): Entity => {
  const entity = world.get<Entity>("entity", id);
  if (!entity) throw new Error(`Missing entity ${id}`);
  return entity;
};

const getLocationName = (locationId: Entity["locationId"]): string => {
  if (!locationId) return "Unknown location";
  const location = world.list<Entity>("entity").find((entry) => String(entry.id) === String(locationId));
  return location?.canonicalName ?? String(locationId);
};

const hasObservation = (predicate: (record: Observation) => boolean): boolean =>
  world.list<Observation>("observation").some(predicate);

const isAt = (entity: Entity, locationEntity: Entity): boolean =>
  String(entity.locationId) === String(locationEntity.id);

const sceneText = (): string[] => {
  const player = getEntity(WINTER_MEDICINE_ENTITIES.player.id);
  const elian = getEntity(WINTER_MEDICINE_ENTITIES.elian.id);
  const examined = hasObservation((entry) => entry.observerId === player.id && entry.sourceEntityIds.includes(elian.id));
  const searched = hasObservation((entry) => entry.rawFeatures.cabinetSearched === true);
  const askedMara = hasObservation((entry) => entry.modality === "testimony" && entry.sourceEntityIds.includes(WINTER_MEDICINE_ENTITIES.mara.id));

  if (isAt(player, WINTER_MEDICINE_ENTITIES.forestRoad)) {
    return [
      "Snow drives across the North Forest Road and erases your tracks almost as soon as you make them.",
      "Rook's Crossing lies somewhere ahead. Behind you, Elian continues to decline in Mara's cabin.",
    ];
  }

  const lines = [...genesisScene];
  if (examined) lines.push("You know Elian is burning with fever, breathing rapidly, and dangerously unresponsive.");
  if (searched) lines.push("The cabin search revealed no medicine you could identify as effective.");
  if (askedMara) lines.push("Your only lead is Mara's uncertain memory of an apothecary at Rook's Crossing.");
  if (latestTick() >= 4) lines.push("The delay is becoming visible. Elian's breathing sounds harsher than it did when you arrived.");
  return lines;
};

const availableActions = (): Array<{ kind: WinterMedicineActionKind; label: string }> => {
  const player = getEntity(WINTER_MEDICINE_ENTITIES.player.id);
  if (!isAt(player, WINTER_MEDICINE_ENTITIES.cabin)) return [];
  return (Object.keys(actionLabels) as WinterMedicineActionKind[]).map((kind) => ({ kind, label: actionLabels[kind] }));
};

const includesAny = (input: string, terms: string[]): boolean => terms.some((term) => input.includes(term));

const candidate = (
  kind: WinterMedicineActionKind | null,
  action: string,
  target: string | null,
  intent: string,
  confidence: number,
  currentlyAvailable: Set<WinterMedicineActionKind>,
): ProposalCandidate => ({
  kind,
  action,
  target,
  intent,
  confidence,
  supported: kind !== null && currentlyAvailable.has(kind),
});

const interpretPlayerInput = (rawInput: string): ActionProposal => {
  const input = rawInput.trim();
  const normalized = input.toLowerCase().replace(/[^a-z0-9'\s-]/g, " ").replace(/\s+/g, " ");
  const currentlyAvailable = new Set(availableActions().map((entry) => entry.kind));

  if (includesAny(normalized, ["check the cabin", "check cabin", "inspect the cabin", "inspect cabin", "look around the cabin", "look around cabin"])) {
    const candidates = [
      candidate("search_cabin", "Search the cabin for medicine or useful supplies", "Mara's Cabin", "locate_medicine", 0.78, currentlyAvailable),
      candidate(null, "Inspect the cabin for danger", "Mara's Cabin", "assess_environmental_threats", 0.58, currentlyAvailable),
      candidate(null, "Check the doors and windows", "Mara's Cabin", "inspect_exits_and_security", 0.55, currentlyAvailable),
    ];
    return {
      input,
      status: "clarification_required",
      kind: null,
      action: "Clarification required",
      actor: "The Traveler",
      target: "Mara's Cabin",
      intent: "inspect_location",
      confidence: 0.62,
      supported: false,
      validation: "The verb ‘check’ is ambiguous here. Choose what you mean before anything changes in canonical reality.",
      candidates,
      interpreter: "deterministic-scaffold",
    };
  }

  let kind: WinterMedicineActionKind | null = null;
  let target: string | null = null;
  let intent = "unknown";
  let confidence = 0.2;

  if (includesAny(normalized, ["examine elian", "check elian", "look at elian", "inspect elian", "check his breathing", "check the patient"])) {
    kind = "examine_elian";
    target = "Elian";
    intent = "assess_patient";
    confidence = 0.94;
  } else if (includesAny(normalized, ["search the cabin", "search cabin", "look for medicine", "check the cabinets", "search the shelves", "find medicine", "look through the cabin", "go through the cabin"])) {
    kind = "search_cabin";
    target = "Mara's Cabin";
    intent = "locate_medicine";
    confidence = 0.92;
  } else if (
    includesAny(normalized, ["ask mara", "talk to mara", "question mara"]) &&
    includesAny(normalized, ["medicine", "apothecary", "help", "where"])
  ) {
    kind = "ask_mara_about_medicine";
    target = "Mara";
    intent = "request_information";
    confidence = 0.91;
  } else if (includesAny(normalized, ["rook's crossing", "rooks crossing", "leave the cabin", "head out", "take the road", "go outside"])) {
    kind = "begin_journey_to_rooks_crossing";
    target = "Rook's Crossing";
    intent = "begin_journey";
    confidence = 0.9;
  }

  const supported = kind !== null && currentlyAvailable.has(kind);
  const status: ProposalStatus = kind && supported ? "accepted" : "rejected";
  const action = kind ? actionLabels[kind] : "No supported action recognized";
  const validation = !kind
    ? "The interpreter could not map this input to a currently implemented action. Nothing has changed in canonical reality."
    : supported
      ? "The proposal maps to an implemented action and is valid in the player's current location. It has not executed yet."
      : "The intent was recognized, but the proposed action is not valid in the player's current situation. Nothing has changed in canonical reality.";

  return {
    input,
    status,
    kind,
    action,
    actor: "The Traveler",
    target,
    intent,
    confidence,
    supported,
    validation,
    candidates: [],
    interpreter: "deterministic-scaffold",
  };
};

const buildView = (notice?: string) => {
  const player = getEntity(WINTER_MEDICINE_ENTITIES.player.id);
  const elian = getEntity(WINTER_MEDICINE_ENTITIES.elian.id);
  const tick = latestTick();
  const events = world.list<Event>("event").sort((left, right) => left.occurredAt.tick - right.occurredAt.tick);
  const observations = world.list<Observation>("observation");
  const memories = world.list<Memory>("memory");
  const beliefs = world.list<Belief>("belief");
  const propositions = world.list<Proposition>("proposition");

  return {
    world: { id: "winter-medicine", title: "Winter Medicine" },
    time: isoAtTick(tick),
    tick,
    location: getLocationName(player.locationId),
    genesis: {
      title: "Genesis",
      time: WINTER_MEDICINE_GENESIS_TIME.instant,
      location: getLocationName(WINTER_MEDICINE_ENTITIES.player.locationId),
      scene: genesisScene,
    },
    rounds: playerRounds,
    scene: sceneText(),
    notice,
    actions: availableActions(),
    runtime: runtimeEntries,
    interpretations: interpretationEntries,
    playerKnowledge: {
      observations: observations.filter((entry) => entry.observerId === player.id).map((entry) => ({
        modality: entry.modality,
        features: entry.rawFeatures,
        confidence: entry.perceptualConfidence,
      })),
      memories: memories.filter((entry) => entry.ownerId === player.id).map((entry) => entry.summary),
    },
    canonical: {
      entities: [elian, player].map((entry) => ({
        id: entry.id,
        name: entry.canonicalName,
        kind: entry.kind,
        locationId: entry.locationId,
        attributes: entry.attributes,
        revision: entry.revision,
      })),
      propositions: propositions.map((entry) => ({
        id: entry.id,
        claim: `${String(entry.subject.id)} ${entry.predicate} ${String(entry.object)}`,
        status: entry.canonicalStatus,
      })),
      events: events.map((entry) => ({
        id: entry.id,
        tick: entry.occurredAt.tick,
        code: entry.descriptionCode,
        kind: entry.kind,
        causes: entry.causes,
      })),
    },
    cognition: {
      beliefs: beliefs.map((entry) => ({
        owner: getEntity(entry.ownerId).canonicalName,
        propositionId: entry.propositionId,
        stance: entry.stance,
        confidence: entry.confidence,
      })),
      memories: memories.map((entry) => ({
        owner: getEntity(entry.ownerId).canonicalName,
        summary: entry.summary,
        confidence: entry.confidence,
      })),
    },
  };
};

const readBody = async (request: IncomingMessage): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks).toString("utf8");
};

const sendJson = (response: ServerResponse, status: number, value: unknown): void => {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(value));
};

const contentTypes: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
};

const serveStatic = async (pathname: string, response: ServerResponse): Promise<boolean> => {
  const requested = pathname === "/" ? "index.html" : pathname.slice(1);
  const safePath = normalize(requested).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = join(STATIC_ROOT, safePath);
  try {
    const info = await stat(filePath);
    if (!info.isFile()) return false;
    response.writeHead(200, {
      "content-type": contentTypes[extname(filePath)] ?? "application/octet-stream",
      "cache-control": "no-store",
    });
    createReadStream(filePath).pipe(response);
    return true;
  } catch {
    return false;
  }
};

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (request.method === "GET" && url.pathname === "/api/state") {
      sendJson(response, 200, buildView());
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/interpret") {
      const body = JSON.parse(await readBody(request)) as { input?: string };
      if (!body.input?.trim()) {
        sendJson(response, 400, { error: "Enter an action for the interpreter." });
        return;
      }
      const proposal = interpretPlayerInput(body.input);
      interpretationSequence += 1;
      interpretationEntries = [...interpretationEntries, {
        attempt: interpretationSequence,
        input: proposal.input,
        status: proposal.status,
        action: proposal.action,
        intent: proposal.intent,
        target: proposal.target,
        confidence: proposal.confidence,
        validation: proposal.validation,
        candidates: proposal.candidates,
        interpreter: proposal.interpreter,
        canonicalMutationCount: 0,
        worldRevision: world.worldRevision,
        tick: latestTick(),
      }];
      console.log(`[interpretation ${interpretationSequence}] ${proposal.status} | ${proposal.input} | mutations 0`);
      sendJson(response, 200, { proposal, state: buildView() });
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/reset") {
      world = createWinterMedicineWorld();
      actionSequence = 0;
      interpretationSequence = 0;
      runtimeEntries = [];
      interpretationEntries = [];
      playerRounds = [];
      sendJson(response, 200, buildView("The world has been reset to genesis."));
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/action") {
      const body = JSON.parse(await readBody(request)) as { kind?: WinterMedicineActionKind };
      if (!body.kind || !(body.kind in actionLabels)) {
        sendJson(response, 400, { error: "Unknown action." });
        return;
      }
      actionSequence += 1;
      const actionTick = latestTick() + 1;
      const actionId = `browser-${actionSequence}-${body.kind}`;
      const result = resolveWinterMedicineTurn(world, {
        actionId,
        kind: body.kind,
        occurredAt: { ...WINTER_MEDICINE_GENESIS_TIME, instant: isoAtTick(actionTick), tick: actionTick },
        deterministicSeed: `winter-medicine-browser:${actionId}`,
      });
      if (!result.ok) {
        sendJson(response, 409, buildView(result.message));
        return;
      }
      const elapsed = Number(result.time.event.payload.elapsedMinutes);
      const player = getEntity(WINTER_MEDICINE_ENTITIES.player.id);
      const elian = getEntity(WINTER_MEDICINE_ENTITIES.elian.id);
      const resultingTick = latestTick();
      const resultingLocation = getLocationName(player.locationId);

      playerRounds = [...playerRounds, {
        round: actionSequence,
        action: actionLabels[body.kind],
        response: actionResponses[body.kind],
        elapsedMinutes: elapsed,
        resultingTick,
        resultingTime: isoAtTick(resultingTick),
        resultingLocation,
        situation: sceneText(),
      }];

      runtimeEntries = [...runtimeEntries, {
        turn: actionSequence,
        action: actionLabels[body.kind],
        actionKind: body.kind,
        accepted: true,
        elapsedMinutes: elapsed,
        actionEvent: result.action.event.descriptionCode,
        timeEvent: result.time.event.descriptionCode,
        actionMutationCount: result.action.commit.appliedMutationIds.length,
        timeMutationCount: result.time.commit.appliedMutationIds.length,
        worldRevision: result.time.commit.worldRevision,
        resultingTick,
        resultingLocation,
        elian: {
          bodyTemperatureC: elian.attributes.bodyTemperatureC,
          hydration: elian.attributes.hydration,
          respiratoryDistress: elian.attributes.respiratoryDistress,
        },
      }];
      console.log(`[turn ${actionSequence}] ${body.kind} | ${elapsed}m | tick ${resultingTick} | revision ${result.time.commit.worldRevision}`);
      sendJson(response, 200, buildView());
      return;
    }
    if (request.method === "GET" && await serveStatic(url.pathname, response)) return;
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "Unknown server error" });
  }
}).listen(PORT, () => {
  console.log(`KEY World Lab running at http://localhost:${PORT}`);
});