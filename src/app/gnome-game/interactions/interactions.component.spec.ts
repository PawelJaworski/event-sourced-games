import {ComponentFixture, TestBed} from '@angular/core/testing';
import {InteractionsComponent} from './interactions.component';
import {StoreModule} from '@ngrx/store';
import {reducers} from '../../state/app.reducer';
import {Locations} from '../gnome-game.state';
import {By} from '@angular/platform-browser';
import {Store} from '@ngrx/store';
import {EventSourcingFacadeService} from '../event-sourcing-facade.service';
import {EventStoreService} from '../event-store.service';
import {StartFishingCmd} from '../commands/start-fishing-cmd';

describe('InteractionsComponent', () => {
  let component: InteractionsComponent;
  let fixture: ComponentFixture<InteractionsComponent>;
  let store: Store;
  let eventSourcingFacade: EventSourcingFacadeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InteractionsComponent],
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
    fixture = TestBed.createComponent(InteractionsComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    eventSourcingFacade = TestBed.inject(EventSourcingFacadeService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not show Start fishing button when location is not FISHERY_GROUND', () => {
    component.gameState = { currentLocation: Locations.GNOMES_HUT, inventory: [], isFishingInProgress: false };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.start-fishing-btn'));
    expect(button).toBeNull();
  });

  it('should show Start fishing button when location is FISHERY_GROUND', () => {
    component.gameState = { currentLocation: Locations.FISHERY_GROUND, inventory: [], isFishingInProgress: false };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.start-fishing-btn'));
    expect(button).not.toBeNull();
    expect(button.nativeElement.textContent).toContain('Start fishing');
  });

  it('should dispatch StartFishingCmd when Start fishing button is clicked', () => {
    spyOn(eventSourcingFacade, 'handle');
    component.gameState = { currentLocation: Locations.FISHERY_GROUND, inventory: [], isFishingInProgress: false };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.start-fishing-btn'));
    button.nativeElement.click();

    expect(eventSourcingFacade.handle).toHaveBeenCalledWith(new StartFishingCmd());
  });
});
