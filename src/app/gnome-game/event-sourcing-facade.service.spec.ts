import {TestBed, fakeAsync, tick} from '@angular/core/testing';
import {Store, StoreModule} from '@ngrx/store';
import {EventSourcingFacadeService} from './event-sourcing-facade.service';
import {EventStoreService} from './event-store.service';
import {InventoryItem, Locations, Quest} from './gnome-game.state';
import {selectGameState} from './gnome-game.reducer';
import {reducers} from '../state/app.reducer';
import {take} from 'rxjs/operators';
import {GoToLocationCmd} from './commands/go-to-location-cmd';
import {CatchFishCmd} from './commands/catch-fish-cmd';
import {StartFishingCmd} from './commands/start-fishing-cmd';
import {StartPickingForestFruitsCmd} from './commands/start-picking-forest-fruits-cmd';
import {TakeFruitsOfTheForestCmd} from './commands/take-fruits-of-the-forest-cmd';
import {ExchangeCmd} from './commands/exchange-cmd';
import {AskBeaverToRebuildDamCmd} from './commands/ask-beaver-to-rebuild-dam-cmd';
import {GiveFishToBeaverCmd} from './commands/give-fish-to-beaver-cmd';

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

  it('given player is at Gnome\'s Hut, when player goes to Fruits of the Forest, then player arrives at Fruits of the Forest', fakeAsync(() => {
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

  it('given player is at Gnome\'s Hut, when player goes to Gnome\'s Hut, then player stays at Gnome\'s Hut', fakeAsync(() => {
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

  it('given player catches a fish, then fish is in inventory', fakeAsync(() => {
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

  it('given player is at Fishery Ground with fishing net, when player starts fishing, then fishing is in progress', fakeAsync(() => {
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

  it('given player is fishing at Fishery Ground, when player catches a fish, then fish is in inventory and fishing is no longer in progress', fakeAsync(() => {
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

  it('given player is fishing at Fishery Ground, when player goes to Gnome\'s Hut, then fishing is no longer in progress and player is at Gnome\'s Hut', fakeAsync(() => {
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

  it('given player is at Fruits of the Forest, when player starts picking, then picking is in progress', fakeAsync(() => {
    let state: any;

    service.handle(new GoToLocationCmd(Locations.FRUITS_OF_THE_FOREST));
    tick();

    service.handle(new StartPickingForestFruitsCmd());
    tick();

    store.select(selectGameState).pipe(
      take(1)
    ).subscribe(s => {
      state = s;
    });
    tick();

    expect(state.isPickingForestFruitsInProgress).toBe(true);
  }));

  it('given player is picking fruits at Fruits of the Forest, when player takes the fruits, then fruits are in inventory and picking is no longer in progress', fakeAsync(() => {
    let state: any;

    service.handle(new GoToLocationCmd(Locations.FRUITS_OF_THE_FOREST));
    tick();

    service.handle(new StartPickingForestFruitsCmd());
    tick();

    service.handle(new TakeFruitsOfTheForestCmd());
    tick();

    store.select(selectGameState).pipe(
      take(1)
    ).subscribe(s => {
      state = s;
    });
    tick();

    expect(state.isPickingForestFruitsInProgress).toBe(false);
    expect(state.inventory).toContain(InventoryItem.FRUITS_OF_THE_FOREST);
  }));

  it('given player takes fruits of the forest, then fruits are in inventory', fakeAsync(() => {
    let state: any;
    store.select(selectGameState).pipe(
      take(1)
    ).subscribe(s => {
      state = s;
    });
    tick();

    expect(state.inventory).toEqual([]);

    service.handle(new TakeFruitsOfTheForestCmd());
    tick();

    store.select(selectGameState).pipe(
      take(1)
    ).subscribe(s => {
      state = s;
    });
    tick();

    expect(state.inventory).toContain(InventoryItem.FRUITS_OF_THE_FOREST);
    expect(state.inventory.length).toBe(1);
  }));

  it('given player is picking fruits at Fruits of the Forest, when player goes to Gnome\'s Hut, then picking is no longer in progress and player is at Gnome\'s Hut', fakeAsync(() => {
    let state: any;

    service.handle(new GoToLocationCmd(Locations.FRUITS_OF_THE_FOREST));
    tick();

    service.handle(new StartPickingForestFruitsCmd());
    tick();

    service.handle(new GoToLocationCmd(Locations.GNOMES_HUT));
    tick();

    store.select(selectGameState).pipe(
      take(1)
    ).subscribe(s => {
      state = s;
    });
    tick();

    expect(state.isPickingForestFruitsInProgress).toBe(false);
    expect(state.currentLocation).toBe(Locations.GNOMES_HUT);
  }));

  it('given player has fruits of the forest, when player exchanges fruits for golden coin, then golden coin is in inventory and fruit is removed; when player exchanges golden coin for fishing net, then net is in inventory and coin is removed', fakeAsync(() => {
    let state: any;

    service.handle(new TakeFruitsOfTheForestCmd());
    tick();

    service.handle(new ExchangeCmd(InventoryItem.FRUITS_OF_THE_FOREST, InventoryItem.GOLDEN_COIN));
    tick();

    store.select(selectGameState).pipe(
      take(1)
    ).subscribe(s => {
      state = s;
    });
    tick();

    expect(state.inventory).toContain(InventoryItem.GOLDEN_COIN);
    expect(state.inventory).not.toContain(InventoryItem.FRUITS_OF_THE_FOREST);

    service.handle(new ExchangeCmd(InventoryItem.GOLDEN_COIN, InventoryItem.FISHING_NET));
    tick();

    store.select(selectGameState).pipe(
      take(1)
    ).subscribe(s => {
      state = s;
    });
    tick();

    expect(state.inventory).toContain(InventoryItem.FISHING_NET);
    expect(state.inventory).not.toContain(InventoryItem.GOLDEN_COIN);
  }));

  it('given player has FIND_OUT_WHY_MINE_IS_FLOODED quest, when player enters Gold Mine, then FIND_OUT_WHY_MINE_IS_FLOODED is done, REMOVE_THE_WATER is active, and player is at Gold Mine', fakeAsync(() => {
    let state: any;

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();

    expect(state.activeQuests).toContain(Quest.FIND_OUT_WHY_MINE_IS_FLOODED);

    service.handle(new GoToLocationCmd(Locations.GOLD_MINE));
    tick();

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();

    expect(state.activeQuests).not.toContain(Quest.FIND_OUT_WHY_MINE_IS_FLOODED);
    expect(state.activeQuests).toContain(Quest.REMOVE_THE_WATER);
    expect(state.currentLocation).toBe(Locations.GOLD_MINE);
  }));

  it('given GET_FISHING_NET quest is active, when player exchanges golden coin for fishing net, then GET_FISHING_NET quest is removed and fishing net is in inventory', fakeAsync(() => {
    let state: any;

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();

    service.handle(new AskBeaverToRebuildDamCmd());
    tick();

    service.handle(new GoToLocationCmd(Locations.FISHERY_GROUND));
    tick();

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();
    expect(state.activeQuests).toContain(Quest.GET_FISHING_NET);

    service.handle(new GoToLocationCmd(Locations.FRUITS_OF_THE_FOREST));
    tick();

    service.handle(new StartPickingForestFruitsCmd());
    tick();

    service.handle(new TakeFruitsOfTheForestCmd());
    tick();

    service.handle(new GoToLocationCmd(Locations.MARKETPLACE));
    tick();

    service.handle(new ExchangeCmd(InventoryItem.FRUITS_OF_THE_FOREST, InventoryItem.GOLDEN_COIN));
    tick();

    service.handle(new ExchangeCmd(InventoryItem.GOLDEN_COIN, InventoryItem.FISHING_NET));
    tick();

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();

    expect(state.inventory).toContain(InventoryItem.FISHING_NET);
    expect(state.activeQuests).not.toContain(Quest.GET_FISHING_NET);
  }));

  it('given player has fish at Beaver Dam, when player gives fish to the beaver, then fish is removed from inventory and GET_FISH_FOR_BEAVER quest is done and mine is no longer flooded', fakeAsync(() => {
    let state: any;

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();

    service.handle(new AskBeaverToRebuildDamCmd());
    tick();

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();
    expect(state.activeQuests).toContain(Quest.GET_FISH_FOR_BEAVER);

    service.handle(new GoToLocationCmd(Locations.FISHERY_GROUND));
    tick();

    service.handle(new StartFishingCmd());
    tick();

    service.handle(new CatchFishCmd());
    tick();

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();
    expect(state.inventory).toContain(InventoryItem.FISH);
    expect(state.isMineFlooded).toBe(true);

    service.handle(new GoToLocationCmd(Locations.BEAVER_DAM));
    tick();

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();
    expect(state.currentLocation).toBe(Locations.BEAVER_DAM);

    service.handle(new GiveFishToBeaverCmd());
    tick();

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();

    expect(state.inventory).not.toContain(InventoryItem.FISH);
    expect(state.activeQuests).not.toContain(Quest.GET_FISH_FOR_BEAVER);
    expect(state.isMineFlooded).toBe(false);
  }));

  it('given GET_FISH_FOR_BEAVER quest is active and no fishing net in inventory, when player enters Fishery Ground, then GET_FISHING_NET quest is added', fakeAsync(() => {
    let state: any;

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();

    expect(state.inventory).not.toContain(InventoryItem.FISHING_NET);

    service.handle(new AskBeaverToRebuildDamCmd());
    tick();

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();

    expect(state.activeQuests).toContain(Quest.GET_FISH_FOR_BEAVER);

    service.handle(new GoToLocationCmd(Locations.FISHERY_GROUND));
    tick();

    store.select(selectGameState).pipe(take(1)).subscribe(s => { state = s; });
    tick();

    expect(state.activeQuests).toContain(Quest.GET_FISHING_NET);
  }));
});
