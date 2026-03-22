import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Locations} from './gnome-game.state';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly dialogTypeSubject = new BehaviorSubject<string>('');
  readonly dialogType$: Observable<string> = this.dialogTypeSubject.asObservable();
  private readonly locationDialogMap: ReadonlyMap<Locations, () => void> = new Map<Locations, () => void>([
    [Locations.FRUITS_OF_THE_FOREST, () => this.openMemoryGameDialog()],
    [Locations.FISHERY_GROUND, () => this.openFisheryGameDialog()],
  ]);

  openDialogByLocation(location: Locations): void {
    const dialogOpener = this.locationDialogMap.get(location);
    if (dialogOpener) {
      dialogOpener();
    }
  }

  isMemoryGameDialogOpen(): boolean {
    return this.dialogTypeSubject.value === 'memory-game';
  }

  isFisheryGameDialogOpen(): boolean {
    return this.dialogTypeSubject.value === 'fishery-game';
  }

  private openMemoryGameDialog(): void {
    if (this.dialogTypeSubject.value === 'memory-game') return;
    this.dialogTypeSubject.next('memory-game');
  }

  private openFisheryGameDialog(): void {
    if (this.dialogTypeSubject.value === 'fishery-game') return;
    this.dialogTypeSubject.next('fishery-game');
  }
}
