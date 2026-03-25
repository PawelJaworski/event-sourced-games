import {ComponentFixture, TestBed, fakeAsync, tick} from '@angular/core/testing';
import {Store, StoreModule} from '@ngrx/store';
import {InventoryComponent} from './inventory.component';
import {EventSourcingFacadeService} from '../event-sourcing-facade.service';
import {EventStoreService} from '../event-store.service';
import {reducers} from '../../state/app.reducer';
import {InventoryItem} from '../gnome-game.state';
import {CatchFishCmd} from '../commands/catch-fish-cmd';
import {TakeFruitsOfTheForestCmd} from '../commands/take-fruits-of-the-forest-cmd';

describe('InventoryComponent', () => {
  let component: InventoryComponent;
  let fixture: ComponentFixture<InventoryComponent>;
  let commandGateway: EventSourcingFacadeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InventoryComponent],
      imports: [
        StoreModule.forRoot(reducers)
      ],
      providers: [
        EventStoreService,
        EventSourcingFacadeService
      ]
    }).compileComponents();

    commandGateway = TestBed.inject(EventSourcingFacadeService);
    fixture = TestBed.createComponent(InventoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('when fish is collected then it appears on inventory list', fakeAsync(() => {
    commandGateway.handle(new CatchFishCmd());
    tick();
    fixture.detectChanges();

    expect(component.inventory).toContain(InventoryItem.FISH);
    expect(component.getItemImage(InventoryItem.FISH)).toBe('assets/img/inventory/fish.png');
  }));

  it('when fruits of the forest are collected then they appear on inventory list', fakeAsync(() => {
    commandGateway.handle(new TakeFruitsOfTheForestCmd());
    tick();
    fixture.detectChanges();

    expect(component.inventory).toContain(InventoryItem.FRUITS_OF_THE_FOREST);
    expect(component.getItemImage(InventoryItem.FRUITS_OF_THE_FOREST)).toBe('assets/img/inventory/fruits-of-the-forest.png');
  }));

  it('when multiple items collected then all appear on inventory list', fakeAsync(() => {
    commandGateway.handle(new CatchFishCmd());
    tick();
    commandGateway.handle(new TakeFruitsOfTheForestCmd());
    tick();
    fixture.detectChanges();

    expect(component.inventory).toContain(InventoryItem.FISH);
    expect(component.inventory).toContain(InventoryItem.FRUITS_OF_THE_FOREST);
    expect(component.inventory.length).toBe(2);
  }));
});
