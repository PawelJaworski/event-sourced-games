import {CMD_TYPE, CommandHandler} from "../../event-sourcing/event-sourcing-template";
import {CommandType} from "./commands";
import {FishingStartedEvent} from "../events/fishing-started";
import {GameAggregateState} from "../gnome-game.reducer";

export class StartFishingCmd {
  [CMD_TYPE] = CommandType.START_FISHING;

  constructor() {}
}

export const startFishingHandler: CommandHandler<GameAggregateState, StartFishingCmd> =
  () => [new FishingStartedEvent()]
