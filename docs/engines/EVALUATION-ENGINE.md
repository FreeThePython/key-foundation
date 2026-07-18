# KEY Evaluation Engine Specification

## Purpose

The Evaluation Engine examines whether narrative state, causality, agency, consequence, interpretation, and resolution remain coherent without reducing quality to a single score.

## Research Principle

> Evaluation should reveal tradeoffs, contradictions, and uncertainty rather than manufacture false precision.

## Core Responsibilities

- test causal continuity
- detect unsupported knowledge and abrupt relationship change
- assess consequence persistence
- examine pressure and possibility change
- distinguish observation from interpretation
- record confidence and competing explanations
- compare system output with human evaluation

## Requirements

### E-001 — Multi-Dimensional Evaluation

The engine must report world coherence, human credibility, story causality, memory continuity, agency, and uncertainty separately.

**Evidence:** Research methodology and pilot synthesis  
**Confidence:** Moderate

### E-002 — Causal Traceability

Claims about success or failure must identify the state, event, and transition involved.

**Evidence:** CASE-0001 through CASE-0004  
**Related hypotheses:** H-001, H-005, H-009  
**Confidence:** Moderate

### E-003 — Knowledge-Boundary Checks

The engine must detect when an agent acts on information they could not credibly possess.

**Evidence:** CASE-0001, CASE-0003, CASE-0004  
**Related hypotheses:** H-007  
**Confidence:** Moderate

### E-004 — Relationship-Continuity Checks

The engine must flag major relationship changes lacking sufficient interaction, pressure, evidence, or reinterpretation.

**Evidence:** Pilot comparison, especially CASE-0002  
**Related hypotheses:** H-004, H-008  
**Confidence:** Moderate

### E-005 — Consequence-Memory Checks

The engine must identify significant events whose expected effects disappear without transformation or resolution.

**Evidence:** CASE-0001 through CASE-0004  
**Related hypotheses:** H-001, H-014  
**Confidence:** Moderate

### E-006 — Possibility Analysis

The engine must examine how events expand, narrow, hide, or revalue future alternatives.

**Evidence:** CASE-0003, CASE-0004  
**Related hypotheses:** H-005, H-009, H-018  
**Confidence:** Moderate

### E-007 — Interpretive Uncertainty

Evaluation outputs must separate direct observation, inference, reception evidence, and speculative explanation.

**Evidence:** Narrative Research Methodology  
**Confidence:** High as a governance requirement

### E-008 — Human Validation

Automated outputs cannot count as independent evidence until compared with transparent human judgments.

**Evidence:** Hypothesis Register governance rules  
**Confidence:** High as a governance requirement

## Output Shape

Each evaluation should include:

- observed state
- expected transition
- actual transition
- evidence
- competing explanations
- confidence
- affected hypotheses
- suggested next test

## Non-Goals

The Evaluation Engine does not declare objective artistic quality, replace critics or audiences, or optimize every work toward the same style.

## Open Questions

- Which observations can be measured reliably across media?
- How should evaluator disagreement be represented?
- Can local coherence metrics predict holistic audience response?
- How should cultural and genre expectations alter interpretation?