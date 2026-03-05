import {Injectable} from "@angular/core";
import {EventStore} from "../event-sourcing/event-sourcing-template";

@Injectable({
  providedIn: 'root'
})
export class EventStoreService {
  readonly eventStore = new EventStore();
}
