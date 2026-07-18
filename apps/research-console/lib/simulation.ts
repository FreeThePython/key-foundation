export type AgentId = "mara" | "tomas" | "elian";
export type MedicineHolder = AgentId | "player" | "clinic";
export type SessionPhase = "arrival" | "discovery" | "decision" | "concluded";

export interface RelationshipState {
  trust: number;
  obligation: number;
}

export interface AgentState {
  id: AgentId;
  name: string;
  role: string;
  knowledge: string[];
  beliefs: string[];
  goals: string[];
  fears: string[];
  relationships: Record<AgentId | "player", RelationshipState>;
}

export interface EventRecord {
  tick: number;
  minute: number;
  type: string;
  actor: AgentId | "player" | "system";
  description: string;
  causes: string[];
}

export interface DiscoveryRecord {
  id: string;
  text: string;
  source: string;
  minuteLearned: number;
}

export interface WorldState {
  tick: number;
  elapsedMinutes: number;
  phase: SessionPhase;
  medicineHolder: MedicineHolder;
  medicineUsed: boolean;
  grainReleased: boolean;
  playerPresent: boolean;
  discoveries: DiscoveryRecord[];
  availableActions: string[];
  lastNarration: string;
  agents: Record<AgentId, AgentState>;
  events: EventRecord[];
}

export type PlayerAction =
  | { type: "ENTER" }
  | { type: "OBSERVE"; subject: "room" | "vial" | "elian" | "tomas" }
  | { type: "ASK"; target: AgentId; topic: string }
  | { type: "PROMISE"; target: AgentId; promise: string }
  | { type: "GIVE_MEDICINE"; target: AgentId }
  | { type: "SUPPORT"; target: AgentId }
  | { type: "LEAVE" }
  | { type: "WAIT"; minutes: number };

const relationship = (trust: number, obligation = 0): RelationshipState => ({ trust, obligation });

export function createInitialState(): WorldState {
  return {
    tick: 0,
    elapsedMinutes: 0,
    phase: "arrival",
    medicineHolder: "clinic",
    medicineUsed: false,
    grainReleased: false,
    playerPresent: true,
    discoveries: [],
    availableActions: ["enter"],
    lastNarration:
      "Snow drives sideways across the village lane. Raised voices carry through the healer's cottage door, followed by a sharp cough and the scrape of furniture.",
    events: [],
    agents: {
      mara: {
        id: "mara",
        name: "Mara",
        role: "Village healer",
        knowledge: [
          "Only one dose remains.",
          "The two patients face different medical risks.",
          "Tomas concealed supplies during an earlier shortage."
        ],
        beliefs: ["Treatment should not be determined by wealth or status."],
        goals: ["Make a medically defensible decision without surrendering the village to coercion."],
        fears: ["Breaking her oath", "Losing the village's trust"],
        relationships: {
          mara: relationship(100),
          tomas: relationship(25),
          elian: relationship(70, 20),
          player: relationship(50)
        }
      },
      tomas: {
        id: "tomas",
        name: "Tomas",
        role: "Mill owner",
        knowledge: [
          "His daughter is dangerously ill in the adjoining room.",
          "His household helped pay for the medicine shipment.",
          "He controls most of the remaining grain."
        ],
        beliefs: ["His family has the strongest claim to the remaining dose."],
        goals: ["Protect his daughter", "Preserve his leverage"],
        fears: ["His daughter's death", "Powerlessness"],
        relationships: {
          mara: relationship(20),
          tomas: relationship(100),
          elian: relationship(35),
          player: relationship(50)
        }
      },
      elian: {
        id: "elian",
        name: "Elian",
        role: "Injured traveler",
        knowledge: [
          "He crossed the mountain pass for a reason he has not fully explained.",
          "His warning is serious but contains uncertainty.",
          "His condition will worsen without care."
        ],
        beliefs: ["What he learned may matter more than his own survival."],
        goals: ["Make certain the village understands the danger", "Survive if possible"],
        fears: ["Dying unheard", "Causing panic without enough proof"],
        relationships: {
          mara: relationship(70),
          tomas: relationship(30),
          elian: relationship(100),
          player: relationship(50)
        }
      }
    }
  };
}

function appendEvent(state: WorldState, event: Omit<EventRecord, "tick" | "minute">): WorldState {
  const tick = state.tick + 1;
  return {
    ...state,
    tick,
    events: [...state.events, { ...event, tick, minute: state.elapsedMinutes }]
  };
}

function discover(state: WorldState, id: string, text: string, source: string): WorldState {
  if (state.discoveries.some((item) => item.id === id)) return state;
  return {
    ...state,
    discoveries: [...state.discoveries, { id, text, source, minuteLearned: state.elapsedMinutes }]
  };
}

