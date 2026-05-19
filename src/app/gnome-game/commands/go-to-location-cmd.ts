import {CMD_TYPE, CommandHandler} from "../../event-sourcing/event-sourcing-template";
import {CommandType} from "./commands";
import {Locations} from "../gnome-game.state";
import {WentToLocationEvent} from "../events/went-to-location";
import {GameAggregateState} from "../gnome-game.reducer";

export class GoToLocationCmd {
  [CMD_TYPE] = CommandType.GO_TO_LOCATION;

  constructor(public readonly location: Locations) {}
}

export const goToLocationHandler: CommandHandler<GameAggregateState, GoToLocationCmd> =
  (_, cmd: GoToLocationCmd) => [new WentToLocationEvent(cmd.location)]
