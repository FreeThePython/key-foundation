# Prior Art and Research Landscape

## Purpose

KEY does not begin from the assumption that narrative intelligence, interactive storytelling, drama management, computational narratology, story generation, or narrative evaluation are new fields.

They are not.

Decades of work already exist across artificial intelligence, narratology, game studies, computational creativity, autonomous agents, planning, human-computer interaction, psychology, literary studies, and interactive drama.

This document exists to establish intellectual honesty, identify the foundations KEY inherits, clarify where KEY overlaps with prior work, and define where the project may contribute something distinct.

> KEY should not claim novelty where continuity is more truthful.

Its ambition is not to erase prior work. Its ambition is to connect, test, extend, and operationalize it.

---

## The Central Question

The problem KEY addresses is established but unresolved:

> How can a system preserve coherent, emotionally meaningful narrative while allowing genuine participant agency inside a world that continues to exist, remember, and change?

Many research traditions address part of this question.

Few attempt to unify all of the following within one framework:

- objective world truth,
- persistent canonical state,
- autonomous agents,
- situated knowledge,
- desire and fear,
- relationships and emotional memory,
- adaptive story direction,
- persistent consequence,
- empirical study of authored works,
- audience and critical reception,
- longitudinal reputation,
- and feedback from analysis into generation and evaluation.

The potential contribution of KEY lies primarily in this integration.

---

# Established Fields and Their Relationship to KEY

## 1. Narratology

Narratology studies the structures, forms, functions, perspectives, temporal organizations, and interpretive systems of narrative.

It provides foundational language for understanding:

- event and discourse,
- plot and story,
- causality,
- perspective,
- focalization,
- temporality,
- character,
- revelation,
- and interpretation.

KEY depends on this tradition. It should not treat literary theory as an optional historical footnote. The framework's concepts must be compared with established narrative theory to avoid renaming ideas that already possess precise definitions.

### KEY's relationship

KEY attempts to translate narrative theory into stateful, adaptive systems without reducing theory to rigid templates.

---

## 2. Computational Narratology

Computational narratology formalizes narrative concepts so that stories can be represented, analyzed, compared, generated, or reasoned about computationally.

Relevant research includes:

- event extraction,
- causal modeling,
- character goals and intentions,
- narrative schemas,
- plot representation,
- perspective and knowledge,
- temporal structure,
- automatic story understanding,
- and computational analysis of large narrative corpora.

Recent research continues to report that narrative tasks remain fragmented and that no single accepted definition or benchmark captures narrative quality as a whole.

### KEY's relationship

KEY should build on theory-informed computational representations while resisting the idea that narrative quality can be compressed into one universal score.

---

## 3. Interactive Narrative

Interactive narrative uses computation to create or manage stories that respond to participant action.

Its central tension is familiar:

- too much authorial control can make agency illusory;
- too much freedom can dissolve coherence, pacing, or meaning.

Research has explored branching stories, planning systems, reactive systems, emergent narrative, player modeling, and hybrid approaches.

### KEY's relationship

KEY inherits this exact tension but frames it through three interacting systems:

- the World Engine,
- the Human Engine,
- and the Story Engine.

The goal is not unrestricted simulation and not disguised scripting. It is structured possibility under causal constraint.

---

## 4. Interactive Drama and Drama Management

Interactive drama research has long explored systems that observe player action and guide narrative progression toward coherent or enjoyable outcomes.

A drama manager is typically an omniscient background process that selects, delays, introduces, or reorganizes story content according to authorial goals, player behavior, or predicted enjoyment.

The landmark project *Façade* demonstrated a real-time interactive drama assembled from authored behaviors and story beats, coordinated by a drama manager while allowing substantial moment-to-moment player interaction.

Later work explored personalized drama management and data-driven attempts to improve player enjoyment without explicitly removing agency.

### KEY's relationship

KEY's Story Director is closely related to drama management and experience management.

KEY must therefore distinguish the Story Director by responsibility rather than by pretending the concept is unprecedented.

The Story Director should:

- conduct pressure rather than dictate action,
- preserve character autonomy,
- respect Canonical World State,
- recognize earned convergence,
- and avoid manipulating the world solely to force preferred outcomes.

---

## 5. Narrative Planning

Narrative planning uses automated planning methods to construct event sequences whose actions are causally valid and often intentional from the perspective of characters.

This research has contributed important methods for:

- causal coherence,
- intentional action,
- goal-directed characters,
- partial-order plans,
- branching story spaces,
- replanning after disruption,
- and mediation between player choice and authorial structure.

### KEY's relationship

The Possibility Graph overlaps with planning traditions but is intended to represent supported futures rather than a hidden fixed plot.

KEY should study narrative planning closely before formalizing the graph's implementation.

---

## 6. Emergent Narrative and Autonomous Agents

