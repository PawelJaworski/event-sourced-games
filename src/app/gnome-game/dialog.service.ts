import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Store} from '@ngrx/store';
import {filter} from 'rxjs/operators';
import {Locations} from './gnome-game.state';
import {selectGameState} from './gnome-game.reducer';
import {AppState} from '../state/app.state';

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

  constructor(private readonly store: Store<AppState>) {
    this.store.select(selectGameState).pipe(
      filter(state => this.locationDialogMap.has(state.currentLocation))
    ).subscribe(state => {
      this.locationDialogMap.get(state.currentLocation)!();
    });
  }

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
}
