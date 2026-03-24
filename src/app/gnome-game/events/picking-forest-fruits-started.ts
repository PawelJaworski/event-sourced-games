import {EVENT_TYPE} from "../../event-sourcing/event-sourcing-template";
import {EventType} from "./events";

export class PickingForestFruitsStartedEvent {
  [EVENT_TYPE] = EventType.PICKING_FOREST_FRUITS_STARTED;

  constructor() {}
}
