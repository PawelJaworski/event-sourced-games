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

export const inventoryProjector = (state: InventoryItem[], events: any[]): InventoryItem[] => {
  const items = [...state];

  for (const event of events) {
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
  return [...new Set(allQuests)];
};

export const currentGameProjector = (state: GnomeGameState, events: any[]): GnomeGameState => ({
  ...state,
  currentLocation: currentLocationProjector(state.currentLocation, events),
  inventory: inventoryProjector(state.inventory, events),
  isFishingInProgress: events[events.length - 1]?.eventType == EventType.FISHING_STARTED,
  isPickingForestFruitsInProgress: events[events.length - 1]?.eventType == EventType.PICKING_FOREST_FRUITS_STARTED,
  isMineFlooded: state.isMineFlooded,
  activeQuests: activeQuestsProjector(state.activeQuests, events)
});

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
