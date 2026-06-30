import {createAction, createReducer, on, props} from '@ngrx/store';
import {createSelector, createFeatureSelector} from '@ngrx/store';
import {gameStartState, GnomeGameState, InventoryItem, Locations, Quest} from './gnome-game.state';
import {EventType} from './events/events';

export interface GameAggregateState {}
export const initialAggregateState: GameAggregateState = {}

export interface GnomeGameEventsState {
  gnomeGameState: GnomeGameState;
}
export const initialEventsState: GnomeGameEventsState = {
  gnomeGameState: gameStartState
};

export const addEvents = createAction(
  '[Gnome Game] Add Events',
  props<{ events: any[] }>()
);

export const currentLocationProjector = (state: Locations, events: any[]): Locations =>
  events
    .filter((e: any) => e?.eventType === EventType.WENT_TO_LOCATION)
    .map((e: any) => e.location)
    .reduce((_: any, s: Locations) => s, state);

export const inventoryProjector = (state: InventoryItem[], newEvents: any[]): InventoryItem[] => {
  const items = [...state];

  for (const event of newEvents) {
    if (event?.eventType === EventType.FISH_CATCHED) {
      items.push(InventoryItem.FISH);
    } else if (event?.eventType === EventType.FRUITS_OF_THE_FOREST_TAKEN) {
      items.push(InventoryItem.FRUITS_OF_THE_FOREST);
    } else if (event?.eventType === EventType.INVENTORY_EXCHANGED) {
      items.push(event.to);
      const fromIndex = items.indexOf(event.from);
      if (fromIndex !== -1) {
        items.splice(fromIndex, 1);
      }
    } else if (event?.eventType === EventType.FISH_GIVEN_TO_BEAVER) {
      const fishIndex = items.indexOf(InventoryItem.FISH);
      if (fishIndex !== -1) {
        items.splice(fishIndex, 1);
      }
    }
  }

  return items;
};

export const activeQuestsProjector = (state: Quest[], events: any[]): Quest[] => {
  const addedQuests = events
    .filter((e: any) => e?.eventType === EventType.QUEST_ADDED)
    .map((e: any) => e.quest);

  const hasFishCatched = events.some((e: any) => e?.eventType === EventType.FISH_CATCHED);
  const fishQuest = hasFishCatched ? [Quest.GET_FISH_FOR_BEAVER] : [];

  const allQuests = [...state, ...addedQuests, ...fishQuest];
  let quests = [...new Set(allQuests)];

  const enteredGoldMine = events.some(
    (e: any) => e?.eventType === EventType.WENT_TO_LOCATION && e?.location === Locations.GOLD_MINE
  );
  if (enteredGoldMine && state.includes(Quest.FIND_OUT_WHY_MINE_IS_FLOODED)) {
    quests = quests.filter(q => q !== Quest.FIND_OUT_WHY_MINE_IS_FLOODED);
    quests = [...new Set([...quests, Quest.REMOVE_THE_WATER])];
  }

  return quests;
};

const deriveActiveQuests = (quests: Quest[], events: any[], inventory: InventoryItem[]): Quest[] => {
  const enteredFisheryGround = events.some(
    (e: any) => e?.eventType === EventType.WENT_TO_LOCATION && e?.location === Locations.FISHERY_GROUND
  );
  const withFishingNetQuest = enteredFisheryGround
    && quests.includes(Quest.GET_FISH_FOR_BEAVER)
    && !inventory.includes(InventoryItem.FISHING_NET)
    ? [...new Set([...quests, Quest.GET_FISHING_NET])]
    : quests;

  const exchangedForNet = events.some(
    (e: any) => e?.eventType === EventType.INVENTORY_EXCHANGED && e?.to === InventoryItem.FISHING_NET
  );
  let result = exchangedForNet
    ? withFishingNetQuest.filter(q => q !== Quest.GET_FISHING_NET)
    : withFishingNetQuest;

  const fishGivenToBeaver = events.some(
    (e: any) => e?.eventType === EventType.FISH_GIVEN_TO_BEAVER
  );
  if (fishGivenToBeaver) {
    result = result.filter(q => q !== Quest.GET_FISH_FOR_BEAVER);
  }

  return result;
};

export const currentGameProjector = (state: GnomeGameState, newEvents: any[]): GnomeGameState => {
  const inventory = inventoryProjector(state.inventory, newEvents);

  return {
    ...state,
    currentLocation: currentLocationProjector(state.currentLocation, newEvents),
    inventory,
    isFishingInProgress: newEvents.some(it => it.eventType == EventType.FISHING_STARTED),
    isPickingForestFruitsInProgress: newEvents.some(it => it.eventType == EventType.PICKING_FOREST_FRUITS_STARTED),
    isMineFlooded: newEvents.some(it => it.eventType == EventType.FISH_GIVEN_TO_BEAVER) ? false : state.isMineFlooded,
    activeQuests: deriveActiveQuests(activeQuestsProjector(state.activeQuests, newEvents), newEvents, inventory),
  };
};

export const gnomeGameEventsReducer = createReducer(
  initialEventsState,
  on(addEvents, (state, {events}) => ({
    ...state,
    gnomeGameState: currentGameProjector(state.gnomeGameState, events)
  }))
);

export const selectGnomeGameState = createFeatureSelector<GnomeGameEventsState>('gnomeGameEvents');

export const selectGameState = createSelector(
  selectGnomeGameState,
  (state) => state.gnomeGameState
);
