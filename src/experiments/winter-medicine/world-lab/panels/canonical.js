import { escapeHtml, formatValue, json } from "../ui.js";

const metricClass = (key) => key === "bodyTemperatureC" || key === "respiratoryDistress" ? "danger" : "";

export const renderCanonicalPanel = (state) => {
  const panel = document.getElementById("canonical-panel");
  if (!panel) throw new Error("Missing canonical panel");

  const entities = state.canonical.entities.map((entity) => {
    const metrics = Object.entries(entity.attributes).map(([key, value]) => `
      <div class="card">
        <div class="label">${escapeHtml(key)}</div>
        <div class="value ${metricClass(key)}">${formatValue(value)}</div>
      </div>`).join("");
    return `
      <details open>
        <summary>${escapeHtml(entity.name)} · revision ${formatValue(entity.revision)}</summary>
        <div class="label">${escapeHtml(entity.kind)} · ${escapeHtml(entity.locationId ?? "no location")}</div>
        <div class="metric-grid">${metrics}</div>
      </details>`;
  }).join("");

  const propositions = state.canonical.propositions.length
    ? state.canonical.propositions.map((proposition) => `
      <div class="card">
        <div class="value">${escapeHtml(proposition.claim)}</div>
        <div class="label ${escapeHtml(proposition.status)}">${escapeHtml(proposition.status)}</div>
      </div>`).join("")
    : '<div class="empty">No canonical propositions.</div>';

  const timeline = state.canonical.events.map((event) => `
    <div class="timeline-item">
      <div class="timeline-tick">Tick ${formatValue(event.tick)}</div>
      <div>
        <div class="timeline-code">${escapeHtml(event.code)}</div>
        <div class="label">${escapeHtml(event.kind)}</div>
        ${event.causes?.length ? `<details><summary>causes</summary><pre>${json(event.causes)}</pre></details>` : ""}
      </div>
    </div>`).join("");

  panel.innerHTML = `
    <h2 class="panel-title">Canonical Reality</h2>
    <div class="panel-subtitle">Objective world state, including facts hidden from the player.</div>
    <div class="section-title">Entities</div>
    ${entities}
    <div class="section-title">Propositions</div>
    ${propositions}
    <div class="section-title">World timeline</div>
    <div class="timeline">${timeline}</div>
  `;
};
