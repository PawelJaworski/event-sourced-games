import {createAction, createReducer, on, props} from '@ngrx/store';
import {createSelector, createFeatureSelector} from '@ngrx/store';
import {gameStartState, GnomeGameState, InventoryItem, Locations} from './gnome-game.state';
import {EventType} from './events/events';

export interface GnomeGameEventsState {
  events: any[];
  gnomeGameState: GnomeGameState;
}

export const addEvents = createAction(
  '[Gnome Game] Add Events',
  props<{ events: any[] }>()
);

export const initialEventsState: GnomeGameEventsState = {
  events: [],
  gnomeGameState: gameStartState
};

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

  return [...fish, ...fruits];
};

export const currentGameProjector = (state: GnomeGameState, events: any[]): GnomeGameState => ({
  ...state,
  currentLocation: currentLocationProjector(state.currentLocation, events),
  inventory: inventoryProjector(state.inventory, events),
  isFishingInProgress: events[events.length - 1]?.eventType == EventType.FISHING_STARTED,
  isPickingForestFruitsInProgress: events[events.length - 1]?.eventType == EventType.PICKING_FOREST_FRUITS_STARTED,
  isMineFlooded: state.isMineFlooded,
  currentMission: state.currentMission
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

export const selectAllEvents = createSelector(
  selectGnomeGameState,
  (state) => state.events
);
