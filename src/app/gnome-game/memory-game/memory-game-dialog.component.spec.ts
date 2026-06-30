import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {MemoryGameDialogComponent} from './memory-game-dialog.component';
import {Store, StoreModule} from '@ngrx/store';
import {reducers} from '../../state/app.reducer';
import {PickingForestFruitsStartedEvent} from '../events/picking-forest-fruits-started';
import {FruitsOfTheForestTakenEvent} from '../events/fruits-of-the-forest-taken';
import {addEvents} from '../gnome-game.reducer';
import {selectGameState} from '../gnome-game.reducer';
import {take} from 'rxjs/operators';
import {EventSourcingFacadeService} from '../event-sourcing-facade.service';
import {EventStoreService} from '../event-store.service';
import {GoToLocationCmd} from '../commands/go-to-location-cmd';
import {StartPickingForestFruitsCmd} from '../commands/start-picking-forest-fruits-cmd';
import {TakeFruitsOfTheForestCmd} from '../commands/take-fruits-of-the-forest-cmd';
import {Locations} from '../gnome-game.state';

describe('MemoryGameDialogComponent', () => {
  let component: MemoryGameDialogComponent;
  let fixture: ComponentFixture<MemoryGameDialogComponent>;
  let store: Store;
  let eventSourcingFacade: EventSourcingFacadeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MemoryGameDialogComponent],
      imports: [
        StoreModule.forRoot(reducers)
      ],
      providers: [
        EventStoreService,
        EventSourcingFacadeService
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MemoryGameDialogComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    eventSourcingFacade = TestBed.inject(EventSourcingFacadeService);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('given memory game finishes through facade, then dialog closes', fakeAsync(() => {
    let state: any;
    fixture.detectChanges();

    eventSourcingFacade.handle(new GoToLocationCmd(Locations.FRUITS_OF_THE_FOREST));
    tick();
    eventSourcingFacade.handle(new StartPickingForestFruitsCmd());
    tick();

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();
    expect(state.isPickingForestFruitsInProgress).toBe(true);
    expect(component.isOpen).toBe(true);

    eventSourcingFacade.handle(new TakeFruitsOfTheForestCmd());
    tick();

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();
    expect(state.isPickingForestFruitsInProgress).toBe(false);
    expect(component.isOpen).toBe(false);
  }));
});
