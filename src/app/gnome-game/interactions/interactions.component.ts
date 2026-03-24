import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {AppState} from '../../state/app.state';
import {selectGameState} from '../gnome-game.reducer';
import {GnomeGameState, Locations} from '../gnome-game.state';

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

  constructor(private readonly store: Store<AppState>) {}

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
}