Emergent narrative research asks whether stories can arise from the interaction of autonomous agents rather than from a predetermined plot.

This approach values:

- agent autonomy,
- believable behavior,
- simulation,
- social interaction,
- and unplanned event sequences.

Its recurring difficulty is that plausible simulation does not automatically produce satisfying narrative form.

### KEY's relationship

The Human Engine aligns strongly with autonomous-agent and emergent-narrative research.

KEY's proposed distinction is that agents do not operate in isolation from narrative structure. Their actions interact with Narrative Anchors, Story Momentum, consequence, memory, and world-level pressure.

---

## 7. Automated Story Generation

Automatic story generation attempts to produce coherent, engaging, and contextually consistent narratives with limited human intervention.

Modern language models have improved fluency and length, but research continues to identify major weaknesses in:

- long-range coherence,
- character consistency,
- plot controllability,
- causal structure,
- diversity,
- and reliable evaluation.

### KEY's relationship

KEY does not define success as the generation of plausible prose.

Generated text is an expression layer.

The deeper product is a causal narrative system in which text reflects world state, knowledge, motivation, memory, and consequence.

---

## 8. Story Evaluation and Narrative Benchmarking

Researchers have proposed human and automatic criteria for evaluating stories, including:

- coherence,
- character development,
- interestingness,
- creativity,
- relevance,
- emotional impact,
- style,
- consistency,
- and preference.

Current research strongly suggests that narrative evaluation is more difficult than evaluating constrained language tasks. Recent benchmark studies also indicate that many narrative-understanding dimensions remain poorly represented, especially perspective, revelation, event structure, and subjective interpretation.

### KEY's relationship

The Narrative Observatory should treat evaluation as multidimensional, evidence-based, and uncertainty-aware.

It should not collapse craft, audience response, critical response, commercial success, and historical durability into one number.

---

## 9. Script Analysis and Commercial Analytics

Commercial tools already analyze screenplays for structure, pacing, character, dialogue, market fit, production factors, and projected performance.

This is not a defensible area of novelty for KEY.

### KEY's relationship

KEY should not become another screenplay scorecard.

Its Observatory must connect analysis to a broader research cycle:

1. observe narrative works;
2. identify recurring properties;
3. examine reception and context;
4. form testable hypotheses;
5. compare across media, genres, eras, and cultures;
6. translate supported findings into adaptive narrative systems;
7. evaluate generated or emergent outcomes;
8. revise the theory.

---

# What KEY Is Not Claiming to Invent

KEY should not claim to have invented:

- narrative intelligence,
- computational narratology,
- interactive storytelling,
- interactive drama,
- drama management,
- experience management,
- emergent narrative,
- autonomous narrative agents,
- narrative planning,
- automatic story generation,
- screenplay analysis,
- or story-quality evaluation.

These fields and practices possess substantial prior art.

KEY's terminology should acknowledge overlap explicitly whenever a canonical concept closely resembles an established one.

---

# The Proposed Contribution of KEY

KEY proposes a unified Narrative Intelligence Framework organized around three interacting engines.

## World Engine

Represents:

- objective truth,
- history,
- institutions,
- culture,
- cosmology,
- resources,
- laws,
- constraints,
- and supported possibility.

## Human Engine

Represents:

- agency,
- situated knowledge,
- desire,
- fear,
- identity,
- relationships,
- loyalty,
- betrayal,
- emotional memory,
- growth,
- and legacy.

## Story Engine

Represents:

- narrative pressure,
- anchors,
- momentum,
- revelation,
- consequence,
- transformation,
- convergence,
- and earned resolution.

The proposed innovation is not any single component.

It is the attempt to make these components reason together inside a persistent living world while remaining accountable to empirical narrative research.

---

# The Narrative Observatory as a Distinctive Research Loop

The Observatory should combine evidence that is usually studied separately.

## Layer 1: The Work

What is structurally present in the narrative?

## Layer 2: Formal Analysis

How do world, character, causality, knowledge, pressure, revelation, and consequence operate?

## Layer 3: Audience Reception

What did audiences feel, remember, praise, reject, misunderstand, or revisit?

## Layer 4: Critical and Scholarly Interpretation

What did critics, scholars, and practitioners identify?

## Layer 5: Market and Exposure Context

How did distribution, marketing, timing, genre expectations, censorship, platform, and competition shape reception?

## Layer 6: Longitudinal Reception

Did the work decline, endure, become influential, gain cult status, or receive later reassessment?

## Layer 7: Interactive Translation

Which observed principles survive when the participant can disrupt the expected sequence?

This final layer is essential.

KEY is not merely asking what makes a fixed story effective.

It is asking:

> Which principles of good storytelling can remain intact when events are no longer under complete authorial control?

---

# Research Risks

## Reinventing Established Terms

A new name can conceal an old idea. Every major KEY concept should be compared against prior terminology before being presented as novel.

