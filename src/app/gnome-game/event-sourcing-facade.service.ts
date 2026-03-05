import {Injectable} from "@angular/core";
import {
  CommandGateway,
  composeProjectors,
  EventStore,
  Projector,
  Result
} from "../event-sourcing/event-sourcing-template";
import {GoToLocationCmd, goToLocationHandler} from "./commands/go-to-location-cmd";
import {EventStoreService} from "./event-store.service";
import {gameStartState, GnomeGameState, Locations} from "./gnome-game.state";
import {WentToLocationEvent} from "./events/went-to-location";

@Injectable({
  providedIn: 'root'
})
export class EventSourcingFacadeService {

  private readonly commandGateway;
  private readonly stateProjector;
  private gameState = gameStartState;

  constructor(eventStoreService: EventStoreService) {
    this.commandGateway = new CommandGateway(new Map([
      [GoToLocationCmd, goToLocationHandler]
    ]), eventStoreService.eventStore);
    this.stateProjector = composeProjectors([locationProjector]);
  }

  handle(cmd: any) {
    const result = this.commandGateway.handle(cmd);
    if (result.isFailure) {
      console.error("Error: ", result.error)
      return;
    }
    const events = result.success
    this.gameState = this.stateProjector(this.gameState, events);
  }

  get getGameState() {
    return this.gameState;
  }
}
const locationProjector: Projector<GnomeGameState> = (state: GnomeGameState, events: any[]) => {
  const currentLocation = events
    .filter(it => it instanceof WentToLocationEvent)
    .map(it => it.location)
    .reduce((f, s) => s, Locations.GNOMES_HUT);

  return {
    ...state,
    currentLocation
  };
}
