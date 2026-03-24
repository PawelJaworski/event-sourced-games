import {TestBed, fakeAsync, tick} from '@angular/core/testing';
import {Store, StoreModule} from '@ngrx/store';
import {EventSourcingFacadeService} from './event-sourcing-facade.service';
import {EventStoreService} from './event-store.service';
import {InventoryItem, Locations} from './gnome-game.state';
import {selectGameState} from './gnome-game.reducer';
import {reducers} from '../state/app.reducer';
import {take} from 'rxjs/operators';
import {GoToLocationCmd} from './commands/go-to-location-cmd';
import {CatchFishCmd} from './commands/catch-fish-cmd';
import {StartFishingCmd} from './commands/start-fishing-cmd';

describe('EventSourcingFacadeService', () => {
  let service: EventSourcingFacadeService;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(reducers)
      ],
      providers: [
        EventStoreService,
        EventSourcingFacadeService
      ]
    });
    store = TestBed.inject(Store);
    service = TestBed.inject(EventSourcingFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit when state changes', fakeAsync(() => {
    const emissions: any[] = [];
    const sub = store.select(selectGameState).subscribe(state => {
      emissions.push(state);
    });
    tick();

    service.handle(new GoToLocationCmd(Locations.FRUITS_OF_THE_FOREST));
    tick();

    sub.unsubscribe();
    expect(emissions.length).toBe(2);
    expect(emissions[0].currentLocation).toBe(Locations.GNOMES_HUT);
    expect(emissions[1].currentLocation).toBe(Locations.FRUITS_OF_THE_FOREST);
  }));

  it('should emit when state changes (same location)', fakeAsync(() => {
    const emissions: any[] = [];
    store.select(selectGameState).pipe(
      take(1)
    ).subscribe(state => {
      emissions.push(state);
    });
    tick();

    service.handle(new GoToLocationCmd(Locations.GNOMES_HUT));
    tick();

    expect(emissions.length).toBe(1);
    expect(emissions[0].currentLocation).toBe(Locations.GNOMES_HUT);
  }));

  it('when fish is caught it\'s available in inventory', fakeAsync(() => {
    let state: any;
    store.select(selectGameState).pipe(
      take(1)
    ).subscribe(s => {
      state = s;
    });
    tick();

    expect(state.inventory).toEqual([]);

    service.handle(new CatchFishCmd());
    tick();

    store.select(selectGameState).pipe(
      take(1)
    ).subscribe(s => {
      state = s;
    });
    tick();

    expect(state.inventory).toContain(InventoryItem.FISH);
    expect(state.inventory.length).toBe(1);
  }));

  it('when fishing is started isFishingInProgress should be true', fakeAsync(() => {
    let state: any;

    service.handle(new GoToLocationCmd(Locations.FISHERY_GROUND));
    tick();

    service.handle(new StartFishingCmd());
    tick();

    store.select(selectGameState).pipe(
      take(1)
    ).subscribe(s => {
      state = s;
    });
    tick();

    expect(state.isFishingInProgress).toBe(true);
  }));

  it('when fish is caught after fishing started isFishingInProgress should be false', fakeAsync(() => {
    let state: any;

    service.handle(new GoToLocationCmd(Locations.FISHERY_GROUND));
    tick();

    service.handle(new StartFishingCmd());
    tick();

    service.handle(new CatchFishCmd());
    tick();

    store.select(selectGameState).pipe(
      take(1)
    ).subscribe(s => {
      state = s;
    });
    tick();

    expect(state.isFishingInProgress).toBe(false);
    expect(state.inventory).toContain(InventoryItem.FISH);
  }));

  it('when go to other location isFishingInProgress should be false', fakeAsync(() => {
    let state: any;

    service.handle(new GoToLocationCmd(Locations.FISHERY_GROUND));
    tick();

    service.handle(new StartFishingCmd());
    tick();

    service.handle(new GoToLocationCmd(Locations.GNOMES_HUT));
    tick();

    store.select(selectGameState).pipe(
      take(1)
    ).subscribe(s => {
      state = s;
    });
    tick();

    expect(state.isFishingInProgress).toBe(false);
    expect(state.currentLocation).toBe(Locations.GNOMES_HUT);
  }));
});
