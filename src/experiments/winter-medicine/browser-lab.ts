import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createWinterMedicineWorld, WINTER_MEDICINE_ENTITIES, WINTER_MEDICINE_GENESIS_TIME } from "./genesis";
import { resolveWinterMedicineTurn } from "./time-progression";
import type { WinterMedicineActionKind } from "./action-resolution";
import type { Belief, Entity, Event, Memory, Observation, Proposition, WorldTimestamp } from "../../world/primitives";

const PORT = Number(process.env.PORT ?? 4173);

let world = createWinterMedicineWorld();
let actionSequence = 0;

const actionLabels: Record<WinterMedicineActionKind, string> = {
  examine_elian: "Examine Elian",
  search_cabin: "Search the cabin",
  ask_mara_about_medicine: "Ask Mara about the medicine",
  begin_journey_to_rooks_crossing: "Leave for Rook's Crossing",
};

const isoAtTick = (tick: number): WorldTimestamp["instant"] =>
  new Date(Date.parse(WINTER_MEDICINE_GENESIS_TIME.instant) + tick * 5 * 60_000).toISOString() as WorldTimestamp["instant"];

const latestTick = (): number =>
  world.list<Event>("event").reduce((maximum, event) => Math.max(maximum, event.occurredAt.tick), 0);

const getEntity = (id: Entity["id"]): Entity => {
  const entity = world.get<Entity>("entity", id);
  if (!entity) throw new Error(`Missing entity ${id}`);
  return entity;
};

const hasRecord = <T>(recordType: Parameters<typeof world.list<T>>[0], predicate: (record: T) => boolean): boolean =>
  world.list<T>(recordType).some(predicate);

const sceneText = (): string[] => {
  const player = getEntity(WINTER_MEDICINE_ENTITIES.player.id);
  const elian = getEntity(WINTER_MEDICINE_ENTITIES.elian.id);
  const examined = hasRecord<Observation>("observation", (entry) => entry.observerId === player.id && entry.sourceEntityIds.includes(elian.id));
  const searched = hasRecord<Observation>("observation", (entry) => entry.rawFeatures.cabinetSearched === true);
  const askedMara = hasRecord<Observation>("observation", (entry) => entry.modality === "testimony" && entry.sourceEntityIds.includes(WINTER_MEDICINE_ENTITIES.mara.id));

  if (player.locationId === WINTER_MEDICINE_ENTITIES.forestRoad.id) {
    return [
      "Snow drives across the North Forest Road and erases your tracks almost as soon as you make them.",
      "Rook's Crossing lies somewhere ahead. Behind you, Elian continues to decline in Mara's cabin.",
    ];
  }

  const lines = [
    "Snow strikes the cabin windows hard enough to rattle the frames.",
    "Elian lies motionless near the fire. Mara kneels beside him while Tomas watches her with open suspicion.",
  ];
  if (examined) lines.push("You have confirmed that Elian is burning with fever, breathing rapidly, and dangerously unresponsive.");
  if (searched) lines.push("You searched Mara's shelves and cabinet but found no medicine you could identify as effective.");
  if (askedMara) lines.push("Mara remembers an apothecary at Rook's Crossing last winter, but she cannot confirm what remains there now.");
  if (latestTick() >= 4) lines.push("The delay is becoming visible. Elian's breathing sounds harsher than it did when you arrived.");
  return lines;
};

