import { escapeHtml, formatValue } from "../ui.js";

const formatClock = (instant) => new Date(instant).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

const renderGenesis = (genesis) => `
  <section class="story-block genesis-block">
    <div class="story-heading">
      <div>
        <div class="story-kicker">Genesis</div>
        <div class="story-title">The situation before your first decision</div>
      </div>
      <div class="story-meta">${escapeHtml(formatClock(genesis.time))} · ${escapeHtml(genesis.location)}</div>
    </div>
    <div class="scene compact-scene">${genesis.scene.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}</div>
  </section>`;

const renderRound = (round) => `
  <section class="story-block round-block">
    <div class="story-heading">
      <div>
        <div class="story-kicker">Round ${formatValue(round.round)}</div>
        <div class="story-title">${escapeHtml(round.action)}</div>
      </div>
      <div class="story-meta">${escapeHtml(formatClock(round.resultingTime))} · ${escapeHtml(round.resultingLocation)}</div>
    </div>
    <div class="round-row">
      <div class="round-label">Decision</div>
      <div>${escapeHtml(round.action)}</div>
    </div>
    <div class="round-row">
      <div class="round-label">What changed</div>
      <div>${escapeHtml(round.response)}</div>
    </div>
    <div class="round-row consequence-row">
      <div class="round-label">Consequence</div>
      <div>${formatValue(round.elapsedMinutes)} minutes passed. The world advanced to tick ${formatValue(round.resultingTick)}.</div>
    </div>
  </section>`;

const renderProposal = (proposal) => {
  if (!proposal) return "";
  return `
    <section class="proposal-card ${proposal.supported ? "proposal-valid" : "proposal-invalid"}">
      <div class="story-heading">
        <div>
          <div class="story-kicker">Interpreted proposal</div>
          <div class="story-title">${escapeHtml(proposal.action)}</div>
        </div>
        <div class="story-meta">confidence ${formatValue(proposal.confidence)}</div>
      </div>
      <div class="proposal-grid">
        <div><span>Actor</span>${escapeHtml(proposal.actor)}</div>
        <div><span>Intent</span>${escapeHtml(proposal.intent)}</div>
        <div><span>Target</span>${escapeHtml(proposal.target ?? "Not resolved")}</div>
        <div><span>Interpreter</span>${escapeHtml(proposal.interpreter)}</div>
      </div>
      <div class="proposal-validation">${escapeHtml(proposal.validation)}</div>
      <div class="proposal-actions">
        ${proposal.supported ? '<button class="primary" data-confirm-proposal>Validate and execute</button>' : ""}
        <button data-cancel-proposal>${proposal.supported ? "Cancel" : "Try another action"}</button>
      </div>
    </section>`;
};

export const renderPlayerPanel = (state, controls) => {
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

  const rounds = state.rounds.length
    ? state.rounds.map(renderRound).join("")
    : '<div class="empty round-empty">No rounds completed yet. Choose an action to begin.</div>';

  panel.innerHTML = `
    <h2 class="panel-title">Player Experience</h2>
    <div class="panel-subtitle">Genesis establishes the world once. Each round shows only the decision and what changed.</div>
    ${state.notice ? `<div class="notice">${escapeHtml(state.notice)}</div>` : ""}
    <div class="story-history">
      ${renderGenesis(state.genesis)}
      ${rounds}
    </div>
    <div class="section-title">Current situation</div>
    <div class="scene current-scene">${state.scene.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}</div>
    <div class="section-title">Free interaction</div>
    <div class="free-interaction">
      <div class="free-interaction-copy">Describe what you attempt in ordinary language. The interpreter creates a proposal first; canonical reality does not change until the proposal is validated and executed.</div>
      <form data-free-action-form>
        <textarea data-free-action-input rows="3" placeholder="Example: I check Elian's breathing and see whether he responds.">${escapeHtml(controls.input ?? "")}</textarea>
        <button type="submit">Interpret action</button>
      </form>
      ${renderProposal(controls.proposal)}
    </div>
    <details class="canned-actions">
      <summary>Canned actions for testing</summary>
      <div class="actions">
        ${state.actions.length
          ? state.actions.map((action) => `<button class="primary" data-action="${escapeHtml(action.kind)}">${escapeHtml(action.label)}</button>`).join("")
          : '<div class="empty">No further player actions are implemented from this location yet.</div>'}
      </div>
    </details>
    <details class="player-debug">
      <summary>Player knowledge and memory</summary>
      <div class="section-title">Player observations</div>
      ${observations}
      <div class="section-title">Player memories</div>
      ${memories}
    </details>
  `;

  panel.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => controls.onAction(button.dataset.action));
  });

  panel.querySelector("[data-free-action-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const input = panel.querySelector("[data-free-action-input]")?.value?.trim();
    if (input) controls.onInterpret(input);
  });

  panel.querySelector("[data-confirm-proposal]")?.addEventListener("click", controls.onConfirm);
  panel.querySelector("[data-cancel-proposal]")?.addEventListener("click", controls.onCancel);
};