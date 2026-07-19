import { escapeHtml, formatValue } from "../ui.js";

export const renderPlayerPanel = (state, onAction) => {
  const panel = document.getElementById("player-panel");
  if (!panel) throw new Error("Missing player panel");

  const observations = state.playerKnowledge.observations.length
    ? state.playerKnowledge.observations.map((observation) => `
      <div class="card">
        <div class="label">${escapeHtml(observation.modality)} observation · confidence ${formatValue(observation.confidence)}</div>
        <div class="value"><pre>${escapeHtml(JSON.stringify(observation.features, null, 2))}</pre></div>
      </div>`).join("")
    : '<div class="empty">The player has made no direct observations yet.</div>';

  const memories = state.playerKnowledge.memories.length
    ? state.playerKnowledge.memories.map((memory) => `<div class="card"><div class="value">${escapeHtml(memory)}</div></div>`).join("")
    : '<div class="empty">The player has no explicit memories recorded yet.</div>';

  panel.innerHTML = `
    <h2 class="panel-title">Player Experience</h2>
    <div class="panel-subtitle">Only information available to the player belongs here.</div>
    ${state.notice ? `<div class="notice">${escapeHtml(state.notice)}</div>` : ""}
    <div class="scene">${state.scene.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}</div>
    <div class="actions">
      ${state.actions.length
        ? state.actions.map((action) => `<button class="primary" data-action="${escapeHtml(action.kind)}">${escapeHtml(action.label)}</button>`).join("")
        : '<div class="empty">No further player actions are implemented from this location yet.</div>'}
    </div>
    <div class="section-title">Player observations</div>
    ${observations}
    <div class="section-title">Player memories</div>
    ${memories}
  `;

  panel.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => onAction(button.dataset.action));
  });
};
