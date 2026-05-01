import {Injectable} from "@angular/core";
import {Store} from "@ngrx/store";
import {CommandGateway} from "../event-sourcing/event-sourcing-template";
import {GoToLocationCmd, goToLocationHandler} from "./commands/go-to-location-cmd";
import {CatchFishCmd, catchFishHandler} from "./commands/catch-fish-cmd";
import {StartFishingCmd, startFishingHandler} from "./commands/start-fishing-cmd";
import {StartPickingForestFruitsCmd, startPickingForestFruitsHandler} from "./commands/start-picking-forest-fruits-cmd";
import {TakeFruitsOfTheForestCmd, takeFruitsOfTheForestHandler} from "./commands/take-fruits-of-the-forest-cmd";
import {AskBeaverToRebuildDamCmd, askBeaverToRebuildDamHandler} from "./commands/ask-beaver-to-rebuild-dam-cmd";
import {ExchangeCmd, exchangeCmdHandler} from "./commands/exchange-cmd";
import {EventStoreService} from "./event-store.service";
import {addEvents} from "./gnome-game.reducer";
import {AppState} from "../state/app.state";
import {Locations, InventoryItem} from './gnome-game.state';

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
      [TakeFruitsOfTheForestCmd, takeFruitsOfTheForestHandler],
      [AskBeaverToRebuildDamCmd, askBeaverToRebuildDamHandler],
      [ExchangeCmd, exchangeCmdHandler]
    ]), eventStoreService.eventStore);

    (window as any).cheat = {
      goTo: (location: string) => {
        const loc = Locations[location as keyof typeof Locations];
        if (!loc) { console.error('Invalid location:', location); return; }
        this.handle(new GoToLocationCmd(loc));
      },
      catchFish: () => this.handle(new CatchFishCmd()),
      startFishing: () => this.handle(new StartFishingCmd()),
      startPickingForestFruits: () => this.handle(new StartPickingForestFruitsCmd()),
      takeFruits: () => this.handle(new TakeFruitsOfTheForestCmd()),
      askBeaverToRebuildDam: () => this.handle(new AskBeaverToRebuildDamCmd()),
      exchange: (from: string, to: string) => {
        const fromItem = InventoryItem[from as keyof typeof InventoryItem];
        const toItem = InventoryItem[to as keyof typeof InventoryItem];
        if (!fromItem || !toItem) { console.error('Invalid inventory item:', from, to); return; }
        this.handle(new ExchangeCmd(fromItem, toItem));
      },
      help: () => console.log('Available commands: goTo(location), catchFish, startFishing, startPickingForestFruits, takeFruits, askBeaverToRebuildDam, exchange(from, to)')
    };
    console.log('Cheat commands available: window.cheat.help()');
  }

  handle(cmd: GoToLocationCmd | CatchFishCmd | StartFishingCmd | StartPickingForestFruitsCmd | TakeFruitsOfTheForestCmd | AskBeaverToRebuildDamCmd | ExchangeCmd) {
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
