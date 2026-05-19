import {CMD_TYPE, CommandHandler} from "../../event-sourcing/event-sourcing-template";
import {CommandType} from "./commands";
import {PickingForestFruitsStartedEvent} from "../events/picking-forest-fruits-started";
import {GameAggregateState} from "../gnome-game.reducer";

export class StartPickingForestFruitsCmd {
  [CMD_TYPE] = CommandType.START_PICKING_FOREST_FRUITS;

  constructor() {}
}

export const startPickingForestFruitsHandler: CommandHandler<GameAggregateState, StartPickingForestFruitsCmd> =
  () => [new PickingForestFruitsStartedEvent()]
