import {Component, OnDestroy} from '@angular/core';
import {DialogService} from '../dialog.service';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-memory-game-dialog',
  templateUrl: './memory-game-dialog.component.html',
  styleUrls: ['./memory-game-dialog.component.css'],
  standalone: false
})
export class MemoryGameDialogComponent implements OnDestroy {
  isDialogOpen = false;
  private readonly subscription: Subscription;

  constructor(private readonly dialogService: DialogService) {
    this.subscription = this.dialogService.dialogType$.subscribe(dialogType => {
      this.isDialogOpen = dialogType === 'memory-game';
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  onCloseDialog(): void {
    this.isDialogOpen = false;
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCloseDialog();
    }
  }
}
