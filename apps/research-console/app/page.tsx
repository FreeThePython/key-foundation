"use client";

import { useMemo, useState } from "react";
import {
  AgentId,
  applyPlayerAction,
  assertInvariants,
  createInitialState,
  WorldState
} from "@/lib/simulation";

type Mode = "experience" | "research";

const quickActions: Array<{ label: string; run: (state: WorldState) => WorldState }> = [
  {
    label: "Ask Mara why she distrusts Tomas",
    run: (state) => applyPlayerAction(state, { type: "ASK", target: "mara", topic: "her distrust of Tomas" })
  },
  {
    label: "Ask Elian what he has not revealed",
    run: (state) => applyPlayerAction(state, { type: "ASK", target: "elian", topic: "the warning he is withholding" })
  },
  {
    label: "Promise Tomas you will consider his daughter first",
    run: (state) => applyPlayerAction(state, { type: "PROMISE", target: "tomas", promise: "I will consider your daughter first." })
  },
  {
    label: "Give the medicine to Tomas's daughter",
    run: (state) => applyPlayerAction(state, { type: "GIVE_MEDICINE", target: "tomas" })
  },
  {
    label: "Give the medicine to Elian",
    run: (state) => applyPlayerAction(state, { type: "GIVE_MEDICINE", target: "elian" })
  },
  {
    label: "Leave the clinic",
    run: (state) => applyPlayerAction(state, { type: "LEAVE" })
  },
  {
    label: "Wait 15 minutes",
    run: (state) => applyPlayerAction(state, { type: "WAIT", minutes: 15 })
  }
];

function CharacterCard({ state, id }: { state: WorldState; id: AgentId }) {
  const agent = state.agents[id];
  return (
    <article className="card">
      <div className="eyebrow">{agent.role}</div>
      <h3>{agent.name}</h3>
      <p>{agent.goals[0]}</p>
      <div className="meter-row">
        <span>Trust in you</span>
        <strong>{agent.relationships.player.trust}</strong>
      </div>
    </article>
  );
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("experience");
  const [state, setState] = useState<WorldState>(() => createInitialState());
  const [notes, setNotes] = useState("");
  const violations = useMemo(() => assertInvariants(state), [state]);

  return (
    <main>
      <header className="topbar">
        <div>
          <div className="eyebrow">KEY Research Console</div>
          <h1>The Winter Medicine</h1>
        </div>
        <div className="topbar-actions">
          <div className="mode-switch" aria-label="View mode">
            <button className={mode === "experience" ? "active" : ""} onClick={() => setMode("experience")}>Experience</button>
            <button className={mode === "research" ? "active" : ""} onClick={() => setMode("research")}>Research</button>
          </div>
          <button className="secondary" onClick={() => setState(createInitialState())}>Reset</button>
        </div>
      </header>

      <section className="status-strip">
        <span>Tick {state.tick}</span>
        <span>{state.minutesRemaining} minutes remain</span>
        <span>Medicine: {state.medicineUsed ? `given to ${state.medicineHolder}` : `held by ${state.medicineHolder}`}</span>
        <span>Grain: {state.grainReleased ? "released" : "withheld"}</span>
      </section>

      <div className={mode === "research" ? "workspace research-open" : "workspace"}>
        <section className="experience-panel">
          <div className="scene card">
            <div className="eyebrow">Village clinic · Morning · Heavy snow</div>
            <h2>One dose. Two patients. One hour.</h2>
            <p>
              Mara keeps the final vial beside the stove. Tomas stands between her and the door, demanding it for his daughter. Elian lies against the wall, injured after crossing the pass with a warning he has not fully shared.
            </p>
            <p>
              Tomas controls most of the village grain. Mara has sworn that wealth will not decide who receives treatment. No help can reach the village before the decision becomes irreversible.
            </p>
          </div>

          <div className="character-grid">
            <CharacterCard state={state} id="mara" />
            <CharacterCard state={state} id="tomas" />
            <CharacterCard state={state} id="elian" />
          </div>

          <section className="card">
            <div className="eyebrow">What do you do?</div>
            <div className="action-list">
              {quickActions.map((action) => (
                <button key={action.label} onClick={() => setState((current) => action.run(current))}>{action.label}</button>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="eyebrow">Your research notes</div>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Who do you trust? What feels forced? What outcome do you expect?"
            />
          </section>
        </section>

        {mode === "research" && (
          <aside className="research-panel">
            <section className="card inspector">
              <div className="eyebrow">Canonical state</div>
              <pre>{JSON.stringify({
                tick: state.tick,
                minutesRemaining: state.minutesRemaining,
                medicineHolder: state.medicineHolder,
                medicineUsed: state.medicineUsed,
                grainReleased: state.grainReleased,
                playerPresent: state.playerPresent
              }, null, 2)}</pre>
            </section>

            <section className="card inspector">
              <div className="eyebrow">Agent internals</div>
              {Object.values(state.agents).map((agent) => (
                <details key={agent.id}>
                  <summary>{agent.name}</summary>
                  <strong>Knowledge</strong>
                  <ul>{agent.knowledge.map((item) => <li key={item}>{item}</li>)}</ul>
                  <strong>Beliefs</strong>
                  <ul>{agent.beliefs.map((item) => <li key={item}>{item}</li>)}</ul>
                  <strong>Fears</strong>
                  <ul>{agent.fears.map((item) => <li key={item}>{item}</li>)}</ul>
                </details>
              ))}
            </section>

            <section className="card inspector">
              <div className="eyebrow">Causal event ledger</div>
              {state.events.length === 0 ? <p>No events yet.</p> : state.events.slice().reverse().map((event) => (
                <div className="event" key={`${event.tick}-${event.description}`}>
                  <strong>Tick {event.tick}: {event.type}</strong>
                  <p>{event.description}</p>
                  <small>Causes: {event.causes.join(", ")}</small>
                </div>
              ))}
            </section>

            <section className="card inspector">
              <div className="eyebrow">Invariant checks</div>
              {violations.length === 0 ? <p className="pass">All current invariants pass.</p> : (
                <ul>{violations.map((violation) => <li key={violation}>{violation}</li>)}</ul>
              )}
            </section>
          </aside>
        )}
      </div>
    </main>
  );
}
