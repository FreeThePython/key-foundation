import { escapeHtml, formatValue, json } from "../ui.js";

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));
const percent = (value) => `${Math.round(clamp(Number(value), 0, 1) * 100)}%`;
let activeTab = "entities";

const temperatureStatus = (fahrenheit) => {
  if (fahrenheit >= 104) return "Critical fever";
  if (fahrenheit >= 102) return "High fever";
  if (fahrenheit >= 100.4) return "Fever";
  if (fahrenheit < 95) return "Hypothermia";
  return "Normal range";
};

const respiratoryPresentation = (distress) => {
  const value = clamp(Number(distress), 0, 1);
  const estimatedOxygen = Math.round(clamp(99 - value * 18, 70, 99));
  const breathing = value >= 0.75 ? "Severely labored" : value >= 0.5 ? "Rapid and labored" : value >= 0.25 ? "Noticeably strained" : "Unlabored";
  const risk = estimatedOxygen < 90 ? "Critical" : estimatedOxygen < 93 ? "Concerning" : estimatedOxygen < 95 ? "Watch closely" : "Stable";
  return {
    label: "Breathing and oxygen",
    value: `${estimatedOxygen}% estimated O₂`,
    status: `${breathing} · ${risk}`,
    note: "Simulation estimate derived from respiratory distress, not a measured pulse-ox reading.",
    className: estimatedOxygen < 93 ? "danger" : "",
  };
};

const hydrationStatus = (value) => value < 0.25 ? "Critical dehydration" : value < 0.4 ? "Severely dehydrated" : value < 0.6 ? "Moderately dehydrated" : value < 0.8 ? "Mildly dehydrated" : "Well hydrated";
const fatigueStatus = (value) => value >= 0.8 ? "Exhausted" : value >= 0.6 ? "Very tired" : value >= 0.35 ? "Tired" : value >= 0.15 ? "Slightly fatigued" : "Fresh";
const coldStatus = (value) => value >= 0.8 ? "Severe cold stress" : value >= 0.6 ? "High hypothermia risk" : value >= 0.35 ? "Moderate cold stress" : value >= 0.15 ? "Mild cold stress" : "Minimal cold exposure";

const presentMetric = (key, rawValue) => {
  const value = Number(rawValue);
  switch (key) {
    case "bodyTemperatureC": {
      const fahrenheit = value * 9 / 5 + 32;
      return { label: "Body temperature", value: `${fahrenheit.toFixed(1)}°F`, status: temperatureStatus(fahrenheit), note: `${value.toFixed(2)}°C raw engine value`, className: fahrenheit >= 102 || fahrenheit < 95 ? "danger" : "" };
    }
    case "respiratoryDistress": return respiratoryPresentation(value);
    case "hydration": return { label: "Hydration reserve", value: percent(value), status: hydrationStatus(value), note: `${formatValue(value)} raw engine value`, className: value < 0.4 ? "danger" : "" };
    case "fatigue": return { label: "Stamina", value: percent(1 - value), status: fatigueStatus(value), note: `${formatValue(value)} fatigue raw engine value`, className: value >= 0.6 ? "danger" : "" };
    case "coldExposure": return { label: "Cold exposure", value: percent(value), status: coldStatus(value), note: `${formatValue(value)} raw engine value`, className: value >= 0.6 ? "danger" : "" };
    case "medicalSkill": return { label: "Medical skill", value: percent(value), status: "Capability", note: `${formatValue(value)} raw engine value`, className: "" };
    case "conscious": return { label: "Conscious", value: rawValue ? "Yes" : "No", status: rawValue ? "Responsive" : "Unresponsive", note: `Raw value: ${String(rawValue)}`, className: rawValue ? "" : "danger" };
    case "role": return { label: "Role", value: String(rawValue), status: "", note: "", className: "" };
    default: return { label: key, value: formatValue(rawValue), status: "", note: "Raw engine value", className: "" };
  }
};

const renderMetric = ([key, rawValue]) => {
  const metric = presentMetric(key, rawValue);
  return `<div class="card"><div class="label">${escapeHtml(metric.label)}</div><div class="value ${metric.className}">${escapeHtml(metric.value)}</div>${metric.status ? `<div class="metric-status">${escapeHtml(metric.status)}</div>` : ""}${metric.note ? `<div class="metric-note">${escapeHtml(metric.note)}</div>` : ""}</div>`;
};

export const renderCanonicalPanel = (state) => {
  const panel = document.getElementById("canonical-panel");
  if (!panel) throw new Error("Missing canonical panel");

  const entities = state.canonical.entities.map((entity) => `<details open><summary>${escapeHtml(entity.name)} · revision ${formatValue(entity.revision)}</summary><div class="label">${escapeHtml(entity.kind)} · ${escapeHtml(entity.locationId ?? "no location")}</div><div class="metric-grid">${Object.entries(entity.attributes).map(renderMetric).join("")}</div><details class="raw-values"><summary>Raw entity record</summary><pre>${json(entity)}</pre></details></details>`).join("");
  const propositions = state.canonical.propositions.length ? state.canonical.propositions.map((item) => `<div class="card"><div class="value">${escapeHtml(item.claim)}</div><div class="label ${escapeHtml(item.status)}">${escapeHtml(item.status)}</div></div>`).join("") : '<div class="empty">No canonical propositions.</div>';
  const timeline = state.canonical.events.map((event) => `<div class="timeline-item"><div class="timeline-tick">Tick ${formatValue(event.tick)}</div><div><div class="timeline-code">${escapeHtml(event.code)}</div><div class="label">${escapeHtml(event.kind)}</div>${event.causes?.length ? `<details><summary>causes</summary><pre>${json(event.causes)}</pre></details>` : ""}</div></div>`).join("");

  const content = activeTab === "entities" ? entities : activeTab === "propositions" ? propositions : `<div class="timeline">${timeline}</div>`;
  panel.innerHTML = `<h2 class="panel-title">World</h2><div class="panel-subtitle">Canonical reality, interpreted for humans with raw records available for debugging.</div><div class="tabs"><button data-world-tab="entities" class="tab ${activeTab === "entities" ? "active" : ""}">Entities</button><button data-world-tab="propositions" class="tab ${activeTab === "propositions" ? "active" : ""}">Propositions</button><button data-world-tab="timeline" class="tab ${activeTab === "timeline" ? "active" : ""}">Timeline</button></div><div class="tab-content">${content}</div>`;

  panel.querySelectorAll("[data-world-tab]").forEach((button) => button.addEventListener("click", () => {
    activeTab = button.dataset.worldTab;
    renderCanonicalPanel(state);
  }));
};