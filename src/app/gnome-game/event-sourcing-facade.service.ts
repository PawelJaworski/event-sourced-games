import {Injectable} from "@angular/core";
import {Store} from "@ngrx/store";
import {CommandGateway} from "../event-sourcing/event-sourcing-template";
import {GoToLocationCmd, goToLocationHandler} from "./commands/go-to-location-cmd";
import {EventStoreService} from "./event-store.service";
import {addEvents} from "./gnome-game.reducer";
import {AppState} from "../state/app.state";

@Injectable({
  providedIn: 'root'
})
export class EventSourcingFacadeService {

  private readonly commandGateway;

  constructor(
    private readonly store: Store<AppState>,
    eventStoreService: EventStoreService
  ) {
    this.commandGateway = new CommandGateway(new Map([
      [GoToLocationCmd, goToLocationHandler]
    ]), eventStoreService.eventStore);
  }

  handle(location: any) {
    const cmd = new GoToLocationCmd(location);
    const result = this.commandGateway.handle(cmd);
    if (result.isFailure) {
      console.error("Error: ", result.error);
      return;
    }
    const events = result.success;
    if (events.length > 0) {
      this.store.dispatch(addEvents({events}));
    }
  }
}
