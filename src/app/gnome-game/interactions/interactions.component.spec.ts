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
import {StartPickingForestFruitsCmd} from '../commands/start-picking-forest-fruits-cmd';

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
    component.gameState = { currentLocation: Locations.GNOMES_HUT, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.action-btn'));
    expect(button).toBeNull();
  });

  it('should show Start fishing button when location is FISHERY_GROUND', () => {
    component.gameState = { currentLocation: Locations.FISHERY_GROUND, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.action-btn'));
    expect(button).not.toBeNull();
    expect(button.nativeElement.textContent).toContain('Start fishing');
  });

  it('should dispatch StartFishingCmd when Start fishing button is clicked', () => {
    spyOn(eventSourcingFacade, 'handle');
    component.gameState = { currentLocation: Locations.FISHERY_GROUND, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.action-btn'));
    button.nativeElement.click();

    expect(eventSourcingFacade.handle).toHaveBeenCalledWith(new StartFishingCmd());
  });

  it('should not show Begin gathering wild fruits button when location is not FRUITS_OF_THE_FOREST', () => {
    component.gameState = { currentLocation: Locations.GNOMES_HUT, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.action-btn'));
    expect(button).toBeNull();
  });

  it('should show Begin gathering wild fruits button when location is FRUITS_OF_THE_FOREST', () => {
    component.gameState = { currentLocation: Locations.FRUITS_OF_THE_FOREST, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.action-btn'));
    expect(button).not.toBeNull();
    expect(button.nativeElement.textContent).toContain('Begin gathering wild fruits');
  });

  it('should dispatch StartPickingForestFruitsCmd when Begin gathering wild fruits button is clicked', () => {
    spyOn(eventSourcingFacade, 'handle');
    component.gameState = { currentLocation: Locations.FRUITS_OF_THE_FOREST, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.action-btn'));
    button.nativeElement.click();

    expect(eventSourcingFacade.handle).toHaveBeenCalledWith(new StartPickingForestFruitsCmd());
  });

  it('should return gnome.png when location is NONE', () => {
    component.gameState = { currentLocation: Locations.NONE, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    expect(component.getLocationImage()).toBe('assets/img/gnome.png');
  });

  it('should return gnome-house.png when location is GNOMES_HUT', () => {
    component.gameState = { currentLocation: Locations.GNOMES_HUT, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    expect(component.getLocationImage()).toBe('assets/img/gnome-house.png');
  });

  it('should return fishery-grounds.png when location is FISHERY_GROUND', () => {
    component.gameState = { currentLocation: Locations.FISHERY_GROUND, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    expect(component.getLocationImage()).toBe('assets/img/fishery-grounds.png');
  });

  it('should return gold-mine.png when location is GOLD_MINE', () => {
    component.gameState = { currentLocation: Locations.GOLD_MINE, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    expect(component.getLocationImage()).toBe('assets/img/gold-mine.png');
  });

  it('should return beaver-dam.png when location is BEAVER_DAM', () => {
    component.gameState = { currentLocation: Locations.BEAVER_DAM, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    expect(component.getLocationImage()).toBe('assets/img/beaver-dam.png');
  });

  it('should return fruits-of-the-forest.png when location is FRUITS_OF_THE_FOREST', () => {
    component.gameState = { currentLocation: Locations.FRUITS_OF_THE_FOREST, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    expect(component.getLocationImage()).toBe('assets/img/fruits-of-the-forest.png');
  });

  it('should return marketplace.png when location is MARKETPLACE', () => {
    component.gameState = { currentLocation: Locations.MARKETPLACE, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    expect(component.getLocationImage()).toBe('assets/img/marketplace.png');
  });

  it('should display location image in the template', () => {
    component.gameState = { currentLocation: Locations.GNOMES_HUT, inventory: [], isFishingInProgress: false, isPickingForestFruitsInProgress: false };
    fixture.changeDetectorRef.markForCheck();
    fixture.detectChanges();

    const imageContainer = fixture.debugElement.query(By.css('.location-image'));
    expect(imageContainer).not.toBeNull();
    const img = fixture.debugElement.query(By.css('.location-image img'));
    expect(img).not.toBeNull();
    expect(img.nativeElement.src).toContain('assets/img/gnome-house.png');
  });
});
