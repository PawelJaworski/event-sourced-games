import {CMD_TYPE, CommandHandler} from "../../event-sourcing/event-sourcing-template";
import {CommandType} from "./commands";
import {FishingStartedEvent} from "../events/fishing-started";

export class StartFishingCmd {
  [CMD_TYPE] = CommandType.START_FISHING;

  constructor() {}
}

export const startFishingHandler: CommandHandler<StartFishingCmd> =
  () => [new FishingStartedEvent()]
