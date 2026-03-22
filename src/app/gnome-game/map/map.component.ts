import {AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {GnomeGameState, Locations} from '../gnome-game.state';
import {GameTokenService} from '../service/game-token.service';
import {selectGameState} from '../gnome-game.reducer';
import {AppState} from '../../state/app.state';
import {EventSourcingFacadeService} from '../event-sourcing-facade.service';
import {DialogService} from '../dialog.service';
import {Subscription} from 'rxjs';

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
  private gameState: GnomeGameState = {currentLocation: Locations.GNOMES_HUT};
  private previewLocation: Locations = Locations.NONE;

  constructor(
    private readonly store: Store<AppState>,
    private readonly gameTokenService: GameTokenService,
    private readonly commandGateway: EventSourcingFacadeService,
    private readonly dialogService: DialogService
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
    this.subscriptions.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.loadMapImage();
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
    const isCaptionClick = this.gameTokenService.isClickOnCaption(event, this.canvas.nativeElement, this.previewLocation);
    if (isCaptionClick) {
      this.dialogService.openDialogByLocation(this.previewLocation);
    }

    if (location && location !== this.previewLocation && !isCaptionClick) {
      this.previewLocation = location;
      this.commandGateway.handle(location);
    }
    this.redrawCanvas();
  }

  private redrawCanvas(): void {
    if (!this.canvas) return;

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const mapImg = new Image();
    mapImg.onload = () => {
      ctx.clearRect(0, 0, this.canvas!.nativeElement.width, this.canvas!.nativeElement.height);
      ctx.drawImage(mapImg, 0, 0);

      this.gameTokenService.renderTokens(this.gameState.currentLocation, ctx, this.previewLocation);
    };
    mapImg.src = './assets/img/map.png';
  }

  private loadMapImage(): void {
    if (!this.canvas) return;

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const mapImg = new Image();
    mapImg.onload = () => {
      this.canvas!.nativeElement.width = mapImg.width;
      this.canvas!.nativeElement.height = mapImg.height;
      ctx.drawImage(mapImg, 0, 0);

      this.gameTokenService.initializeTokens(ctx);
      this.gameTokenService.renderTokens(this.gameState.currentLocation, ctx, this.previewLocation);
    };
    mapImg.src = './assets/img/map.png';
  }
}
