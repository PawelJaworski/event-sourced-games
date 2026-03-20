import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MapComponent} from './map.component';
import {GameTokenService} from '../service/game-token.service';
import {EventSourcingFacadeService} from '../event-sourcing-facade.service';
import {DialogService} from '../dialog.service';
import {Store} from '@ngrx/store';
import {AppState} from '../../state/app.state';
import {StoreModule} from '@ngrx/store';
import {reducers} from '../../state/app.reducer';
import {Locations} from '../gnome-game.state';
import {ElementRef} from '@angular/core';

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  let gameTokenService: GameTokenService;
  let dialogService: DialogService;
  let eventSourcingFacade: EventSourcingFacadeService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapComponent],
      imports: [
        StoreModule.forRoot(reducers)
      ],
      providers: [
        GameTokenService,
        EventSourcingFacadeService,
        DialogService,
        Store
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    gameTokenService = TestBed.inject(GameTokenService);
    dialogService = TestBed.inject(DialogService);
    eventSourcingFacade = TestBed.inject(EventSourcingFacadeService);

    const mockCtx = {
      canvas: { width: 800, height: 600 },
      clearRect: () => {},
      drawImage: () => {},
      save: () => {},
      restore: () => {},
      beginPath: () => {},
      arc: () => {},
      closePath: () => {},
      clip: () => {},
      stroke: () => {},
      strokeStyle: '',
      lineWidth: 0,
      fill: () => {},
      fillStyle: '',
      ellipse: () => {},
      font: '',
      textAlign: '',
      textBaseline: '',
      measureText: () => ({ width: 100 })
    };

    const mockCanvas = {
      width: 800,
      height: 600,
      getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }),
      getContext: () => mockCtx
    };

    component.canvas = new ElementRef<HTMLCanvasElement>(mockCanvas as unknown as HTMLCanvasElement);

    gameTokenService.initializeTokens(mockCtx as unknown as CanvasRenderingContext2D);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Token click preview behavior', () => {
    const testCases = [
      { location: Locations.GOLD_MINE, clientX: 540, clientY: 190, name: 'Gold Mine' },
      { location: Locations.FISHERY_GROUND, clientX: 410, clientY: 290, name: 'Fishery Ground' },
      { location: Locations.FRUITS_OF_THE_FOREST, clientX: 320, clientY: 340, name: 'Fruits of the Forest' },
      { location: Locations.GNOMES_HUT, clientX: 570, clientY: 530, name: 'Gnomes Hut' }
    ];

    testCases.forEach(({ location, clientX, clientY, name }) => {
      it(`should enlarge the token when ${name} is clicked`, () => {
        const clickEvent = new MouseEvent('click', { clientX, clientY });

        component.onCanvasClick(clickEvent);

        expect((component as any).previewLocation).toBe(location);
      });
    });
  });

  describe('Caption visibility', () => {
    it('should show caption for Fishery Ground token', () => {
      expect(gameTokenService.hasCaption(Locations.FISHERY_GROUND)).toBe(true);
    });

    it('should show caption for Fruits of the Forest token', () => {
      expect(gameTokenService.hasCaption(Locations.FRUITS_OF_THE_FOREST)).toBe(true);
    });

    it('should not show caption for Gold Mine token', () => {
      expect(gameTokenService.hasCaption(Locations.GOLD_MINE)).toBe(false);
    });

    it('should not show caption for Gnomes Hut token', () => {
      expect(gameTokenService.hasCaption(Locations.GNOMES_HUT)).toBe(false);
    });
  });

  describe('Caption click behavior', () => {
    it('should open memory game dialog when Fruits of the Forest caption is clicked', () => {
      spyOn(dialogService, 'openDialogByLocation');
      const clickEvent = new MouseEvent('click', { clientX: 320, clientY: 340 });
      
      component.onCanvasClick(clickEvent);
      expect((component as any).previewLocation).toBe(Locations.FRUITS_OF_THE_FOREST);
      
      const captionClickEvent = new MouseEvent('click', { clientX: 320, clientY: 300 });
      component.onCanvasClick(captionClickEvent);
      
      expect(dialogService.openDialogByLocation).toHaveBeenCalledWith(Locations.FRUITS_OF_THE_FOREST);
    });

    it('should open fishery game dialog when Fishery Ground caption is clicked', () => {
      spyOn(dialogService, 'openDialogByLocation');
      const clickEvent = new MouseEvent('click', { clientX: 410, clientY: 290 });
      
      component.onCanvasClick(clickEvent);
      expect((component as any).previewLocation).toBe(Locations.FISHERY_GROUND);
      
      const captionClickEvent = new MouseEvent('click', { clientX: 410, clientY: 250 });
      component.onCanvasClick(captionClickEvent);
      
      expect(dialogService.openDialogByLocation).toHaveBeenCalledWith(Locations.FISHERY_GROUND);
    });

    it('should send command when token is clicked', () => {
      spyOn(eventSourcingFacade, 'handle');
      const clickEvent = new MouseEvent('click', { clientX: 320, clientY: 340 });
      
      component.onCanvasClick(clickEvent);
      
      expect(eventSourcingFacade.handle).toHaveBeenCalledWith(Locations.FRUITS_OF_THE_FOREST);
    });

    it('should not send command when caption is clicked (already sent on token click)', () => {
      spyOn(eventSourcingFacade, 'handle');
      const clickEvent = new MouseEvent('click', { clientX: 320, clientY: 340 });
      
      component.onCanvasClick(clickEvent);
      expect(eventSourcingFacade.handle).toHaveBeenCalledTimes(1);
      
      const captionClickEvent = new MouseEvent('click', { clientX: 320, clientY: 300 });
      component.onCanvasClick(captionClickEvent);
      
      expect(eventSourcingFacade.handle).toHaveBeenCalledTimes(1);
    });

    it('should clear preview location after caption click', () => {
      const clickEvent = new MouseEvent('click', { clientX: 320, clientY: 340 });
      
      component.onCanvasClick(clickEvent);
      expect((component as any).previewLocation).toBe(Locations.FRUITS_OF_THE_FOREST);
      
      const captionClickEvent = new MouseEvent('click', { clientX: 320, clientY: 300 });
      component.onCanvasClick(captionClickEvent);
      
      expect((component as any).previewLocation).toBe(Locations.NONE);
    });
  });
});