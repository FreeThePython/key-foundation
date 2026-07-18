export type AgentId = "mara" | "tomas" | "elian";
export type MedicineHolder = AgentId | "player" | "clinic";

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
  type: string;
  actor: AgentId | "player" | "system";
  description: string;
  causes: string[];
}

export interface WorldState {
  tick: number;
  minutesRemaining: number;
  medicineHolder: MedicineHolder;
  medicineUsed: boolean;
  grainReleased: boolean;
  playerPresent: boolean;
  agents: Record<AgentId, AgentState>;
  events: EventRecord[];
}

export type PlayerAction =
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
    minutesRemaining: 60,
    medicineHolder: "clinic",
    medicineUsed: false,
    grainReleased: false,
    playerPresent: true,
    events: [],
    agents: {
      mara: {
        id: "mara",
        name: "Mara",
        role: "Village healer",
        knowledge: [
          "Only one dose remains.",
          "Tomas concealed supplies during an earlier shortage.",
          "Elian once saved Mara's brother."
        ],
        beliefs: ["Treatment should not be determined by wealth or status."],
        goals: ["Use the medicine where it has the strongest medical justification."],
        fears: ["Breaking her oath", "Losing the village's trust"],
        relationships: {
          mara: relationship(100),
          tomas: relationship(25),
          elian: relationship(75, 30),
          player: relationship(50)
        }
      },
      tomas: {
        id: "tomas",
        name: "Tomas",
        role: "Mill owner and father",
        knowledge: [
          "His daughter is critically ill.",
          "His household funded part of the medicine purchase.",
          "He controls most of the remaining grain."
        ],
        beliefs: ["His family has the strongest claim to the dose."],
        goals: ["Save his daughter", "Retain leverage over the village"],
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
        role: "Injured courier",
        knowledge: [
          "A raiding party may reach the village before dawn.",
          "The warning is credible but not fully verified.",
          "Without treatment his condition will worsen."
        ],
        beliefs: ["The village needs the warning more than it needs his comfort."],
        goals: ["Ensure the warning is acted upon", "Survive if possible"],
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

function appendEvent(state: WorldState, event: Omit<EventRecord, "tick">): WorldState {
  return { ...state, events: [...state.events, { ...event, tick: state.tick + 1 }], tick: state.tick + 1 };
}

export function applyPlayerAction(state: WorldState, action: PlayerAction): WorldState {
  switch (action.type) {
    case "ASK":
      return appendEvent(state, {
        type: "question",
        actor: "player",
        description: `The player asks ${state.agents[action.target].name} about ${action.topic}.`,
        causes: ["player_action"]
      });
    case "PROMISE": {
      const next = structuredClone(state);
      next.agents[action.target].relationships.player.obligation += 20;
      return appendEvent(next, {
        type: "promise",
        actor: "player",
        description: `The player promises ${state.agents[action.target].name}: ${action.promise}`,
        causes: ["player_action"]
      });
    }
    case "SUPPORT": {
      const next = structuredClone(state);
      next.agents[action.target].relationships.player.trust += 10;
      return appendEvent(next, {
        type: "support",
        actor: "player",
        description: `The player publicly supports ${state.agents[action.target].name}.`,
        causes: ["player_action"]
      });
    }
    case "GIVE_MEDICINE": {
      if (state.medicineUsed) return state;
      const next = structuredClone(state);
      next.medicineHolder = action.target;
      next.medicineUsed = true;
      if (action.target === "tomas") {
        next.grainReleased = true;
        next.agents.tomas.relationships.player.trust += 25;
        next.agents.mara.relationships.player.trust -= 15;
      } else if (action.target === "elian") {
        next.agents.elian.relationships.player.trust += 25;
        next.agents.mara.relationships.player.trust += 10;
        next.agents.tomas.relationships.player.trust -= 30;
      }
      return appendEvent(next, {
        type: "medicine_transfer",
        actor: "player",
        description: `The remaining medicine is given to ${state.agents[action.target].name}.`,
        causes: ["player_action", "scarce_resource"]
      });
    }
    case "LEAVE":
      return appendEvent({ ...state, playerPresent: false }, {
        type: "departure",
        actor: "player",
        description: "The player leaves the clinic.",
        causes: ["player_action"]
      });
    case "WAIT":
      return advanceTime(state, action.minutes);
  }
}

export function advanceTime(state: WorldState, minutes: number): WorldState {
  const elapsed = Math.max(1, Math.min(minutes, state.minutesRemaining));
  let next: WorldState = { ...state, minutesRemaining: state.minutesRemaining - elapsed };
  next = appendEvent(next, {
    type: "time_advanced",
    actor: "system",
    description: `${elapsed} minutes pass.`,
    causes: ["time"]
  });

  if (!next.playerPresent && !next.medicineUsed && next.minutesRemaining <= 30) {
    const decisiveAgent: AgentId = next.agents.mara.relationships.elian.obligation > 20 ? "mara" : "tomas";
    next = appendEvent(next, {
      type: "agent_decision",
      actor: decisiveAgent,
      description:
        decisiveAgent === "mara"
          ? "Mara secures the medicine and prepares to treat Elian."
          : "Tomas attempts to seize control of the medicine.",
      causes:
        decisiveAgent === "mara"
          ? ["unpaid_obligation_to_elian", "medical_pressure", "player_absence"]
          : ["fear_for_daughter", "resource_leverage", "player_absence"]
    });
  }

  return next;
}

export function assertInvariants(state: WorldState): string[] {
  const violations: string[] = [];
  if (state.minutesRemaining < 0) violations.push("Time cannot be negative.");
  if (state.medicineUsed && state.medicineHolder === "clinic") {
    violations.push("Used medicine cannot remain in clinic control.");
  }
  for (const event of state.events) {
    if (event.causes.length === 0) violations.push(`Event at tick ${event.tick} has no provenance.`);
  }
  return violations;
}
