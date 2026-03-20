import {AfterViewInit, Component, ElementRef, EventEmitter, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {GnomeGameState, Locations} from '../gnome-game.state';
import {GameTokenService} from '../service/game-token.service';
import {selectGameState} from '../gnome-game.reducer';
import {AppState} from '../../state/app.state';
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

  @Output()
  locationClicked = new EventEmitter<Locations>();

  private readonly subscriptions = new Subscription();
  private gameState: GnomeGameState = {currentLocation: Locations.GNOMES_HUT};

  constructor(
    private readonly store: Store<AppState>,
    private readonly gameTokenService: GameTokenService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store.select(selectGameState).subscribe(state => {
        this.gameState = state;
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
    if (!this.canvas) return;

    const location = this.gameTokenService.getClickedLocation(event, this.canvas.nativeElement);
    if (location) {
      this.locationClicked.emit(location);
    }
  }

  onTouchStart(event: TouchEvent): void {
    if (!this.canvas) return;
    event.preventDefault();

    const touch = event.touches[0];
    const mouseEvent = new MouseEvent('click', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });

    const location = this.gameTokenService.getClickedLocation(mouseEvent, this.canvas.nativeElement);
    if (location) {
      this.locationClicked.emit(location);
    }
  }

  private redrawCanvas(): void {
    if (!this.canvas) return;

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const mapImg = new Image();
    mapImg.onload = () => {
      ctx.clearRect(0, 0, this.canvas!.nativeElement.width, this.canvas!.nativeElement.height);
      ctx.drawImage(mapImg, 0, 0);

      this.gameTokenService.renderTokens(this.gameState, ctx);
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
      this.gameTokenService.renderTokens(this.gameState, ctx);
    };
    mapImg.src = './assets/img/map.png';
  }
}