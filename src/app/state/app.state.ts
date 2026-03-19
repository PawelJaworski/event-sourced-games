import {GnomeGameEventsState} from "../gnome-game/gnome-game.reducer";

export interface AppState {
  turn: number;
  gnomeGameEvents: GnomeGameEventsState;
}
