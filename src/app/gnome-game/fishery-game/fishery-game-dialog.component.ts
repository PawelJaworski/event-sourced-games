import {Component, OnInit} from '@angular/core';
import {DialogService} from '../dialog.service';

@Component({
  selector: 'app-fishery-game-dialog',
  templateUrl: './fishery-game-dialog.component.html',
  styleUrls: ['./fishery-game-dialog.component.css'],
  standalone: false
})
export class FisheryGameDialogComponent implements OnInit {
  isDialogOpen = false;

  constructor(private readonly dialogService: DialogService) {}

  ngOnInit(): void {
    this.dialogService.dialogType$.subscribe(dialogType => {
      this.isDialogOpen = dialogType === 'fishery-game';
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
