import {
  ActionReducer,
  ActionReducerMap, createAction,
  createFeatureSelector, createReducer,
  createSelector,
  MetaReducer, on, props
} from '@ngrx/store';
import { environment } from '../../environments/environment';
import {AppState} from "./app.state";

export const turnInitialState = 0;

export const gotoNextTurn = createAction('[Turn] Goto next turn');
const turnReducer = createReducer(
  turnInitialState,
  on(gotoNextTurn, (state) => state + 1)
);

export const nextDate = createAction('[Time] nextDate')

export const reducers: ActionReducerMap<AppState> = {
    turn: turnReducer,
};


export const metaReducers: MetaReducer<AppState>[] = !environment.production ? [] : [];




