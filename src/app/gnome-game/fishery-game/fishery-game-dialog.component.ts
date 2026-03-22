import {Component, EventEmitter, Input, OnChanges, Output, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-fishery-game-dialog',
  templateUrl: './fishery-game-dialog.component.html',
  styleUrls: ['./fishery-game-dialog.component.css'],
  standalone: false
})
export class FisheryGameDialogComponent implements OnChanges {
  @Input()
  openedTimestamp: string | null = null;

  @Output()
  gameWon = new EventEmitter<void>();

  isOpen = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['openedTimestamp'] && this.openedTimestamp) {
      this.isOpen = true;
    }
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