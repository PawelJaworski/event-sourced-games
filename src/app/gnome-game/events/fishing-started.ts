import {EVENT_TYPE} from "../../event-sourcing/event-sourcing-template";
import {EventType} from "./events";

export class FishingStartedEvent {
  [EVENT_TYPE] = EventType.FISHING_STARTED;

  constructor() {}
}
