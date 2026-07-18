# KEY Canonical State Schema v0.1

Defines the authoritative representation of reality within the KEY Cognitive World Model.

## Principles
- Canonical state is the single source of truth.
- AI never writes directly to canonical state.
- Every state mutation has provenance.
- Truth, beliefs, and observations are stored separately.
- State is deterministic given the same seed and actions.

## Core Domains
1. World
2. Locations
3. Entities
4. Cognitive Agents
5. Relationships
6. Resources
7. Events
8. Processes
9. Knowledge
10. Beliefs
11. Observations
12. Memories
13. Institutions
14. Factions
15. Time

## Entity Identity
Every entity has:
- Stable ID
- Type
- Canonical attributes
- Current state
- Historical provenance

## Event Record
Each event stores:
- Event ID
- Timestamp
- Causes
- Participants
- Witnesses
- State mutations
- Future dependencies

## Knowledge Model
Truth exists independently from what agents know.
Knowledge is agent-specific.
Beliefs may differ from truth.
Observations create new knowledge candidates until validated.

## Memory Model
Working Memory
Local Memory
Agent Memory
Canonical Memory
Historical Archive

## Research Requirements
Every mutation must be replayable, inspectable, and attributable.
