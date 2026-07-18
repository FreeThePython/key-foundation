import { describe, expect, it } from "vitest";
import { applyPlayerAction, assertInvariants, createInitialState } from "./simulation";

function reachDecision() {
  let state = createInitialState();
  state = applyPlayerAction(state, { type: "ENTER" });
  state = applyPlayerAction(state, { type: "OBSERVE", subject: "vial" });
  state = applyPlayerAction(state, { type: "ASK", target: "tomas", topic: "Tell me about your daughter" });
  state = applyPlayerAction(state, { type: "OBSERVE", subject: "elian" });
  state = applyPlayerAction(state, { type: "ASK", target: "tomas", topic: "What does the grain have to do with this?" });
  state = applyPlayerAction(state, { type: "ASK", target: "mara", topic: "How will you decide? What is your oath?" });
  return state;
}

describe("Winter Medicine situated-understanding simulation", () => {
  it("resets to the same canonical state", () => {
    expect(createInitialState()).toEqual(createInitialState());
  });

  it("does not begin by exposing the decision", () => {
    const initial = createInitialState();
    expect(initial.phase).toBe("arrival");
    expect(initial.discoveries).toHaveLength(0);

    const blocked = applyPlayerAction(initial, { type: "GIVE_MEDICINE", target: "elian" });
    expect(blocked).toEqual(initial);
  });

  it("unlocks the decision only after core understanding is discovered", () => {
    const state = reachDecision();
    expect(state.phase).toBe("decision");
    expect(state.discoveries.map((item) => item.id)).toEqual(
      expect.arrayContaining(["scarcity", "daughter", "traveler-risk", "grain", "mara-oath"])
    );
    expect(assertInvariants(state)).toEqual([]);
  });

  it("transfers the medicine exactly once after discovery", () => {
    const ready = reachDecision();
    const treated = applyPlayerAction(ready, { type: "GIVE_MEDICINE", target: "elian" });
    const secondAttempt = applyPlayerAction(treated, { type: "GIVE_MEDICINE", target: "tomas" });

    expect(secondAttempt.medicineHolder).toBe("elian");
    expect(secondAttempt.medicineUsed).toBe(true);
    expect(secondAttempt.phase).toBe("concluded");
    expect(assertInvariants(secondAttempt)).toEqual([]);
  });

  it("records causal provenance and discovery timing", () => {
    let state = createInitialState();
    state = applyPlayerAction(state, { type: "ENTER" });
    state = applyPlayerAction(state, { type: "OBSERVE", subject: "vial" });

    expect(state.events.every((event) => event.causes.length > 0)).toBe(true);
    expect(state.discoveries[0].minuteLearned).toBeGreaterThan(0);
    expect(assertInvariants(state)).toEqual([]);
  });

  it("allows the world to resolve after prolonged inaction", () => {
    let state = applyPlayerAction(createInitialState(), { type: "ENTER" });
    state = applyPlayerAction(state, { type: "WAIT", minutes: 45 });

    expect(state.phase).toBe("concluded");
    expect(state.events.some((event) => event.type === "autonomous_resolution")).toBe(true);
  });
});
