import { describe, expect, it } from "vitest";
import { applyPlayerAction, assertInvariants, createInitialState } from "./simulation";

describe("Winter Medicine simulation", () => {
  it("resets to the same canonical state", () => {
    expect(createInitialState()).toEqual(createInitialState());
  });

  it("transfers the medicine exactly once", () => {
    const initial = createInitialState();
    const treated = applyPlayerAction(initial, { type: "GIVE_MEDICINE", target: "elian" });
    const secondAttempt = applyPlayerAction(treated, { type: "GIVE_MEDICINE", target: "tomas" });

    expect(secondAttempt.medicineHolder).toBe("elian");
    expect(secondAttempt.medicineUsed).toBe(true);
    expect(assertInvariants(secondAttempt)).toEqual([]);
  });

  it("records provenance for every event", () => {
    const state = applyPlayerAction(createInitialState(), { type: "WAIT", minutes: 15 });
    expect(state.events.every((event) => event.causes.length > 0)).toBe(true);
    expect(assertInvariants(state)).toEqual([]);
  });

  it("changes relationships according to the selected treatment", () => {
    const initial = createInitialState();
    const elianTreated = applyPlayerAction(initial, { type: "GIVE_MEDICINE", target: "elian" });
    const tomasTreated = applyPlayerAction(initial, { type: "GIVE_MEDICINE", target: "tomas" });

    expect(elianTreated.agents.tomas.relationships.player.trust).toBeLessThan(
      tomasTreated.agents.tomas.relationships.player.trust
    );
    expect(tomasTreated.grainReleased).toBe(true);
  });
});