function spendTime(state: WorldState, minutes: number): WorldState {
  return { ...state, elapsedMinutes: state.elapsedMinutes + Math.max(1, minutes) };
}

function hasDiscovery(state: WorldState, id: string): boolean {
  return state.discoveries.some((item) => item.id === id);
}

function updatePhase(state: WorldState): WorldState {
  if (state.phase === "concluded" || state.medicineUsed) return { ...state, phase: "concluded" };
  const coreUnderstanding = ["scarcity", "daughter", "traveler-risk", "grain", "mara-oath"];
  if (coreUnderstanding.every((id) => hasDiscovery(state, id))) {
    return { ...state, phase: "decision" };
  }
  return state.phase === "arrival" ? state : { ...state, phase: "discovery" };
}

function narrateAsk(state: WorldState, target: AgentId, topic: string): WorldState {
  const normalized = topic.toLowerCase();
  let next = state;
  let narration = `${state.agents[target].name} considers the question but gives you little more than you already knew.`;

  if (target === "mara" && (normalized.includes("medicine") || normalized.includes("vial") || normalized.includes("patient"))) {
    next = discover(next, "scarcity", "Only one usable dose remains.", "Mara");
    narration = "Mara glances toward the small vial near the stove. ‘One dose,’ she says. ‘Not one dose each. One.’";
  } else if (target === "mara" && (normalized.includes("oath") || normalized.includes("decide") || normalized.includes("tomas"))) {
    next = discover(next, "mara-oath", "Mara has sworn that status and wealth will not determine treatment.", "Mara");
    narration = "Mara keeps her voice low. She says the village entrusted her to treat need, not rank, payment, or intimidation.";
  } else if (target === "tomas" && (normalized.includes("daughter") || normalized.includes("child") || normalized.includes("sick"))) {
    next = discover(next, "daughter", "Tomas's young daughter is dangerously ill in the adjoining room.", "Tomas");
    narration = "Tomas points toward the adjoining room. His anger breaks for a moment when another thin cough comes through the wall.";
  } else if (target === "tomas" && (normalized.includes("grain") || normalized.includes("village") || normalized.includes("leverage"))) {
    next = discover(next, "grain", "Tomas controls most of the village's remaining grain stores.", "Tomas");
    narration = "Tomas says his mill and storehouse are carrying the village through winter. He does not plainly state what he will do if refused.";
  } else if (target === "elian" && (normalized.includes("wound") || normalized.includes("injury") || normalized.includes("condition"))) {
    next = discover(next, "traveler-risk", "Elian is seriously injured and may deteriorate without treatment.", "Observation confirmed by Elian");
    narration = "Elian struggles to answer. His bandage is already darkening, and Mara tells him to stop wasting breath.";
  } else if (target === "elian" && (normalized.includes("pass") || normalized.includes("warning") || normalized.includes("why"))) {
    next = discover(next, "warning", "Elian crossed the closed pass to deliver an urgent but incompletely verified warning.", "Elian");
    narration = "Elian says he crossed the pass because waiting for certainty might leave the village no time at all. He still hesitates over part of what he saw.";
  }

  next = { ...next, lastNarration: narration, phase: "discovery" };
  next = spendTime(next, 4);
  next = appendEvent(next, {
    type: "question",
    actor: "player",
    description: `The player asks ${state.agents[target].name} about ${topic}.`,
    causes: ["player_action", "distributed_knowledge"]
  });
  return updatePhase(next);
}

