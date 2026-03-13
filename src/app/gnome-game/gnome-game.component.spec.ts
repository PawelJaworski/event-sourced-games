import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {GnomeGameComponent} from "./gnome-game.component";
import {GameTokenService} from './service/game-token.service';
import {DialogService} from './dialog.service';
import {EventSourcingFacadeService} from './event-sourcing-facade.service';
import {BehaviorSubject} from 'rxjs';
import {Locations, GnomeGameState} from './gnome-game.state';

describe('GnomeGameComponent', () => {
  let component: GnomeGameComponent;
  let fixture: ComponentFixture<GnomeGameComponent>;
  let dialogService: DialogService;
  let gameStateSubject: BehaviorSubject<GnomeGameState>;

  const mockGameState: GnomeGameState = {
    currentLocation: Locations.GNOMES_HUT
  };

  beforeEach(async () => {
    gameStateSubject = new BehaviorSubject<GnomeGameState>(mockGameState);

    await TestBed.configureTestingModule({
      declarations: [GnomeGameComponent],
      providers: [
        DialogService,
        GameTokenService,
        {
          provide: EventSourcingFacadeService,
          useValue: {
            gameState$: gameStateSubject.asObservable(),
            getGameState: mockGameState,
            handle: jasmine.createSpy('handle')
          }
        }
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GnomeGameComponent);
    component = fixture.componentInstance;
    dialogService = TestBed.inject(DialogService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Token click opens correct game dialog', () => {
    it('should open memory game dialog when Fruits of the Forest token is clicked', fakeAsync(() => {
      gameStateSubject.next({
        currentLocation: Locations.FRUITS_OF_THE_FOREST
      });
      tick();

      expect(dialogService.isMemoryGameDialogOpen()).toBe(true);
      expect(dialogService.isFisheryGameDialogOpen()).toBe(false);
    }));

    it('should open fishery game dialog when Fishery Ground token is clicked', fakeAsync(() => {
      gameStateSubject.next({
        currentLocation: Locations.FISHERY_GROUND
      });
      tick();

      expect(dialogService.isFisheryGameDialogOpen()).toBe(true);
      expect(dialogService.isMemoryGameDialogOpen()).toBe(false);
    }));

    it('should not open memory game dialog when fishery game token is clicked', fakeAsync(() => {
      gameStateSubject.next({
        currentLocation: Locations.FISHERY_GROUND
      });
      tick();

      expect(dialogService.isMemoryGameDialogOpen()).toBe(false);
      expect(dialogService.isFisheryGameDialogOpen()).toBe(true);
    }));

    it('should not open fishery game dialog when memory game token is clicked', fakeAsync(() => {
      gameStateSubject.next({
        currentLocation: Locations.FRUITS_OF_THE_FOREST
      });
      tick();

      expect(dialogService.isFisheryGameDialogOpen()).toBe(false);
      expect(dialogService.isMemoryGameDialogOpen()).toBe(true);
    }));
  });
});
