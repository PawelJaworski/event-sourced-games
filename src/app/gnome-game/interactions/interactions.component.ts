import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {AppState} from '../../state/app.state';
import {selectGameState} from '../gnome-game.reducer';
import {GnomeGameState, Locations} from '../gnome-game.state';
import {EventSourcingFacadeService} from '../event-sourcing-facade.service';
import {StartFishingCmd} from '../commands/start-fishing-cmd';
import {StartPickingForestFruitsCmd} from '../commands/start-picking-forest-fruits-cmd';

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
}
