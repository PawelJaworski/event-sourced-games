import {
  ActionReducer,
  ActionReducerMap, createAction,
  createReducer,
  MetaReducer, on
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import {AppState} from "./app.state";
import {gnomeGameEventsReducer} from "../gnome-game/gnome-game.reducer";

export const turnInitialState = 0;

export const gotoNextTurn = createAction('[Turn] Goto next turn');
const turnReducer = createReducer(
  turnInitialState,
  on(gotoNextTurn, (state) => state + 1)
);

export const nextDate = createAction('[Time] nextDate')

export const reducers: ActionReducerMap<AppState> = {
    turn: turnReducer,
    gnomeGameEvents: gnomeGameEventsReducer
};


export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];




