import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private readonly isDialogOpenSubject = new BehaviorSubject<boolean>(false);
  private readonly dialogTypeSubject = new BehaviorSubject<string>('');

  readonly isDialogOpen$ = this.isDialogOpenSubject.asObservable();
  readonly dialogType$ = this.dialogTypeSubject.asObservable();

  openMemoryGameDialog(): void {
    this.dialogTypeSubject.next('memory-game');
    this.isDialogOpenSubject.next(true);
  }

  closeDialog(): void {
    this.isDialogOpenSubject.next(false);
    this.dialogTypeSubject.next('');
  }

  isMemoryGameDialogOpen(): boolean {
    return this.isDialogOpenSubject.value && this.dialogTypeSubject.value === 'memory-game';
  }
}
