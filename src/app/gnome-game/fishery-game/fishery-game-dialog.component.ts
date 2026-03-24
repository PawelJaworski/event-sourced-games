import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {AppState} from '../../state/app.state';
import {selectGameState} from '../gnome-game.reducer';
import {EventSourcingFacadeService} from '../event-sourcing-facade.service';
import {CatchFishCmd} from '../commands/catch-fish-cmd';

@Component({
  selector: 'app-fishery-game-dialog',
  templateUrl: './fishery-game-dialog.component.html',
  styleUrls: ['./fishery-game-dialog.component.css'],
  standalone: false
})
export class FisheryGameDialogComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  isOpen = false;

  constructor(
    private readonly store: Store<AppState>,
    private readonly commandGateway: EventSourcingFacadeService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store.select(selectGameState).subscribe(state => {
        if (state.isFishingInProgress) {
          this.isOpen = true;
        }
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

  onGameWon(): void {
    this.commandGateway.handle(new CatchFishCmd());
    this.onCloseDialog();
  }
}
