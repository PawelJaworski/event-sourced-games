import {CMD_TYPE, CommandHandler} from "../../event-sourcing/event-sourcing-template";
import {CommandType} from "./commands";
import {FruitsOfTheForestTakenEvent} from "../events/fruits-of-the-forest-taken";
import {GameAggregateState} from "../gnome-game.reducer";

export class TakeFruitsOfTheForestCmd {
  [CMD_TYPE] = CommandType.TAKE_FRUITS_OF_THE_FOREST;

  constructor() {}
}

export const takeFruitsOfTheForestHandler: CommandHandler<GameAggregateState, TakeFruitsOfTheForestCmd> =
  () => [new FruitsOfTheForestTakenEvent()]
