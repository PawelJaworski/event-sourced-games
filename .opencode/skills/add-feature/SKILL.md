---
name: add-feature
description: >
  Given/When/Then → test → implementation. Use when the user provides a 
  behavioral specification in Given/When/Then (BDD) format and wants you to 
  add a feature. Triggers on phrases like "add feature", "given when then", 
  "behaviour spec", "behavior spec", "create a feature", "implement a 
  feature", "bdd", "specification". Not for bug fixes, refactoring, or 
  configuration changes.
---

# Add Feature Skill — BDD-Driven Development

## When to use

Use this skill when the user provides (or asks you to create) a behavioral
specification using **Given / When / Then** format and wants you to build a
feature from it. Do **not** use for bug fixes, pure refactoring, or
configuration tasks.

## Core workflow

```
User spec (Given/When/Then) → Write test (behavior-focused) → Implement → Verify
```

### Step 1 — Understand the specification

If the user provides a Given/When/Then spec, use it directly. If they describe
a feature in prose, translate it into GWT and confirm with them before
proceeding. Make sure you understand:

- **Given** — what preconditions / state exist
- **When** — what action / event triggers the behavior
- **Then** — what observable outcome is expected

### Step 2 — Determine where the feature lives

Before writing code, explore the codebase to decide:

- Which component, service, or module does this belong to?
- Is this a new entity or an addition to an existing one?
- Does it involve event sourcing (new command/event) or a simpler pattern?

Read the relevant existing files and their tests to match conventions.

### Step 3 — Write the test first

Create a test file (or add to an existing `.spec.ts`) that captures the
**behavior** described in the specification. The test must:

1. **Describe behavior, not implementation details.**
   - ✅ `it('should show fishing spot on the map when location is FISHERY_GROUND')`
   - ✅ `it('when fish is caught it is added to inventory')`
   - ❌ `it('should call setState with isFishingInProgress = false')`
   - ❌ `it('should dispatch WENT_TO_LOCATION event')`

   Test descriptions should read like business rules: what the user sees or
   what happens in the game world, not what internal methods are called.

2. **Use the Given/When/Then structure naturally** inside the test body:
   ```typescript
   // Given (set up preconditions)
   component.gameState = { ...gameStartState, currentLocation: Locations.FISHERY_GROUND };

   // When (trigger the action)
   fixture.detectChanges();
   const button = fixture.debugElement.query(By.css('#start-fishing-btn'));
   button.nativeElement.click();

   // Then (assert the outcome)
   expect(eventSourcingFacade.handle).toHaveBeenCalledWith(jasmine.any(StartFishingCmd));
   ```

3. **Follow project conventions** (see AGENTS.md and existing tests):
   - Use `fakeAsync`/`tick()` for event-sourcing command sequences
   - Use `gameStartState` and spread to build state
   - Use `ComponentFixture` and `By.css` for DOM queries
   - Use `spyOn` for verifying command dispatch
   - For pure functions (reducers/projectors), skip TestBed entirely
   - Co-locate test files next to source files

4. **Start with a smoke test** (`it('should create', ...)`) if it's a new file.

5. **Name the `describe` block** after the component/feature name.

### Step 4 — Implement the feature

Write the minimal implementation that makes the test pass:

1. Follow existing code patterns (same imports, same style, same architecture)
2. If using event sourcing: create command + event classes, register the
   handler in the facade service, add the projector logic
3. If adding UI: use existing component patterns, `standalone: false`,
   `@ViewChild` for canvas refs, etc.
4. Match the project's strict TypeScript and Angular template checking

### Step 5 — Verify

Run the specific test file to confirm it passes:

```bash
npm test -- --include="**/path/to/file.spec.ts"
```

If the test fails, fix the implementation until it passes. Do not modify the
test to match a broken implementation unless the test was wrong (e.g., it
tested the wrong behavior, not a technical detail mismatch).

## Given/When/Then to code translation guide

| GWT element | Test code pattern |
|---|---|
| Given state X | Set `component.gameState = { ...gameStartState, ... }` or dispatch setup commands via `service.handle(...)` |
| When action Y | Call `fixture.detectChanges()`, click DOM elements, or call `service.handle(new SomeCmd())` |
| Then outcome Z | `expect(domElement).not.toBeNull()`, `expect(store value).toBe(...)`, or `expect(spy).toHaveBeenCalledWith(...)` |

## What to test — and what not to test

**Test:**
- Visible outcomes (what renders, what state changes, what commands are dispatched)
- State transitions (going from one location to another, inventory changes)
- User-facing behavior (buttons shown/hidden, values displayed, interactions)

**Do NOT test:**
- Internal method calls that have no observable effect
- Pure implementation details (which projector ran, which event fired internally)
- Angular framework behavior (change detection, component lifecycle)

If the spec says "When I start fishing, then the game shows a fishing progress
indicator", the test checks that the indicator is visible — not that
`isFishingInProgress` was set to `true` internally (unless that state is the
only observable outcome).

## Examples

### Example 1: Simple UI behavior

**Spec:**
```
Given the player is at the Fishery Ground
When the player views the interactions panel
Then a "Start fishing" button is shown
```

**Test (from `interactions.component.spec.ts`):**
```typescript
it('should show Start fishing button when location is FISHERY_GROUND', () => {
  component.gameState = { ...gameStartState, currentLocation: Locations.FISHERY_GROUND };
  fixture.changeDetectorRef.markForCheck();
  fixture.detectChanges();

  const button = fixture.debugElement.query(By.css('#start-fishing-btn'));
  expect(button).not.toBeNull();
});
```

### Example 2: Event-sourcing command sequence

**Spec:**
```
Given the player is at the Fishery Ground and fishing has started
When the player catches a fish
Then the fish is added to inventory and fishing is no longer in progress
```

**Test (from `event-sourcing-facade.service.spec.ts`):**
```typescript
it('when fish is caught after fishing started isFishingInProgress should be false', fakeAsync(() => {
  let state: any;

  service.handle(new GoToLocationCmd(Locations.FISHERY_GROUND));
  tick();
  service.handle(new StartFishingCmd());
  tick();
  service.handle(new CatchFishCmd());
  tick();

  store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
  tick();

  expect(state.isFishingInProgress).toBe(false);
  expect(state.inventory).toContain(InventoryItem.FISH);
}));
```

### Example 3: Pure function (projector)

**Spec:**
```
Given the player has the REMOVE_THE_WATER quest
When a QUEST_ADDED event fires for GET_FISH_FOR_BEAVER
Then the player now has both quests active
```

**Test (from `gnome-game.reducer.spec.ts`):**
```typescript
it('should add GET_FISH_FOR_BEAVER quest when QUEST_ADDED event occurs', () => {
  const events = [
    {eventType: EventType.QUEST_ADDED, quest: Quest.GET_FISH_FOR_BEAVER}
  ];
  const result = activeQuestsProjector([Quest.REMOVE_THE_WATER], events);
  expect(result).toEqual([Quest.REMOVE_THE_WATER, Quest.GET_FISH_FOR_BEAVER]);
});
```

## Reminders

- Read AGENTS.md for project conventions
- Read existing test files in the same area first
- Run `npm test` after implementing to verify
- Test descriptions must describe expected **behavior** in business terms,
  not technical implementation details
