# KEY Engineering Principles

## Purpose

These principles govern how KEY moves from research to implementation.

They exist to protect the project from premature scale, hidden assumptions, ornamental complexity, and prototypes that impress without teaching.

## 1. Every Feature Tests a Claim

No feature is added until the team can state which hypothesis it tests or which validated requirement it satisfies.

A feature without a research or product purpose is deferred.

## 2. The Smallest Valid Experiment Comes First

Build the least complex system capable of producing evidence.

Do not build a kingdom to test whether one promise can persist.

Do not build combat to test whether pressure changes choice.

## 3. Simulation Before Scripting

Prefer state, rules, agents, and consequences over predetermined sequences.

Scripting may constrain or present an experiment, but it must not counterfeit the behavior being tested.

## 4. Persistent State Before Procedural Content

More generated content is not progress if the world cannot remember, interpret, and respond to what already happened.

## 5. Truth Exists Independently of Observation

The system must distinguish canonical state from what each agent or player knows, believes, remembers, or infers.

## 6. Characters Act From Situated Causes

Agent behavior must be traceable to knowledge, belief, desire, fear, relationship, memory, resource, identity, or constraint.

The plot is not an acceptable hidden cause.

## 7. Every Consequence Needs Provenance

Meaningful state changes must record what caused them and what they changed.

The system should be able to answer: why did this happen?

## 8. Scope Expands Only After Evidence

> Scope expands only when the current layer demonstrates coherent, observable, and repeatable behavior.

Advancement criteria must be defined before implementation begins.

## 9. One Primary Variable Per Experiment

Each prototype module should isolate one main uncertainty whenever practical.

If many major systems change at once, the result cannot teach us which idea succeeded or failed.

## 10. Failure Must Be Informative

Each experiment defines explicit failure conditions.

A failed hypothesis, confusing interaction, or incoherent behavior is valuable when it produces a clear revision.

## 11. Systems Must Compose

New systems must interact through shared ontology and state rather than private shortcuts.

A relationship system, institution system, and resource system should be able to influence one another without bespoke story glue.

## 12. Stable Primitives, Adaptive Expressions

Core interaction grammar, state semantics, and causal rules should remain stable enough to learn and test.

Content, emphasis, mechanics, pacing, and interface may adapt above that stable foundation.

## 13. Human Perception Is Part of Validation

A system is not successful merely because its internal state is correct.

Players must be able to perceive enough causality, intention, persistence, and meaning for the behavior to matter experientially.

## 14. Evaluation Is Multidimensional

Do not collapse coherence, agency, surprise, usability, engagement, emotional effect, and replay variation into one score.

## 15. The Prototype Is a Laboratory

A prototype succeeds by reducing uncertainty, not by resembling a finished game.

Visual polish is appropriate only when presentation itself is the variable under study.

## 16. The Vision Guides; Evidence Decides

The North Star determines direction.

Research and experiments determine implementation.

No favored concept is exempt from revision.

## Required Experiment Record

Every prototype module must document:

- primary hypothesis
- secondary observations
- controlled environment
- allowed interactions
- state being measured
- success signals
- failure signals
- instrumentation
- playtest questions
- advancement criteria
- explicit non-goals

## Core Loop

```text
Observe
    ↓
Interpret
    ↓
Decide
    ↓
Act
    ↓
World state changes
    ↓
Others observe
    ↓
Memory and relationships update
    ↓
Repeat
```

This loop should become reliable at small scale before KEY attempts large-scale world generation or adaptive game design.