import { escapeHtml, formatValue } from "../ui.js";

const fahrenheit = (celsius) => `${(Number(celsius) * 9 / 5 + 32).toFixed(1)}°F`;

const renderInterpretation = (entry) => {
  const statusClass = entry.status === "accepted"
    ? "runtime-ok"
    : entry.status === "clarification_required"
      ? "runtime-warn"
      : "runtime-rejected";
  const statusLabel = entry.status === "accepted"
    ? "Accepted interpretation"
    : entry.status === "clarification_required"
      ? "Clarification required"
      : "Rejected";
  const candidates = entry.candidates?.length
    ? entry.candidates.map((candidate) => `${candidate.action}${candidate.supported ? " (implemented)" : " (not implemented)"}`).join(" · ")
    : "None";

  return `
    <article class="runtime-entry interpretation-entry">
      <div class="runtime-heading">
        <strong>Interpretation ${formatValue(entry.attempt)} · “${escapeHtml(entry.input)}”</strong>
        <span class="${statusClass}">${statusLabel}</span>
      </div>
      <div class="runtime-grid">
        <div><span class="label">Resolved action</span><div>${escapeHtml(entry.action)}</div></div>
        <div><span class="label">Intent</span><div>${escapeHtml(entry.intent)}</div></div>
        <div><span class="label">Target</span><div>${escapeHtml(entry.target ?? "Not resolved")}</div></div>
        <div><span class="label">Confidence</span><div>${formatValue(entry.confidence)}</div></div>
        <div><span class="label">Canonical mutations</span><div>${formatValue(entry.canonicalMutationCount)}</div></div>
        <div><span class="label">World remained</span><div>Tick ${formatValue(entry.tick)} · revision ${formatValue(entry.worldRevision)}</div></div>
        <div class="runtime-wide"><span class="label">Reason</span><div>${escapeHtml(entry.validation)}</div></div>
        <div class="runtime-wide"><span class="label">Candidates</span><div>${escapeHtml(candidates)}</div></div>
        <div><span class="label">Interpreter</span><div>${escapeHtml(entry.interpreter)}</div></div>
      </div>
    </article>`;
};

const renderTurn = (entry) => `
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
  </article>`;

export const renderRuntimePanel = (state) => {
  const panel = document.getElementById("runtime-panel");
  if (!panel) throw new Error("Missing runtime panel");

  const interpretations = state.interpretations?.length
    ? [...state.interpretations].reverse().map(renderInterpretation).join("")
    : '<div class="empty">No free-form interpretation attempts yet.</div>';

  const turns = state.runtime?.length
    ? [...state.runtime].reverse().map(renderTurn).join("")
    : '<div class="empty">No validated turns have executed yet.</div>';

  panel.innerHTML = `
    <h2 class="panel-title">Runtime Console</h2>
    <div class="panel-subtitle">Audit trail for language interpretation, validation, canonical actions, and time progression.</div>
    <div class="section-title">Interpretation attempts</div>
    ${interpretations}
    <div class="section-title">Validated world turns</div>
    ${turns}
  `;
};