import {createAction, createReducer, on, props} from '@ngrx/store';
import {createSelector, createFeatureSelector} from '@ngrx/store';
import {gameStartState, GnomeGameState, Locations} from './gnome-game.state';
import {EventType} from './events/events';

export interface GnomeGameEventsState {
  events: any[];
}

export const addEvents = createAction(
  '[Gnome Game] Add Events',
  props<{ events: any[] }>()
);

export const initialEventsState: GnomeGameEventsState = {
  events: []
};

export const gnomeGameEventsReducer = createReducer(
  initialEventsState,
  on(addEvents, (state, {events}) => ({
    ...state,
    events: [...state.events, ...events]
  }))
);

export const selectGnomeGameEventsState = createFeatureSelector<GnomeGameEventsState>('gnomeGameEvents');

export const selectAllEvents = createSelector(
  selectGnomeGameEventsState,
  (state) => state.events
);

export const selectGameState = createSelector(
  selectAllEvents,
  (events) => {
    const currentLocation = events
      .filter((e: any) => e?.eventType === EventType.WENT_TO_LOCATION)
      .map((e: any) => e.location)
      .reduce((_: any, s: Locations) => s, Locations.GNOMES_HUT);

    return {
      ...gameStartState,
      currentLocation
    };
  }
);
