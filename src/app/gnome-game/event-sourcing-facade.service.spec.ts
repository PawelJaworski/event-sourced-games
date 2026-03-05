import {TestBed} from '@angular/core/testing';
import {EventSourcingFacadeService} from './event-sourcing-facade.service';
import {EventStoreService} from './event-store.service';
import {GoToLocationCmd} from './commands/go-to-location-cmd';
import {Locations} from './gnome-game.state';
import {take} from 'rxjs/operators';

describe('EventSourcingFacadeService', () => {
  let service: EventSourcingFacadeService;
  let eventStoreService: EventStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventStoreService,
        EventSourcingFacadeService
      ]
    });
    eventStoreService = TestBed.inject(EventStoreService);
    service = TestBed.inject(EventSourcingFacadeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit when state changes', (done) => {
    const emissions: any[] = [];
    const sub = service.gameState$.pipe(take(2)).subscribe(state => {
      emissions.push(state);
    });

    service.handle(new GoToLocationCmd(Locations.FRUITS_OF_THE_FOREST));

    setTimeout(() => {
      sub.unsubscribe();
      expect(emissions.length).toBe(2);
      expect(emissions[0].currentLocation).toBe(Locations.GNOMES_HUT);
      expect(emissions[1].currentLocation).toBe(Locations.FRUITS_OF_THE_FOREST);
      done();
    }, 0);
  });

  it('should NOT emit when state does not change', (done) => {
    const emissions: any[] = [];
    service.gameState$.pipe(take(1)).subscribe(state => {
      emissions.push(state);
    });

    service.handle(new GoToLocationCmd(Locations.GNOMES_HUT));

    setTimeout(() => {
      expect(emissions.length).toBe(1);
      expect(emissions[0].currentLocation).toBe(Locations.GNOMES_HUT);
      done();
    }, 0);
  });
});
