---
name: bdd-game-behaviour
description: >
  Focuses on storytelling/BDD when user describes game logic. When the user
  explains how game mechanics should work (e.g., "when player enters X then Y
  happens"), this skill ensures tests are written as behavioural specs not
  technical transitions. Triggers on phrases like "game logic", "when player",
  "game should", "mechanic", "game behaviour", "story", "quest flow",
  "gameplay", "rule".
---

# BDD Game Behaviour Skill — Storytelling Over Transitions

## When to use

Use this skill when the user describes **game logic, mechanics, or rules**
and wants tests written as **behavioural stories** rather than technical
state-machine tests. The focus is on what the *player experiences*, not
what internal methods are called.

Do **not** use for UI layout, styling, configuration, or build tasks.

## Core principle

Every game behaviour test should read like a sentence from a game manual:

> **Given** [precondition]  
> **When** [player action]  
> **Then** [observable outcome in the game world]

## How to write test descriptions

Use the `it('given ..., when ..., then ...')` pattern:

✅ `given player has FIND_OUT_WHY_MINE_IS_FLOODED quest, when player enters Gold Mine, then FIND_OUT_WHY_MINE_IS_FLOODED is done and REMOVE_THE_WATER is active`

✅ `given player is fishing at Fishery Ground, when player catches a fish, then fish is in inventory and fishing is no longer in progress`

❌ `should transition from FIND_OUT_WHY_MINE_IS_FLOODED to REMOVE_THE_WATER when entering gold mine`

❌ `should set isFishingInProgress to false after catching fish`

## How to structure test code

Inside the test body, use comments to separate the three phases:

```typescript
it('given player is at Fishery Ground with fishing net, when player starts fishing, then fishing is in progress', fakeAsync(() => {
  // Given
  service.handle(new GoToLocationCmd(Locations.FISHERY_GROUND));
  tick();

  // When
  service.handle(new StartFishingCmd());
  tick();

  // Then
  store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
  tick();
  expect(state.isFishingInProgress).toBe(true);
}));
```

## What to name things

- **describe blocks**: name after the feature or behaviour area (e.g., `'Quest System'`, `'Fishing'`, `'Inventory'`)
- **it blocks**: full sentence starting with `given` describing the scenario from the player's perspective
- **variables**: use game-world names, not technical event names (prefer `fish` over `FISH_CATCHED`)

## Test coverage approach

| What to test | How |
|---|---|
| Core game behaviours (quest flow, location changes, inventory) | BDD-style with Given/When/Then in both name and body |
| UI interactions (button visibility, click handlers, image rendering) | Keep as-is — these are inherently behavioural when describing what the player sees |
| Edge cases (going to same location, missing preconditions) | BDD style with clear precondition → action → outcome |

## When the user describes game logic in prose

If the user says something like:

> "When the player enters the gold mine, they should find out it's flooded and get the quest to remove the water."

Translate this into a spec:

```
Given player has FIND_OUT_WHY_MINE_IS_FLOODED quest
When player enters Gold Mine
Then FIND_OUT_WHY_MINE_IS_FLOODED is done
And REMOVE_THE_WATER is active
And player is at Gold Mine
```

Then write the test using this spec as the `it(...)` description.

## Examples from this codebase

### Quest flow (taken from `gnome-game.reducer.spec.ts`)
```
it('given player has FIND_OUT_WHY_MINE_IS_FLOODED quest, when player enters Gold Mine, then FIND_OUT_WHY_MINE_IS_FLOODED is done and REMOVE_THE_WATER is active')
```

### Fishing flow (taken from `event-sourcing-facade.service.spec.ts`)
```
it('given player is fishing at Fishery Ground, when player catches a fish, then fish is in inventory and fishing is no longer in progress')
```

### Inventory exchange (taken from `event-sourcing-facade.service.spec.ts`)
```
it('given player has fruits of the forest, when player exchanges fruits for golden coin, then golden coin is in inventory and fruit is removed; when player exchanges golden coin for fishing net, then net is in inventory and coin is removed')
```

## Adding technical tests

Technical tests (testing internal state directly, projector functions, reducer
logic) are **optional**. Only add them if:

1. The behaviour test cannot adequately cover the scenario without them
2. The user explicitly asks for them
3. They cover an edge case not covered by the behavioural test

When writing technical tests, still use Given/When/Then naming but acknowledge
they are testing internal logic:

```
it('given no FIND_OUT_WHY_MINE_IS_FLOODED quest, when WENT_TO_LOCATION(GOLD_MINE) event fires, then activeQuestsProjector does not add REMOVE_THE_WATER')
```

## Reminders

- Read existing test files in the same area first
- Read AGENTS.md for project conventions
- Run `npm test` to verify tests pass
- The goal is: someone reading the test names can understand the entire game flow without reading the implementation
