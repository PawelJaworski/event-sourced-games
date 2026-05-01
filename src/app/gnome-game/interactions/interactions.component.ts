import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {AppState} from '../../state/app.state';
import {selectGameState} from '../gnome-game.reducer';
import {GnomeGameState, Locations, CurrentMission, InventoryItem} from '../gnome-game.state';
import {EventSourcingFacadeService} from '../event-sourcing-facade.service';
import {StartFishingCmd} from '../commands/start-fishing-cmd';
import {StartPickingForestFruitsCmd} from '../commands/start-picking-forest-fruits-cmd';
import {AskBeaverToRebuildDamCmd} from '../commands/ask-beaver-to-rebuild-dam-cmd';
import {ExchangeCmd} from '../commands/exchange-cmd';

@Component({
  selector: 'app-interactions',
  templateUrl: './interactions.component.html',
  styleUrls: ['./interactions.component.css'],
  standalone: false
})
export class InteractionsComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();
  gameState: GnomeGameState | null = null;
  readonly Locations = Locations;

  constructor(
    private readonly store: Store<AppState>,
    private readonly commandGateway: EventSourcingFacadeService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store.select(selectGameState).subscribe(state => {
        this.gameState = state;
        console.log('Inventory:', state.inventory);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onStartFishing(): void {
    this.commandGateway.handle(new StartFishingCmd());
  }

  onStartPickingForestFruits(): void {
    this.commandGateway.handle(new StartPickingForestFruitsCmd());
  }

  onAskBeaverToRebuildDam(): void {
    this.commandGateway.handle(new AskBeaverToRebuildDamCmd());
  }

  onExchangeFruitsForCoin(): void {
    this.commandGateway.handle(new ExchangeCmd(InventoryItem.FRUITS_OF_THE_FOREST, InventoryItem.GOLDEN_COIN));
  }

  showAskBeaverToRebuildDam(): boolean {
    return this.gameState?.currentLocation === Locations.BEAVER_DAM && 
           this.gameState?.currentMission === CurrentMission.TALK_TO_BEAVER;
  }

  showExchangeFruitsForCoin(): boolean {
    return this.gameState?.currentLocation === Locations.MARKETPLACE;
  }

  canExchangeFruits(): boolean {
    return this.gameState?.inventory?.includes(InventoryItem.FRUITS_OF_THE_FOREST) ?? false;
  }

  getLocationImage(): string {
    const imageMap: Record<string, string> = {
      [Locations.NONE]: 'assets/img/gnome.png',
      [Locations.GNOMES_HUT]: 'assets/img/gnome-house.png',
      [Locations.FISHERY_GROUND]: 'assets/img/fishery-grounds.png',
      [Locations.GOLD_MINE]: 'assets/img/gold-mine.png',
      [Locations.BEAVER_DAM]: 'assets/img/beaver-dam.png',
      [Locations.FRUITS_OF_THE_FOREST]: 'assets/img/fruits-of-the-forest.png',
      [Locations.MARKETPLACE]: 'assets/img/marketplace.png'
    };
    return this.gameState?.currentLocation ? imageMap[this.gameState.currentLocation] ?? 'assets/img/gnome.png' : 'assets/img/gnome.png';
  }

  isMineFlooded(): boolean {
    return this.gameState?.isMineFlooded === true && 
           (this.gameState?.currentLocation === Locations.GOLD_MINE || this.gameState?.currentLocation === Locations.GNOMES_HUT);
  }

  getMineFloodedMessage(): string {
    if (this.gameState?.currentLocation === Locations.GNOMES_HUT) {
      return 'The water flooded my mine. Please help me!';
    }
    return 'A beaver built a dam, and the water from the river flooded the mine. Ask the beaver to rebuild the dam so that the water does not flood the mine.';
  }
}
