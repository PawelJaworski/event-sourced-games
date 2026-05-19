import {CMD_TYPE, CommandHandler} from "../../event-sourcing/event-sourcing-template";
import {CommandType} from "./commands";
import {FishCatchedEvent} from "../events/fish-catched";
import {GameAggregateState} from "../gnome-game.reducer";

export class CatchFishCmd {
  [CMD_TYPE] = CommandType.CATCH_FISH;

  constructor() {}
}

export const catchFishHandler: CommandHandler<GameAggregateState, CatchFishCmd> =
  () => [new FishCatchedEvent()]
