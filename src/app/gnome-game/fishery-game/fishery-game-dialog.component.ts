import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {AppState} from '../../state/app.state';
import {selectGameState} from '../gnome-game.reducer';

@Component({
  selector: 'app-fishery-game-dialog',
  templateUrl: './fishery-game-dialog.component.html',
  styleUrls: ['./fishery-game-dialog.component.css'],
  standalone: false
})
export class FisheryGameDialogComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  isOpen = false;

  constructor(private readonly store: Store<AppState>) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store.select(selectGameState).subscribe(state => {
        this.isOpen = state.isFishingInProgress;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onCloseDialog(): void {
    this.isOpen = false;
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCloseDialog();
    }
  }
}
