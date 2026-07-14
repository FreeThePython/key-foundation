# KEY Repository Instructions

## Project Identity

KEY is a persistent AI narrative-world engine.

Its purpose is to generate causally coherent realities populated by characters with memory, limited knowledge, motivations, relationships, and agency. Human choices must produce persistent consequences and shape stories whose outcomes are not predetermined.

**Brand promise:** KEY — We Unlock Worlds.

## Required Reading

Before making architectural or behavioral changes, read:

1. `docs/vision/KEY-VISION.md`
2. `docs/product/PROTOTYPE-DEFINITION.md`
3. `docs/architecture/KEY-CONSTITUTION.md`
4. The architecture document relevant to the subsystem
5. `docs/evaluation/KEY-EVALUATION-FRAMEWORK.md`

## Architectural Priorities

1. Causal coherence
2. Persistent canonical state
3. Meaningful player choice
4. Character consistency
5. Knowledge boundaries
6. Narrative consequence
7. Auditability
8. Testability
9. Model-provider independence
10. Presentation quality

## Canonical-State Rule

Structured world state is canonical. Generated prose, summaries, dialogue, embeddings, and model context are not canonical unless converted into validated structured changes and committed through the state-transition system.

AI models may propose worlds, scenes, dialogue, possibilities, consequences, and state transitions. They may not directly mutate canonical state.

## Required State-Change Process

Every canonical change must:

1. Identify its causal source.
2. Identify affected entities.
3. Pass schema validation.
4. Pass continuity validation.
5. Respect chronology and geography.
6. Respect character knowledge boundaries.
7. Produce an auditable event record.
8. Identify immediate and delayed consequences.
9. Include applicable automated tests.

## Narrative Rules

- Do not predetermine the campaign ending.
- Do not manufacture twists that contradict established truth.
- Do not use coincidence to resolve major conflicts.
- Do not confuse objective truth with character belief.
- Do not create choices that differ only cosmetically.
- Do not allow characters to act only because the plot requires it.
- Do not generate scenes that change nothing.
- Do not reset failure out of existence.
- Do not treat more generated text as narrative depth.
- Do not use prompt memory as a substitute for canonical state.

## Current Scope

The current prototype proves the World and Story Engine. Unless explicitly requested, do not add 3D rendering, real-time combat, crafting, grinding systems, multiplayer, blockchain, dynamic video generation, open-world exploration, mobile applications, or game-engine dependencies.

## Definition of Done

A feature is complete only when behavior matches the product definition, canonical-state rules are preserved, invalid behavior is rejected safely, tests cover normal and adversarial cases, the result is inspectable, documentation is current, and no architectural contradiction has been introduced.