const availableActions = (): Array<{ kind: WinterMedicineActionKind; label: string }> => {
  const player = getEntity(WINTER_MEDICINE_ENTITIES.player.id);
  if (player.locationId !== WINTER_MEDICINE_ENTITIES.cabin.id) return [];
  return (Object.keys(actionLabels) as WinterMedicineActionKind[]).map((kind) => ({ kind, label: actionLabels[kind] }));
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
    title: "Winter Medicine",
    time: isoAtTick(tick),
    tick,
    location: getEntity(player.locationId ?? WINTER_MEDICINE_ENTITIES.cabin.id).canonicalName,
    scene: sceneText(),
    notice,
    actions: availableActions(),
    playerKnowledge: {
      observations: observations.filter((entry) => entry.observerId === player.id).map((entry) => ({
        modality: entry.modality,
        features: entry.rawFeatures,
        confidence: entry.perceptualConfidence,
      })),
      memories: memories.filter((entry) => entry.ownerId === player.id).map((entry) => entry.summary),
    },
    canonical: {
      elian: {
        bodyTemperatureC: elian.attributes.bodyTemperatureC,
        hydration: elian.attributes.hydration,
        respiratoryDistress: elian.attributes.respiratoryDistress,
        revision: elian.revision,
      },
      player: {
        locationId: player.locationId,
        fatigue: player.attributes.fatigue,
        coldExposure: player.attributes.coldExposure,
        revision: player.revision,
      },
      propositions: propositions.map((entry) => ({
        id: entry.id,
        claim: `${String(entry.subject.id)} ${entry.predicate} ${String(entry.object)}`,
        status: entry.canonicalStatus,
      })),
      events: events.map((entry) => ({ tick: entry.occurredAt.tick, code: entry.descriptionCode, kind: entry.kind })),
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

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>KEY World Lab — Winter Medicine</title>
<style>
:root{font-family:Inter,system-ui,sans-serif;color:#e8edf2;background:#0d1117}*{box-sizing:border-box}body{margin:0}.top{padding:20px 24px;border-bottom:1px solid #30363d;background:#161b22;display:flex;justify-content:space-between;gap:20px}.top h1{margin:0;font-size:22px}.meta{color:#9da7b3;font-size:14px}.layout{display:grid;grid-template-columns:minmax(360px,1.4fr) minmax(300px,1fr) minmax(300px,1fr);gap:14px;padding:14px;min-height:calc(100vh - 82px)}.panel{background:#161b22;border:1px solid #30363d;border-radius:10px;padding:18px;overflow:auto}.panel h2{margin:0 0 14px;font-size:16px;text-transform:uppercase;letter-spacing:.08em;color:#9da7b3}.scene{font-family:Georgia,serif;font-size:19px;line-height:1.55}.scene p{margin:0 0 13px}.actions{display:grid;gap:9px;margin-top:20px}button{background:#238636;color:white;border:1px solid #2ea043;border-radius:7px;padding:11px 13px;text-align:left;font-weight:650;cursor:pointer}button:hover{background:#2ea043}button.secondary{background:#21262d;border-color:#484f58}.notice{padding:10px 12px;margin:12px 0;border-left:3px solid #58a6ff;background:#0d2037}.empty{color:#8b949e;font-style:italic}.card{border:1px solid #30363d;border-radius:7px;padding:10px;margin:8px 0;background:#0d1117}.label{font-size:12px;color:#8b949e;text-transform:uppercase}.value{margin-top:3px;word-break:break-word}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.danger{color:#ff7b72}.unknown{color:#d2a8ff}.true{color:#7ee787}details{margin:10px 0}summary{cursor:pointer;color:#58a6ff}pre{white-space:pre-wrap;font-size:12px}@media(max-width:1050px){.layout{grid-template-columns:1fr}.panel{max-height:none}}
</style>
</head>
<body>
<header class="top"><div><h1>KEY World Lab: Winter Medicine</h1><div class="meta">Player experience synchronized with canonical reality and agent cognition</div></div><button class="secondary" onclick="resetWorld()">Reset world</button></header>
<main class="layout"><section class="panel" id="player"></section><section class="panel" id="canonical"></section><section class="panel" id="cognition"></section></main>
<script>
const esc=(v)=>String(v).replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fmt=(v)=>typeof v==='number'?Number(v).toFixed(3).replace(/0+$/,'').replace(/\.$/,''):esc(v);
async function load(){const r=await fetch('/api/state');render(await r.json())}
async function act(kind){const r=await fetch('/api/action',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({kind})});render(await r.json())}
async function resetWorld(){const r=await fetch('/api/reset',{method:'POST'});render(await r.json())}
function render(s){
 document.querySelector('.top .meta').textContent='Tick '+s.tick+' • '+new Date(s.time).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})+' • '+s.location;
 document.querySelector('#player').innerHTML='<h2>Player experience</h2>'+(s.notice?'<div class="notice">'+esc(s.notice)+'</div>':'')+'<div class="scene">'+s.scene.map(x=>'<p>'+esc(x)+'</p>').join('')+'</div><div class="actions">'+(s.actions.length?s.actions.map(a=>'<button onclick="act(\''+a.kind+'\')">'+esc(a.label)+'</button>').join(''):'<div class="empty">No further player actions are implemented from this location yet.</div>')+'</div><h2 style="margin-top:26px">Player knowledge</h2>'+(s.playerKnowledge.observations.length?s.playerKnowledge.observations.map(o=>'<div class="card"><div class="label">'+esc(o.modality)+' observation • confidence '+fmt(o.confidence)+'</div><div class="value">'+esc(JSON.stringify(o.features))+'</div></div>').join(''):'<div class="empty">The player has made no direct observations yet.</div>')+s.playerKnowledge.memories.map(m=>'<div class="card">'+esc(m)+'</div>').join('');
 document.querySelector('#canonical').innerHTML='<h2>Canonical reality</h2><div class="grid">'+Object.entries(s.canonical.elian).map(([k,v])=>'<div class="card"><div class="label">Elian '+esc(k)+'</div><div class="value '+(k==='bodyTemperatureC'?'danger':'')+'">'+fmt(v)+'</div></div>').join('')+Object.entries(s.canonical.player).map(([k,v])=>'<div class="card"><div class="label">Player '+esc(k)+'</div><div class="value">'+fmt(v)+'</div></div>').join('')+'</div><h2 style="margin-top:20px">Canonical propositions</h2>'+s.canonical.propositions.map(p=>'<div class="card"><div class="value">'+esc(p.claim)+'</div><div class="label '+esc(p.status)+'">'+esc(p.status)+'</div></div>').join('')+'<details><summary>Event history ('+s.canonical.events.length+')</summary><pre>'+esc(JSON.stringify(s.canonical.events,null,2))+'</pre></details>';
 document.querySelector('#cognition').innerHTML='<h2>Agent cognition</h2><div class="label">Beliefs are not canonical truth</div>'+s.cognition.beliefs.map(b=>'<div class="card"><div class="label">'+esc(b.owner)+' • '+esc(b.stance)+' • '+fmt(b.confidence)+'</div><div class="value">'+esc(b.propositionId)+'</div></div>').join('')+'<h2 style="margin-top:20px">Memories</h2>'+s.cognition.memories.map(m=>'<div class="card"><div class="label">'+esc(m.owner)+' • confidence '+fmt(m.confidence)+'</div><div class="value">'+esc(m.summary)+'</div></div>').join('');
}
load();
</script>
</body></html>`;

createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
    if (request.method === "GET" && url.pathname === "/") {
      response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
      response.end(html);
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/state") {
      sendJson(response, 200, buildView());
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/reset") {
      world = createWinterMedicineWorld();
      actionSequence = 0;
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
      const elapsed = result.time.event.payload.elapsedMinutes;
      sendJson(response, 200, buildView(`${actionLabels[body.kind]} completed. ${String(elapsed)} minutes passed.`));
      return;
    }
    response.writeHead(404).end("Not found");
  } catch (error) {
    sendJson(response, 500, { error: error instanceof Error ? error.message : "Unknown server error" });
  }
}).listen(PORT, () => {
  console.log(`KEY World Lab running at http://localhost:${PORT}`);
});
