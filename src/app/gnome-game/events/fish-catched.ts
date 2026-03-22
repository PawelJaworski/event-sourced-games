import {EVENT_TYPE} from "../../event-sourcing/event-sourcing-template";
import {EventType} from "./events";

export class FishCatchedEvent {
  [EVENT_TYPE] = EventType.FISH_CATCHED;

  constructor() {}
}
