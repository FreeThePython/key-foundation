import { escapeHtml, formatValue } from "../ui.js";

const fahrenheit = (celsius) => `${(Number(celsius) * 9 / 5 + 32).toFixed(1)}°F`;

export const renderRuntimePanel = (state) => {
  const panel = document.getElementById("runtime-panel");
  if (!panel) throw new Error("Missing runtime panel");

  const entries = state.runtime?.length
    ? [...state.runtime].reverse().map((entry) => `
      <article class="runtime-entry">
        <div class="runtime-heading">
          <strong>Turn ${formatValue(entry.turn)} · ${escapeHtml(entry.action)}</strong>
          <span class="runtime-ok">Accepted</span>
        </div>
        <div class="runtime-grid">
          <div><span class="label">Duration</span><div>${formatValue(entry.elapsedMinutes)} minutes</div></div>
          <div><span class="label">Result</span><div>Tick ${formatValue(entry.resultingTick)} · revision ${formatValue(entry.worldRevision)}</div></div>
          <div><span class="label">Events</span><div>${escapeHtml(entry.actionEvent)} → ${escapeHtml(entry.timeEvent)}</div></div>
          <div><span class="label">Mutations</span><div>${formatValue(entry.actionMutationCount)} action + ${formatValue(entry.timeMutationCount)} time</div></div>
          <div><span class="label">Location</span><div>${escapeHtml(entry.resultingLocation)}</div></div>
          <div><span class="label">Elian after turn</span><div>${fahrenheit(entry.elian.bodyTemperatureC)} · hydration ${Math.round(Number(entry.elian.hydration) * 100)}% · distress ${formatValue(entry.elian.respiratoryDistress)}</div></div>
        </div>
      </article>`).join("")
    : '<div class="empty">No turns have executed yet. Choose an action to inspect what the engine commits.</div>';

  panel.innerHTML = `
    <h2 class="panel-title">Runtime Console</h2>
    <div class="panel-subtitle">Execution trace for validated actions and time progression.</div>
    ${entries}
  `;
};