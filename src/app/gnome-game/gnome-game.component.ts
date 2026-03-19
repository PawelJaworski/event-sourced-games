import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Store} from '@ngrx/store';
import {GameTokenService} from './service/game-token.service';
import {Locations} from "./gnome-game.state";
import {DialogService} from './dialog.service';
import {EventSourcingFacadeService} from "./event-sourcing-facade.service";
import {selectGameState} from "./gnome-game.reducer";
import {AppState} from '../state/app.state';
import {GnomeGameState} from './gnome-game.state';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-gnome-game',
  templateUrl: './gnome-game.component.html',
  styleUrls: ['./gnome-game.component.css'],
  standalone: false
})
export class GnomeGameComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvas?: ElementRef<HTMLCanvasElement>;

  isHorizontal = true;

  @HostListener('window:resize')
  onResize(): void {
    this.updateOrientation();
    this.redrawCanvas();
  }

  private updateOrientation(): void {
    this.isHorizontal = window.innerWidth > window.innerHeight;
  }

  private readonly subscriptions = new Subscription();
  private currentGameState: GnomeGameState = {currentLocation: Locations.GNOMES_HUT};

  constructor(
    private readonly store: Store<AppState>,
    private readonly commandGateway: EventSourcingFacadeService,
    private readonly gameTokenService: GameTokenService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.store.select(selectGameState).subscribe(state => {
        this.currentGameState = state;
        this.redrawCanvas();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleFullscreen(): void {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  }

  ngAfterViewInit(): void {
    this.updateOrientation();
    this.loadMapImage();
    setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
  }

  onCanvasClick(event: MouseEvent): void {
    if (!this.canvas) return;

    const currentLocation = this.gameTokenService.getClickedLocation(event, this.canvas.nativeElement);

    this.handleLocationChange(currentLocation);
  }

  onTouchStart(event: TouchEvent): void {
    if (!this.canvas) return;
    event.preventDefault();

    const touch = event.touches[0];

    const mouseEvent = new MouseEvent('click', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });

    const currentLocation = this.gameTokenService.getClickedLocation(mouseEvent, this.canvas.nativeElement);

    this.handleLocationChange(currentLocation);
  }

  private handleLocationChange(location: Locations): void {
    this.commandGateway.handle(location);
  }

  private redrawCanvas(): void {
    if (!this.canvas) return;

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const mapImg = new Image();
    mapImg.onload = () => {
      ctx.clearRect(0, 0, this.canvas!.nativeElement.width, this.canvas!.nativeElement.height);
      ctx.drawImage(mapImg, 0, 0);

      this.gameTokenService.renderTokens(this.currentGameState, ctx);
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
      this.gameTokenService.renderTokens(this.currentGameState, ctx);
    };
    mapImg.src = './assets/img/map.png';
  }

}