export function applyPlayerAction(state: WorldState, action: PlayerAction): WorldState {
  if (state.phase === "concluded" && action.type !== "WAIT") return state;

  switch (action.type) {
    case "ENTER": {
      let next = { ...state, phase: "discovery" as const };
      next = spendTime(next, 1);
      next = {
        ...next,
        lastNarration:
          "You enter a cramped, overheated cottage. Mara stands near the stove. A broad-shouldered man blocks part of the room. An injured traveler rests against the far wall. A child coughs behind a closed inner door."
      };
      return appendEvent(next, {
        type: "arrival",
        actor: "player",
        description: "The player enters the healer's cottage.",
        causes: ["player_action"]
      });
    }
    case "OBSERVE": {
      let next = state;
      let narration = "You take a moment to study what is happening.";
      if (action.subject === "room") {
        narration = "The room has been rearranged in haste. Two basins, bloodied cloth, a kettle, and a single stoppered vial sit within Mara's reach.";
      } else if (action.subject === "vial") {
        next = discover(next, "scarcity", "Only one usable dose remains.", "Direct observation");
        narration = "The vial is nearly empty. The measure marks indicate there is enough for one full treatment, not two partial ones.";
      } else if (action.subject === "elian") {
        next = discover(next, "traveler-risk", "The injured traveler may deteriorate without treatment.", "Direct observation");
        narration = "The traveler is pale, shivering despite the heat, and guarding a wound beneath a soaked bandage.";
      } else if (action.subject === "tomas") {
        narration = "The man near the door looks exhausted rather than composed. Each time the child coughs, his attention snaps toward the inner room.";
      }
      next = { ...next, lastNarration: narration, phase: "discovery" };
      next = spendTime(next, 2);
      next = appendEvent(next, {
        type: "observation",
        actor: "player",
        description: `The player observes ${action.subject}.`,
        causes: ["player_action", "perception"]
      });
      return updatePhase(next);
    }
    case "ASK":
      return narrateAsk(state, action.target, action.topic);
    case "PROMISE": {
      const next = structuredClone(state);
      next.agents[action.target].relationships.player.obligation += 20;
      next.lastNarration = `${next.agents[action.target].name} studies you carefully, taking the promise seriously.`;
      return appendEvent(spendTime(next, 2), {
        type: "promise",
        actor: "player",
        description: `The player promises ${state.agents[action.target].name}: ${action.promise}`,
        causes: ["player_action", "social_commitment"]
      });
    }
    case "SUPPORT": {
      const next = structuredClone(state);
      next.agents[action.target].relationships.player.trust += 10;
      next.lastNarration = `You publicly support ${next.agents[action.target].name}. The others notice.`;
      return appendEvent(spendTime(next, 2), {
        type: "support",
        actor: "player",
        description: `The player publicly supports ${state.agents[action.target].name}.`,
        causes: ["player_action", "witnessed_social_action"]
      });
    }
    case "GIVE_MEDICINE": {
      if (state.medicineUsed || state.phase !== "decision") return state;
      const next = structuredClone(state);
      next.medicineHolder = action.target;
      next.medicineUsed = true;
      next.phase = "concluded";
      next.lastNarration = "Your intervention breaks the deadlock. For a moment, nobody speaks. Then the cottage erupts into motion.";
      if (action.target === "tomas") {
        next.agents.tomas.relationships.player.trust += 25;
        next.agents.mara.relationships.player.trust -= 10;
      } else if (action.target === "elian") {
        next.agents.elian.relationships.player.trust += 25;
        next.agents.mara.relationships.player.trust += 5;
        next.agents.tomas.relationships.player.trust -= 30;
      }
      return appendEvent(spendTime(next, 2), {
        type: "medicine_transfer",
        actor: "player",
        description: `The remaining medicine is directed to ${state.agents[action.target].name}.`,
        causes: ["player_action", "scarce_resource", "accumulated_understanding"]
      });
    }
    case "LEAVE": {
      const next = {
        ...state,
        playerPresent: false,
        phase: "concluded" as const,
        lastNarration: "You step back into the storm, leaving those inside to resolve the crisis without you."
      };
      return appendEvent(spendTime(next, 1), {
        type: "departure",
        actor: "player",
        description: "The player leaves the cottage.",
        causes: ["player_action"]
      });
    }
    case "WAIT":
      return advanceTime(state, action.minutes);
  }
}

export function advanceTime(state: WorldState, minutes: number): WorldState {
  const elapsed = Math.max(1, minutes);
  let next: WorldState = spendTime(state, elapsed);
  next = {
    ...next,
    lastNarration: `You wait. ${elapsed} minutes pass, and the tension in the cottage changes while nobody remains still.`
  };
  next = appendEvent(next, {
    type: "time_advanced",
    actor: "system",
    description: `${elapsed} minutes pass.`,
    causes: ["time"]
  });

  if (!next.medicineUsed && next.elapsedMinutes >= 45) {
    next = {
      ...next,
      phase: "concluded",
      lastNarration: "The argument ends without your direction. Events have moved beyond the point where your earlier options remain available."
    };
    next = appendEvent(next, {
      type: "autonomous_resolution",
      actor: "system",
      description: "The local crisis resolves after prolonged player inaction.",
      causes: ["time_pressure", "agent_goals", "player_inaction"]
    });
  }

  return updatePhase(next);
}

export function assertInvariants(state: WorldState): string[] {
  const violations: string[] = [];
  if (state.elapsedMinutes < 0) violations.push("Elapsed time cannot be negative.");
  if (state.medicineUsed && state.medicineHolder === "clinic") {
    violations.push("Used medicine cannot remain in clinic control.");
  }
  if (state.phase === "decision" && state.discoveries.length === 0) {
    violations.push("Decision phase requires prior discovery.");
  }
  for (const event of state.events) {
    if (event.causes.length === 0) violations.push(`Event at tick ${event.tick} has no provenance.`);
  }
  return violations;
}
