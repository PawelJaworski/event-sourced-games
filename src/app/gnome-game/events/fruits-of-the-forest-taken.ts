import {EVENT_TYPE} from "../../event-sourcing/event-sourcing-template";
import {EventType} from "./events";

export class FruitsOfTheForestTakenEvent {
  [EVENT_TYPE] = EventType.FRUITS_OF_THE_FOREST_TAKEN;

  constructor() {}
}
