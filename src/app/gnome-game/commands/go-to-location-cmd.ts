import {CMD_TYPE} from "../../event-sourcing/event-sourcing-template";
import {CommandType} from "./commands";
import {Locations} from "../gnome-game.state";

export class GoToLocationCmd {
  [CMD_TYPE] = CommandType.GO_TO_LOCATION;

  constructor(public readonly location: Locations) {}
}
