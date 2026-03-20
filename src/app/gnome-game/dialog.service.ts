import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Locations} from './gnome-game.state';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly isDialogOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly dialogTypeSubject = new BehaviorSubject<string>('');

  readonly isDialogOpen$ = this.isDialogOpenSubject.asObservable();
  readonly dialogType$ = this.dialogTypeSubject.asObservable();

  private readonly locationDialogMap = new Map<Locations, () => void>([
    [Locations.FRUITS_OF_THE_FOREST, () => this.openMemoryGameDialog()],
    [Locations.FISHERY_GROUND, () => this.openFisheryGameDialog()],
  ]);

  constructor() {}

  openMemoryGameDialog(): void {
    if (this.dialogTypeSubject.value === 'memory-game') return;
    this.dialogTypeSubject.next('memory-game');
    this.isDialogOpenSubject.next(true);
  }

  openFisheryGameDialog(): void {
    if (this.dialogTypeSubject.value === 'fishery-game') return;
    this.dialogTypeSubject.next('fishery-game');
    this.isDialogOpenSubject.next(true);
  }

  closeDialog(): void {
    this.isDialogOpenSubject.next(false);
    this.dialogTypeSubject.next('');
  }

  isMemoryGameDialogOpen(): boolean {
    return this.isDialogOpenSubject.value && this.dialogTypeSubject.value === 'memory-game';
  }

  isFisheryGameDialogOpen(): boolean {
    return this.isDialogOpenSubject.value && this.dialogTypeSubject.value === 'fishery-game';
  }

  openDialogByLocation(location: Locations): void {
    const dialogOpener = this.locationDialogMap.get(location);
    if (dialogOpener) {
      dialogOpener();
    }
  }
}
