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

const people: Array<{ id: AgentId; label: string }> = [
  { id: "mara", label: "Mara" },
  { id: "tomas", label: "The man by the door" },
  { id: "elian", label: "The injured traveler" }
];

function action(state: WorldState, next: Parameters<typeof applyPlayerAction>[1], setState: (value: WorldState) => void) {
  setState(applyPlayerAction(state, next));
}

export default function Home() {
  const [mode, setMode] = useState<Mode>("experience");
  const [state, setState] = useState<WorldState>(() => createInitialState());
  const [notes, setNotes] = useState("");
  const [questionTarget, setQuestionTarget] = useState<AgentId>("mara");
  const [question, setQuestion] = useState("");
  const violations = useMemo(() => assertInvariants(state), [state]);
  const researchUnlocked = state.phase === "concluded";

  function reset() {
    setState(createInitialState());
    setMode("experience");
    setNotes("");
    setQuestion("");
  }

  function askQuestion() {
    const trimmed = question.trim();
    if (!trimmed) return;
    setState((current) => applyPlayerAction(current, { type: "ASK", target: questionTarget, topic: trimmed }));
    setQuestion("");
  }

  return (
    <main>
      <header className="topbar">
        <div>
          <div className="eyebrow">KEY · Experiment 0001</div>
          <h1>The Winter Medicine</h1>
        </div>
        <div className="topbar-actions">
          <div className="mode-switch" aria-label="View mode">
            <button className={mode === "experience" ? "active" : ""} onClick={() => setMode("experience")}>Experience</button>
            <button
              className={mode === "research" ? "active" : ""}
              disabled={!researchUnlocked}
              title={researchUnlocked ? "Open the reflection laboratory" : "Research mode unlocks after the session ends"}
              onClick={() => researchUnlocked && setMode("research")}
            >
              Research {researchUnlocked ? "" : "(sealed)"}
            </button>
          </div>
          <button className="secondary" onClick={reset}>New session</button>
        </div>
      </header>

      <section className="status-strip player-safe">
        <span>Session phase: {state.phase}</span>
        <span>Time has passed: {state.elapsedMinutes} minutes</span>
        <span>Discoveries: {state.discoveries.length}</span>
      </section>

      <div className={mode === "research" ? "workspace research-open" : "workspace"}>
        <section className="experience-panel">
          <section className="scene card">
            <div className="eyebrow">A remote mountain village · winter</div>
            <p className="narration">{state.lastNarration}</p>
          </section>

          {state.phase === "arrival" && (
            <section className="card primary-action">
              <div className="eyebrow">What do you do?</div>
              <button onClick={() => action(state, { type: "ENTER" }, setState)}>Enter the cottage</button>
              <button className="quiet" onClick={() => action(state, { type: "WAIT", minutes: 5 }, setState)}>Wait outside and listen</button>
            </section>
          )}

          {state.phase !== "arrival" && state.phase !== "concluded" && (
            <>
              <section className="card">
                <div className="eyebrow">Observe</div>
                <p className="helper">Look closely. Observation may confirm things nobody has said aloud.</p>
                <div className="action-list">
                  <button onClick={() => action(state, { type: "OBSERVE", subject: "room" }, setState)}>Study the room</button>
                  <button onClick={() => action(state, { type: "OBSERVE", subject: "vial" }, setState)}>Examine the vial</button>
                  <button onClick={() => action(state, { type: "OBSERVE", subject: "elian" }, setState)}>Examine the injured traveler</button>
                  <button onClick={() => action(state, { type: "OBSERVE", subject: "tomas" }, setState)}>Watch the man by the door</button>
                </div>
              </section>

              <section className="card">
                <div className="eyebrow">Ask a question</div>
                <p className="helper">Ask in your own words. The answer depends on whom you ask and what you ask about.</p>
                <div className="question-row">
                  <select value={questionTarget} onChange={(event) => setQuestionTarget(event.target.value as AgentId)}>
                    {people.map((person) => <option key={person.id} value={person.id}>{person.label}</option>)}
                  </select>
                  <input
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && askQuestion()}
                    placeholder="What do you want to know?"
                  />
                  <button onClick={askQuestion}>Ask</button>
                </div>
                <div className="prompt-hints">
                  <span>Try asking about the room, the medicine, a patient, the village, the pass, or why someone is here.</span>
                </div>
              </section>

              <section className="card">
                <div className="eyebrow">Other actions</div>
                <div className="action-list">
                  <button onClick={() => action(state, { type: "WAIT", minutes: 5 }, setState)}>Wait five minutes</button>
                  <button onClick={() => action(state, { type: "LEAVE" }, setState)}>Leave the cottage</button>
                </div>
              </section>
            </>
          )}

          {state.phase === "decision" && !state.medicineUsed && (
            <section className="card decision-card">
              <div className="eyebrow">A decision can no longer be avoided</div>
              <h2>What do you tell Mara to do?</h2>
              <p>You may continue investigating, wait, leave, or intervene now.</p>
              <div className="action-list">
                <button onClick={() => action(state, { type: "GIVE_MEDICINE", target: "tomas" }, setState)}>Use the treatment for Tomas's daughter</button>
                <button onClick={() => action(state, { type: "GIVE_MEDICINE", target: "elian" }, setState)}>Use the treatment for the injured traveler</button>
              </div>
            </section>
          )}

          {state.phase === "concluded" && (
            <section className="card conclusion">
              <div className="eyebrow">Session complete</div>
              <h2>Your playthrough is now sealed.</h2>
              <p>{state.lastNarration}</p>
              <p>You can now open Research Mode to inspect what the world knew, what each person knew, and how your actions changed the state.</p>
              <button onClick={() => setMode("research")}>Open the reflection laboratory</button>
            </section>
          )}

          <section className="card notebook">
            <div className="eyebrow">Your notebook</div>
            <div className="discoveries">
              {state.discoveries.length === 0 ? (
                <p className="helper">Nothing has been confirmed yet.</p>
              ) : state.discoveries.map((item) => (
                <div className="discovery" key={item.id}>
                  <strong>{item.text}</strong>
                  <small>Learned from {item.source} · minute {item.minuteLearned}</small>
                </div>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What do you think is happening? Who do you trust? What are you uncertain about?"
            />
          </section>
        </section>

        {mode === "research" && researchUnlocked && (
          <aside className="research-panel">
            <section className="card inspector">
              <div className="eyebrow">Canonical state</div>
              <pre>{JSON.stringify({
                tick: state.tick,
                elapsedMinutes: state.elapsedMinutes,
                phase: state.phase,
                medicineHolder: state.medicineHolder,
                medicineUsed: state.medicineUsed,
                grainReleased: state.grainReleased,
                playerPresent: state.playerPresent
              }, null, 2)}</pre>
            </section>

            <section className="card inspector">
              <div className="eyebrow">Distributed cognition</div>
              {Object.values(state.agents).map((agent) => (
                <details key={agent.id}>
                  <summary>{agent.name} · {agent.role}</summary>
                  <strong>Knowledge</strong>
                  <ul>{agent.knowledge.map((item) => <li key={item}>{item}</li>)}</ul>
                  <strong>Beliefs</strong>
                  <ul>{agent.beliefs.map((item) => <li key={item}>{item}</li>)}</ul>
                  <strong>Goals</strong>
                  <ul>{agent.goals.map((item) => <li key={item}>{item}</li>)}</ul>
                  <strong>Fears</strong>
                  <ul>{agent.fears.map((item) => <li key={item}>{item}</li>)}</ul>
                </details>
              ))}
            </section>

            <section className="card inspector">
              <div className="eyebrow">Player discovery trail</div>
              {state.discoveries.map((item) => (
                <div className="event" key={item.id}>
                  <strong>Minute {item.minuteLearned}</strong>
                  <p>{item.text}</p>
                  <small>Source: {item.source}</small>
                </div>
              ))}
            </section>

            <section className="card inspector">
              <div className="eyebrow">Causal event ledger</div>
              {state.events.length === 0 ? <p>No events recorded.</p> : state.events.slice().reverse().map((event) => (
                <div className="event" key={`${event.tick}-${event.description}`}>
                  <strong>Tick {event.tick} · minute {event.minute} · {event.type}</strong>
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
