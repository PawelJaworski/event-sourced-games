import {CMD_TYPE, CommandHandler} from "../../event-sourcing/event-sourcing-template";
import {CommandType} from "./commands";
import {Locations} from "../gnome-game.state";
import {WentToLocationEvent} from "../events/went-to-location";

export class GoToLocationCmd {
  [CMD_TYPE] = CommandType.GO_TO_LOCATION;

  constructor(public readonly location: Locations) {}
}

export const goToLocationHandler: CommandHandler<GoToLocationCmd> =
  (events: any[], cmd: GoToLocationCmd) => [new WentToLocationEvent(cmd.location)]
