import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Subscription} from 'rxjs';
import {AppState} from '../../state/app.state';
import {selectGameState} from '../gnome-game.reducer';
import {EventSourcingFacadeService} from '../event-sourcing-facade.service';
import {TakeFruitsOfTheForestCmd} from '../commands/take-fruits-of-the-forest-cmd';

@Component({
  selector: 'app-memory-game-dialog',
  templateUrl: './memory-game-dialog.component.html',
  styleUrls: ['./memory-game-dialog.component.css'],
  standalone: false
})
export class MemoryGameDialogComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  isOpen = false;

  constructor(
    private readonly store: Store<AppState>,
    private readonly commandGateway: EventSourcingFacadeService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store.select(selectGameState).subscribe(state => {
        if (state.isPickingForestFruitsInProgress) {
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
    this.commandGateway.handle(new TakeFruitsOfTheForestCmd());
    this.onCloseDialog();
  }
}
