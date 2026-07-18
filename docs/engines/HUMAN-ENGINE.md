# KEY Human Engine Specification

## Purpose

The Human Engine models situated agents whose choices emerge from knowledge, belief, memory, desire, fear, identity, relationship, and constraint.

## Research Principle

> A person is not a story function. A credible choice is produced by a changing human state inside a changing world.

## Core Responsibilities

- maintain agent-specific knowledge and belief
- preserve memory and interpretation
- represent desire, fear, values, identity, and commitment
- model directional relationship state
- generate perceived possibilities
- select actions from situated rather than omniscient information
- permit avoidance, conflict, uncertainty, and transformation

## Requirements

### HN-001 — Situated Knowledge

Agents must act from information available to them, including uncertainty, error, deception, and inference.

**Evidence:** CASE-0001, CASE-0003, CASE-0004  
**Related hypotheses:** H-003, H-007, H-013  
**Confidence:** Moderate

### HN-002 — Motivational State

The system must represent affirmative desire, avoidance, grief, fear, duty, attachment, and conflicted motivation.

A protagonist need not begin with a positive external goal, but their motivational condition must be intelligible.

**Evidence:** CASE-0004; contrast with CASE-0001 and CASE-0003  
**Related hypotheses:** H-006  
**Confidence:** Moderate

### HN-003 — Relationship Memory

Relationships must retain shared events, promises, injuries, dependencies, trust, fear, and obligation.

**Evidence:** CASE-0001, CASE-0003, CASE-0004  
**Related hypotheses:** H-002, H-004, H-008  
**Confidence:** Moderate

### HN-004 — Directional Relationships

Relationship state must be independently represented for each participant rather than assumed symmetrical.

**Evidence:** Cross-case character analysis  
**Related hypotheses:** H-004, H-008  
**Confidence:** Low

### HN-005 — Identity Through Consequence

Repeated or high-impact experiences must be capable of changing identity, commitment, perceived possibility, and future choice.

**Evidence:** CASE-0001, CASE-0003, CASE-0004  
**Related hypotheses:** H-005, H-014  
**Confidence:** Moderate

### HN-006 — Supporting-Character Agency

Supporting agents must be able to pursue goals, change loyalties, withhold knowledge, fail, and act outside protagonist command.

**Evidence:** Strong in CASE-0003; supporting evidence from CASE-0001 and CASE-0004; contrast from CASE-0002  
**Related hypotheses:** H-002, H-012  
**Confidence:** Moderate

### HN-007 — Perceived Possibility

Agents must distinguish between possibilities that objectively exist and those they believe exist.

**Evidence:** CASE-0001, CASE-0003, CASE-0004  
**Related hypotheses:** H-005, H-007, H-018  
**Confidence:** Moderate

## Non-Goals

The Human Engine does not optimize every action for plot efficiency, moral correctness, or audience approval.

## Validation Questions

- Could the agent know what the action assumes?
- Does the action follow from current motivation and relationship state?
- What alternatives does the agent perceive?
- What prior events remain active in the choice?
- Can the agent surprise the system without contradicting itself?

## Open Questions

- How should emotion be modeled without flattening it into scores?
- How should unconscious motivation differ from inaccessible authorial explanation?
- What memory abstractions preserve meaning while remaining computationally practical?