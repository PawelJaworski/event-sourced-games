import {EVENT_TYPE} from "../../event-sourcing/event-sourcing-template";
import {EventType} from "./events";
import {Locations} from "../gnome-game.state";

export class WentToLocationEvent {
  [EVENT_TYPE] = EventType.WENT_TO_LOCATION;

  constructor(public readonly location: Locations) {}
}
