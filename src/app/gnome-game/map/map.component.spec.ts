import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MapComponent} from './map.component';
import {GameTokenService} from '../service/game-token.service';
import {EventSourcingFacadeService} from '../event-sourcing-facade.service';
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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MapComponent],
      imports: [
        StoreModule.forRoot(reducers)
      ],
      providers: [
        GameTokenService,
        EventSourcingFacadeService,
        Store
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MapComponent);
    component = fixture.componentInstance;
    gameTokenService = TestBed.inject(GameTokenService);

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
      ellipse: () => {}
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
});