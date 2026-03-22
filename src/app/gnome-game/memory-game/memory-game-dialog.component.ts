import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
  selector: 'app-memory-game-dialog',
  templateUrl: './memory-game-dialog.component.html',
  styleUrls: ['./memory-game-dialog.component.css'],
  standalone: false
})
export class MemoryGameDialogComponent implements OnChanges {
  @Input()
  openedTimestamp: string | null = null;

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