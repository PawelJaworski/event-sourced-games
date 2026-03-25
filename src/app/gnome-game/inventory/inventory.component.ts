import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {AppState} from '../../state/app.state';
import {selectGameState} from '../gnome-game.reducer';
import {GnomeGameState, InventoryItem} from '../gnome-game.state';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css'],
  standalone: false
})
export class InventoryComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();
  inventory: InventoryItem[] = [];

  private readonly itemImages: Record<string, string> = {
    [InventoryItem.FISH]: 'assets/img/inventory/fish.png',
    [InventoryItem.FRUITS_OF_THE_FOREST]: 'assets/img/inventory/fruits-of-the-forest.png',
    [InventoryItem.GOLDEN_COIN]: 'assets/img/inventory/golden-coin.png'
  };

  constructor(private readonly store: Store<AppState>) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store.select(selectGameState).subscribe(state => {
        this.inventory = state.inventory;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  getItemImage(item: InventoryItem): string {
    return this.itemImages[item] ?? '';
  }

  trackByItem(index: number, item: InventoryItem): string {
    return item;
  }
}
