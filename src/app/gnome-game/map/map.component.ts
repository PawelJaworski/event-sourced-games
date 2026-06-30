import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {gameStartState, GnomeGameState, Locations, Quest} from '../gnome-game.state';
import {GameTokenService} from '../service/game-token.service';
import {selectGameState} from '../gnome-game.reducer';
import {AppState} from '../../state/app.state';
import {EventSourcingFacadeService} from '../event-sourcing-facade.service';
import {Subscription} from 'rxjs';
import {GoToLocationCmd} from '../commands/go-to-location-cmd';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
  standalone: false
})
export class MapComponent implements AfterViewInit, OnInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvas?: ElementRef<HTMLCanvasElement>;

  private readonly subscriptions = new Subscription();
  private gameState: GnomeGameState = gameStartState;
  private previewLocation: Locations = Locations.NONE;
  private mapImage: HTMLImageElement | null = null;
  private baseCanvas: HTMLCanvasElement | null = null;
  private blinkVisible = true;
  private animationFrameId = 0;
  private lastBlinkTime = 0;
  private readonly BLINK_INTERVAL_MS = 600;

  constructor(
    private readonly store: Store<AppState>,
    private readonly gameTokenService: GameTokenService,
    private readonly commandGateway: EventSourcingFacadeService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store.select(selectGameState).subscribe(state => {
        this.gameState = state;
        this.previewLocation = state.currentLocation;
        this.redrawCanvas();
      })
    );
  }

  ngOnDestroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.loadMapImage();
    this.startBlinkLoop();
  }

  onCanvasClick(event: MouseEvent): void {
    this.handleCanvasInteraction(event);
  }

  onTouchStart(event: TouchEvent): void {
    event.preventDefault();
    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('click', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });
    this.handleCanvasInteraction(mouseEvent);
  }

  private handleCanvasInteraction(event: MouseEvent): void {
    if (!this.canvas) return;

    const location = this.gameTokenService.getClickedLocation(event, this.canvas.nativeElement);

    if (location && location !== this.previewLocation) {
      this.previewLocation = location;
      this.commandGateway.handle(new GoToLocationCmd(location));
    }
    this.redrawCanvas();
  }

  private redrawCanvas(): void {
    if (!this.canvas) return;

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    if (this.mapImage) {
      this.drawFrame(ctx);
      return;
    }

    const mapImg = new Image();
    mapImg.onload = () => {
      this.mapImage = mapImg;
      this.canvas!.nativeElement.width = mapImg.width;
      this.canvas!.nativeElement.height = mapImg.height;
      this.drawFrame(ctx);
    };
    mapImg.src = './assets/img/map.png';
  }

  private drawFrame(ctx: CanvasRenderingContext2D): void {
    if (!this.mapImage || !this.canvas) return;

    ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    ctx.drawImage(this.mapImage, 0, 0);
    this.gameTokenService.renderTokens(this.gameState.currentLocation, ctx, this.previewLocation, this.gameState.isMineFlooded, this.getQuestMarkedLocations(), false);
    this.refreshBaseCache(ctx);

    if (this.blinkVisible) {
      this.gameTokenService.drawQuestMarkers(ctx, this.getQuestMarkedLocations());
    }
  }

  private readonly questLocationMap: Partial<Record<Quest, Locations>> = {
    [Quest.FIND_OUT_WHY_MINE_IS_FLOODED]: Locations.GOLD_MINE,
    [Quest.REMOVE_THE_WATER]: Locations.BEAVER_DAM,
    [Quest.GET_FISH_FOR_BEAVER]: Locations.FISHERY_GROUND,
    [Quest.GET_FISHING_NET]: Locations.FISHERY_GROUND
  };

  private getQuestMarkedLocations(): Set<Locations> {
    const marked = new Set<Locations>();
    for (const quest of this.gameState.activeQuests) {
      const location = this.questLocationMap[quest];
      if (location) {
        marked.add(location);
      }
    }
    return marked;
  }

  private startBlinkLoop(): void {
    this.lastBlinkTime = performance.now();
    const loop = (time: number) => {
      if (this.gameState.activeQuests.length > 0) {
        if (time - this.lastBlinkTime >= this.BLINK_INTERVAL_MS) {
          this.blinkVisible = !this.blinkVisible;
          this.lastBlinkTime = time;
          this.applyBlink();
        }
      }
      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  private applyBlink(): void {
    if (!this.canvas || !this.baseCanvas) return;
    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    ctx.drawImage(this.baseCanvas, 0, 0);

    if (this.blinkVisible) {
      this.gameTokenService.drawQuestMarkers(ctx, this.getQuestMarkedLocations());
    }
  }

  private refreshBaseCache(ctx: CanvasRenderingContext2D): void {
    this.baseCanvas = document.createElement('canvas');
    this.baseCanvas.width = ctx.canvas.width;
    this.baseCanvas.height = ctx.canvas.height;
    const baseCtx = this.baseCanvas.getContext('2d');
    if (!baseCtx) return;
    baseCtx.drawImage(ctx.canvas, 0, 0);
  }

  private loadMapImage(): void {
    if (!this.canvas) return;

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const mapImg = new Image();
    mapImg.onload = async () => {
      this.mapImage = mapImg;
      this.canvas!.nativeElement.width = mapImg.width;
      this.canvas!.nativeElement.height = mapImg.height;

      this.gameTokenService.initializeTokens(ctx);
      await this.gameTokenService.preloadImages();
      this.drawFrame(ctx);
    };
    mapImg.src = './assets/img/map.png';
  }
}