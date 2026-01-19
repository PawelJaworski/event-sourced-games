import {Component, OnInit} from '@angular/core';
import {DialogService} from './dialog.service';

@Component({
  selector: 'app-memory-game-dialog',
  templateUrl: './memory-game-dialog.component.html',
  styleUrls: ['./memory-game-dialog.component.css'],
  standalone: false
})
export class MemoryGameDialogComponent implements OnInit {
  isDialogOpen = false;

  constructor(private readonly dialogService: DialogService) {}

  ngOnInit(): void {
    this.dialogService.isDialogOpen$.subscribe(isOpen => {
      this.isDialogOpen = isOpen;
    });
  }

  onCloseDialog(): void {
    this.dialogService.closeDialog();
  }

  onOverlayClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.onCloseDialog();
    }
  }
}