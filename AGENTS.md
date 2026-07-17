# KEY Repository Instructions

## Project Identity

KEY is a persistent AI narrative-world engine.

Its purpose is to generate causally coherent realities populated by people with memory, limited knowledge, motivations, relationships, and agency. Human choices must produce persistent consequences and shape stories whose outcomes are not predetermined.

**Brand promise:** KEY — We Unlock Worlds.

## Constitutional Authority

`CONSTITUTION.md` is the highest-level governing document in this repository.

Architecture, product decisions, generated content, documentation, and code must remain consistent with it. A downstream document may clarify a constitutional principle. It may not silently contradict or supersede one.

## Required Reading

Before making architectural, behavioral, narrative, or canonical changes, read:

1. `CONSTITUTION.md`
2. `docs/lexicon/KEY-LEXICON.md`
3. `docs/manifesto/README.md` and the chapters relevant to the change
4. `docs/vision/KEY-VISION.md`
5. `docs/product/PROTOTYPE-DEFINITION.md`
6. `docs/architecture/KEY-CONSTITUTION.md`
7. The architecture document relevant to the subsystem
8. `docs/evaluation/KEY-EVALUATION-FRAMEWORK.md`

## Required Creation and Canonization Workflow

Substantial additions must follow this sequence:

1. Read the Constitution, Lexicon, and related Manifesto chapters.
2. Identify the governing principles and canonical terms.
3. Propose the change without treating generated material as canon.
4. Check for contradictions with existing truth, architecture, terminology, and scope.
5. Run an independent continuity-skeptic review.
6. Revise the proposal in response to valid challenges.
7. Validate schemas, causal relationships, chronology, geography, and knowledge boundaries where applicable.
8. Update all affected documentation and canonical definitions.
9. Canonize only after review and validation succeed.
10. Commit with a descriptive message that states what became canonical.

Creation proposes. Review challenges. Canon requires both.

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

A feature is complete only when behavior matches the Constitution and product definition, canonical-state rules are preserved, invalid behavior is rejected safely, tests cover normal and adversarial cases, the result is inspectable, documentation is current, and no constitutional, philosophical, or architectural contradiction has been introduced.
