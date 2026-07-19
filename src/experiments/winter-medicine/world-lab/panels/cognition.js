import { escapeHtml, formatValue } from "../ui.js";

export const renderCognitionPanel = (state) => {
  const panel = document.getElementById("cognition-panel");
  if (!panel) throw new Error("Missing cognition panel");

  const beliefs = state.cognition.beliefs.length
    ? state.cognition.beliefs.map((belief) => `
      <div class="card">
        <div class="card-header">
          <div class="label">${escapeHtml(belief.owner)}</div>
          <div class="label">${escapeHtml(belief.stance)} · ${formatValue(belief.confidence)}</div>
        </div>
        <div class="value">${escapeHtml(belief.propositionId)}</div>
      </div>`).join("")
    : '<div class="empty">No agent beliefs recorded.</div>';

  const memories = state.cognition.memories.length
    ? state.cognition.memories.map((memory) => `
      <div class="card">
        <div class="card-header">
          <div class="label">${escapeHtml(memory.owner)}</div>
          <div class="label">confidence ${formatValue(memory.confidence)}</div>
        </div>
        <div class="value">${escapeHtml(memory.summary)}</div>
      </div>`).join("")
    : '<div class="empty">No agent memories recorded.</div>';

  panel.innerHTML = `
    <h2 class="panel-title">Agent Cognition</h2>
    <div class="panel-subtitle">Beliefs and memories are owned by agents. They are not automatically canonical truth.</div>
    <div class="section-title">Beliefs</div>
    ${beliefs}
    <div class="section-title">Memories</div>
    ${memories}
  `;
};
