# KEY Constitution

## Purpose

This document defines the non-negotiable laws governing the design and implementation of KEY. These laws protect the project from becoming a collection of impressive but disconnected AI prompts.

## 1. Canonical State Is Structured

Structured world state is the source of truth.

Generated prose, dialogue, summaries, embeddings, and model context are not canonical unless converted into validated structured changes and committed through the state-transition system.

## 2. AI Proposes; Systems Validate

AI models may propose worlds, characters, scenes, interpretations, possibilities, consequences, and state transitions.

AI models may not directly mutate canonical state.

Every proposed change must pass deterministic and schema-based validation before becoming true.

## 3. Every Change Has a Cause

No canonical event may occur without an identifiable causal source.

A betrayal requires motive and opportunity. An artifact cannot change location without an event. A war cannot begin without political or material causes. A character cannot change loyalty without pressure, revelation, experience, or transformation.

## 4. Truth and Belief Are Distinct

KEY must distinguish:

- Objective truth
- Public belief
- Individual knowledge
- Individual suspicion
- False belief
- Deliberate deception
- Uncertainty

Characters may only reason and act from information available to them.

## 5. Character Knowledge Is Bounded

A character cannot reveal, reference, or act upon information they have not learned or inferred through a valid process.

Knowledge must record source, confidence, timing, and belief status where relevant.

## 6. Characters Act From Identity

Important character actions must connect to established motivations, values, fears, loyalties, relationships, knowledge, or emotional state.

Characters must not act merely because the plot requires movement.

## 7. Player Choice Must Matter

A major player choice must alter persistent state, relationships, knowledge, political conditions, threat severity, resource ownership, or the future possibility space.

Choices that differ only cosmetically are not meaningful choices.

## 8. Endings Are Not Predetermined

The Story Director may maintain multiple plausible outcomes, but it may not secretly select a final ending in advance and steer all roads toward it.

Outcomes must emerge from the world state, character actions, Narrative Anchors, and player decisions.

## 9. Narrative Anchors Create Pressure, Not Railroads

Narrative Anchors are persistent forces embedded in the world. They may escalate regardless of player attention, but the player can alter their timing, expression, participants, cost, transformation, and outcome.

## 10. Consequences Endure

Major consequences cannot be erased cheaply.

Failure should create new story conditions rather than reset the world. Death, betrayal, political collapse, loss of legitimacy, and broken promises must retain weight.

## 11. Surprise Must Be Fair

KEY may surprise the player, but it may not cheat them.

Major revelations must connect to established truth, clues, motives, or hidden state. Coincidence may begin a story but should not resolve a major conflict.

## 12. Every Major Scene Must Change Something

A major scene must reveal information, alter a relationship, advance or transform a thread, create a decision, change state, or establish a meaningful future possibility.

Scenes that change nothing should be removed or compressed.

## 13. Progression Serves Story

Progression systems are justified only when they unlock choices, transform relationships, alter power, reveal consequences, or deepen the player's connection to the world.

KEY must not rely on empty waiting, repetitive grinding, or arbitrary level inflation as substitutes for engagement.

## 14. History Remains Active

Past events must remain available to influence current behavior, institutions, relationships, beliefs, and future consequences.

The system must preserve both objective records and emotionally meaningful memories.

## 15. Geography and Time Are Real

Characters, armies, information, and objects cannot move instantly unless the world has an established mechanism permitting it.

Travel time, chronology, location, and event ordering must remain coherent.

## 16. The World Exists Beyond the Player

Factions and characters may pursue goals when the player is not directly observing them.

The world should not feel frozen outside the current scene, but autonomous developments must still obey causality and validation.

## 17. Failure Continues the Story

Whenever plausible, defeat should transform the campaign rather than end it.

Exile, succession, occupation, rebellion, captivity, regency, and fractured rule may become new chapters.

## 18. The Engine Must Be Auditable

Every canonical event must be traceable to its causes, proposals, validation results, affected entities, and committed changes.

Developers must be able to inspect why the system produced an outcome.

## 19. The Engine Must Be Testable

Narrative behavior must be evaluated with the same seriousness as software behavior.

Continuity, character consistency, knowledge boundaries, choice consequence, pacing, divergence, and resolution require repeatable tests and regression fixtures.

## 20. KEY Must Remain Model-Independent

No core subsystem may depend permanently on one model vendor.

Model providers may change. KEY's narrative architecture, canonical state, validators, and evaluation framework must remain portable.

## 21. Generation Is Not Depth

More words, characters, lore, quests, or events do not automatically create a richer world.

Depth comes from causality, relationships, memory, consequence, contradiction, and change.

## 22. The Human Remains a Creative Participant

KEY exists to expand human imagination, not replace it.

The player, writer, designer, or director remains an active participant who chooses what matters, shapes the world, and determines which possibilities become history.

## Required State-Change Contract

Every canonical state change must:

1. Identify its causal source.
2. Identify affected entities.
3. Pass schema validation.
4. Pass continuity validation.
5. Respect chronology and geography.
6. Respect character knowledge boundaries.
7. Produce an auditable event record.
8. Record immediate and delayed consequences.
9. Update the possibility space where applicable.
10. Include automated tests for new behavior.

Any implementation that violates these principles must be revised before it becomes part of KEY.
