import {createAction, createReducer, on, props} from '@ngrx/store';
import {createSelector, createFeatureSelector} from '@ngrx/store';
import {gameStartState, GnomeGameState, InventoryItem, Locations, Quest} from './gnome-game.state';
import {EventType} from './events/events';

export interface GameAggregateState {}
export const initialAggregateState: GameAggregateState = {}

export interface GnomeGameEventsState {
  events: any[];
  gnomeGameState: GnomeGameState;
}
export const initialEventsState: GnomeGameEventsState = {
  events: [],
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
  const fish = events
    .filter((e: any) => e?.eventType === EventType.FISH_CATCHED)
    .map(() => InventoryItem.FISH);

  const fruits = events
    .filter((e: any) => e?.eventType === EventType.FRUITS_OF_THE_FOREST_TAKEN)
    .map(() => InventoryItem.FRUITS_OF_THE_FOREST);

  const goldenCoins = events
    .filter((e: any) => e?.eventType === EventType.GOLDEN_COIN_EARNED)
    .map(() => InventoryItem.GOLDEN_COIN);

  const removedFruits = events
    .filter((e: any) => e?.eventType === EventType.GOLDEN_COIN_EARNED && e?.from === InventoryItem.FRUITS_OF_THE_FOREST)
    .length;

  const filteredFruits = fruits.slice(0, fruits.length - removedFruits);

  return [...fish, ...filteredFruits, ...goldenCoins];
};

export const activeQuestsProjector = (state: Quest[], events: any[]): Quest[] => {
  const addedQuests = events
    .filter((e: any) => e?.eventType === EventType.QUEST_ADDED)
    .map((e: any) => e.quest);

  return [...state, ...addedQuests];
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
  on(addEvents, (state, {events}) => {
    const allEvents = [...state.events, ...events];
    return {
      ...state,
      events: allEvents,
      gnomeGameState: currentGameProjector(state.gnomeGameState, allEvents)
    };
  })
);

export const selectGnomeGameState = createFeatureSelector<GnomeGameEventsState>('gnomeGameEvents');

export const selectGameState = createSelector(
  selectGnomeGameState,
  (state) => state.gnomeGameState
);
