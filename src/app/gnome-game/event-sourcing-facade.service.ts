import {Injectable} from "@angular/core";
import {Store} from "@ngrx/store";
import {CommandGateway} from "../event-sourcing/event-sourcing-template";
import {GoToLocationCmd, goToLocationHandler} from "./commands/go-to-location-cmd";
import {CatchFishCmd, catchFishHandler} from "./commands/catch-fish-cmd";
import {StartFishingCmd, startFishingHandler} from "./commands/start-fishing-cmd";
import {StartPickingForestFruitsCmd, startPickingForestFruitsHandler} from "./commands/start-picking-forest-fruits-cmd";
import {TakeFruitsOfTheForestCmd, takeFruitsOfTheForestHandler} from "./commands/take-fruits-of-the-forest-cmd";
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
    this.commandGateway = new CommandGateway(new Map<any, any>([
      [GoToLocationCmd, goToLocationHandler],
      [CatchFishCmd, catchFishHandler],
      [StartFishingCmd, startFishingHandler],
      [StartPickingForestFruitsCmd, startPickingForestFruitsHandler],
      [TakeFruitsOfTheForestCmd, takeFruitsOfTheForestHandler]
    ]), eventStoreService.eventStore);
  }

  handle(cmd: GoToLocationCmd | CatchFishCmd | StartFishingCmd | StartPickingForestFruitsCmd | TakeFruitsOfTheForestCmd) {
    console.log("handling", cmd);
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
