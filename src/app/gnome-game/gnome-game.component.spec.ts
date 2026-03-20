import {ComponentFixture, TestBed} from '@angular/core/testing';
import {GnomeGameComponent} from "./gnome-game.component";
import {GameTokenService} from './service/game-token.service';
import {DialogService} from './dialog.service';
import {EventSourcingFacadeService} from './event-sourcing-facade.service';
import {Locations} from './gnome-game.state';
import {StoreModule} from '@ngrx/store';
import {reducers} from '../state/app.reducer';

describe('GnomeGameComponent', () => {
  let component: GnomeGameComponent;
  let fixture: ComponentFixture<GnomeGameComponent>;
  let dialogService: DialogService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GnomeGameComponent],
      imports: [
        StoreModule.forRoot(reducers)
      ],
      providers: [
        DialogService,
        GameTokenService,
        EventSourcingFacadeService
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

  describe('Caption click opens correct game dialog', () => {
    it('should open memory game dialog when Fruits of the Forest caption is clicked', () => {
      dialogService.openDialogByLocation(Locations.FRUITS_OF_THE_FOREST);

      expect(dialogService.isMemoryGameDialogOpen()).toBe(true);
      expect(dialogService.isFisheryGameDialogOpen()).toBe(false);
    });

    it('should open fishery game dialog when Fishery Ground caption is clicked', () => {
      dialogService.openDialogByLocation(Locations.FISHERY_GROUND);

      expect(dialogService.isFisheryGameDialogOpen()).toBe(true);
      expect(dialogService.isMemoryGameDialogOpen()).toBe(false);
    });

    it('should not open memory game dialog when fishery game caption is clicked', () => {
      dialogService.openDialogByLocation(Locations.FISHERY_GROUND);

      expect(dialogService.isMemoryGameDialogOpen()).toBe(false);
      expect(dialogService.isFisheryGameDialogOpen()).toBe(true);
    });

    it('should not open fishery game dialog when memory game caption is clicked', () => {
      dialogService.openDialogByLocation(Locations.FRUITS_OF_THE_FOREST);

      expect(dialogService.isFisheryGameDialogOpen()).toBe(false);
      expect(dialogService.isMemoryGameDialogOpen()).toBe(true);
    });
  });
});
