import { renderCanonicalPanel } from "./panels/canonical.js";
import { renderCognitionPanel } from "./panels/cognition.js";
import { renderPlayerPanel } from "./panels/player.js";
import { renderRuntimePanel } from "./panels/runtime.js";
import { requireElement } from "./ui.js";

const meta = requireElement("world-meta");
const resetButton = requireElement("reset-button");
const fatalError = requireElement("fatal-error");

const setBusy = (busy) => {
  resetButton.disabled = busy;
  document.querySelectorAll("[data-action]").forEach((button) => {
    button.disabled = busy;
  });
};

const requestJson = async (url, options) => {
  const response = await fetch(url, options);
  const payload = await response.json();
  if (!response.ok && payload.error) throw new Error(payload.error);
  return payload;
};

const render = (state) => {
  const time = new Date(state.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  meta.textContent = `${state.world.title} · Tick ${state.tick} · ${time} · ${state.location}`;
  renderPlayerPanel(state, performAction);
  renderCanonicalPanel(state);
  renderCognitionPanel(state);
  renderRuntimePanel(state);
  fatalError.hidden = true;
};

const showError = (error) => {
  fatalError.textContent = error instanceof Error ? error.message : String(error);
  fatalError.hidden = false;
};

async function loadWorld() {
  setBusy(true);
  try {
    render(await requestJson("/api/state"));
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}

async function performAction(kind) {
  if (!kind) return;
  setBusy(true);
  try {
    render(await requestJson("/api/action", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ kind }),
    }));
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}

async function resetWorld() {
  setBusy(true);
  try {
    render(await requestJson("/api/reset", { method: "POST" }));
  } catch (error) {
    showError(error);
  } finally {
    setBusy(false);
  }
}

resetButton.addEventListener("click", resetWorld);
loadWorld();