## Formula Worship

Patterns are not universal laws. A recurring structure may be genre-specific, culturally specific, historically contingent, or effective only in interaction with other properties.

## Popularity Bias

Revenue, ratings, awards, reviews, and social attention are signals rather than proof of narrative quality.

## Survivorship Bias

The surviving canon does not represent everything created, distributed, suppressed, forgotten, or never exposed to a broad audience.

## Cultural Narrowness

A framework trained mainly on English-language Western media may incorrectly universalize local conventions.

## Retrospective Certainty

Later acclaim does not prove that initial rejection was irrational. Reception changes because audiences, contexts, distribution, interpretation, and the surrounding culture change.

## Metric Capture

Once a metric becomes a target, systems may optimize the score rather than the underlying narrative quality.

## Model-as-Judge Bias

Language models may reproduce consensus, prestige bias, popularity bias, or training-data familiarity rather than independently evaluate narrative craft.

---

# Required Research Practices

KEY research should:

- credit established fields and researchers;
- separate observation from interpretation;
- distinguish intrinsic craft from reception and context;
- preserve disagreement among credible evaluators;
- record uncertainty;
- compare across genres, media, cultures, and eras;
- test hypotheses against counterexamples;
- publish rejected hypotheses;
- avoid treating correlation as causation;
- and revise the framework when evidence contradicts it.

> The Observatory is not designed to prove KEY correct. It is designed to help KEY become more accurate.

---

# Initial Research Questions

1. Which dimensions of narrative quality can be evaluated reliably across human reviewers?
2. Which dimensions remain inherently perspectival or culture-dependent?
3. Which principles recur across highly regarded works without becoming formulas?
4. Which narrative properties correlate with long-term durability rather than initial popularity?
5. How should exposure, marketing, distribution, and release context be separated from intrinsic craft?
6. Which authored-story techniques can be translated into adaptive systems?
7. Which techniques fail when participant agency disrupts sequence?
8. Can consequence persistence improve perceived meaning and emotional memory?
9. Can supporting-character autonomy improve world credibility without weakening narrative focus?
10. Can earned revelation be measured without reducing surprise to timing alone?
11. How can a Story Director support coherence without covertly invalidating player agency?
12. What evidence would falsify KEY's strongest assumptions?

---

# Initial Reference Works

This bibliography is intentionally a starting point rather than a complete literature review.

## Interactive Drama and Agency

- Michael Mateas. *A Neo-Aristotelian Theory of Interactive Drama*. AAAI Spring Symposium, 2000.
- Michael Mateas and Andrew Stern. *Structuring Content in the Façade Interactive Drama Architecture*. AIIDE, 2005.
- Michael Mateas and Andrew Stern. *Demonstration: The Interactive Drama Façade*. AIIDE, 2005.

## Interactive Narrative and Drama Management

- Mark O. Riedl and Vadim Bulitko. *Interactive Narrative: An Intelligent Systems Approach*. AAAI, 2012.
- Hong Yu and Mark O. Riedl. *Data-Driven Personalized Drama Management*. AIIDE, 2013.
- Hong Yu and Mark O. Riedl. *Optimizing Players' Expected Enjoyment in Interactive Stories*. AIIDE, 2015.

## Story Evaluation and Narrative Understanding

- Dingyi Yang and Qin Jin. *What Makes a Good Story and How Can We Measure It? A Comprehensive Survey of Story Evaluation*. 2024.
- David Y. Liu, Aditya Joshi, and Paul Dawson. *Narrative Theory-Driven LLM Methods for Automatic Story Generation and Understanding: A Survey*. 2026.
- Sil Hamilton, Matthew Wilkens, and Andrew Piper. *NarraBench: A Comprehensive Framework for Narrative Benchmarking*. EACL, 2026.
- Yuan Ma, Richard Susilo, Patrik Haslum, and Hanna Suominen. *Text-to-Text Automatic Story Generation: A Survey*. EACL, 2026.

---

# Positioning Statement

KEY builds upon decades of work in narratology, computational narratology, interactive drama, narrative planning, autonomous agents, emergent narrative, story generation, and narrative evaluation.

Its purpose is to unify those insights into a framework for persistent living worlds in which meaningful stories can emerge through truth, agency, knowledge, memory, and consequence.

> KEY is not the invention of narrative intelligence.
>
> KEY is an attempt to integrate its fragmented foundations into a coherent, testable, and adaptive system.

---

# Living Document

This landscape must be revised as the research deepens.

Future versions should add:

- a formal literature matrix,
- concept-to-prior-art mappings,
- competing schools of thought,
- known benchmark datasets,
- major commercial systems,
- failed or abandoned approaches,
- intellectual-property review where appropriate,
- and explicit changes made to KEY because of prior research.

The measure of this document is not how original KEY appears after reading it.

The measure is how accurately KEY understands the field it is entering.