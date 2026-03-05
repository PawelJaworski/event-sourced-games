import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CommandGateway, EventStore} from '../event-sourcing/event-sourcing-template.js';
import {GameTokenService} from './service/game-token.service';
import {composeProjectors, Projector} from "../event-sourcing/event-sourcing-template";
import {gameStartState, GnomeGameState, Locations} from "./gnome-game.state";
import {GoToLocationCmd, goToLocationHandler} from "./commands/go-to-location-cmd";
import {WentToLocationEvent} from "./events/went-to-location";
import {DialogService} from './dialog.service';
import {EventSourcingFacadeService} from "./event-sourcing-facade.service";

@Component({
  selector: 'app-gnome-game',
  templateUrl: './gnome-game.component.html',
  styleUrls: ['./gnome-game.component.css'],
  standalone: false
})
export class GnomeGameComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvas?: ElementRef<HTMLCanvasElement>;

  @HostListener('window:resize')
  onResize(): void {
    this.redrawCanvas();
  }

  constructor(
    private readonly commandGateway: EventSourcingFacadeService,
    private readonly gameTokenService: GameTokenService,
    private readonly dialogService: DialogService
  ) {}

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
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
    this.loadMapImage();
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
    const rect = this.canvas.nativeElement.getBoundingClientRect();

    const mouseEvent = new MouseEvent('click', {
      clientX: touch.clientX,
      clientY: touch.clientY
    });

    const currentLocation = this.gameTokenService.getClickedLocation(mouseEvent, this.canvas.nativeElement);

    this.handleLocationChange(currentLocation);
  }

  private handleLocationChange(location: Locations): void {
    const oldState = this.commandGateway.getGameState;
    this.commandGateway
      .handle(new GoToLocationCmd(location))

    const newState = this.commandGateway.getGameState;
    if (JSON.stringify(oldState) === JSON.stringify(newState)) {
      return;
    }

    if (newState.currentLocation === Locations.FRUITS_OF_THE_FOREST) {
      this.dialogService.openMemoryGameDialog();
    }

    this.redrawCanvas();
  }

  private redrawCanvas(): void {
    const gameState = this.commandGateway.getGameState;
    if (!this.canvas) return;

    const ctx = this.canvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const mapImg = new Image();
    mapImg.onload = () => {
      ctx.clearRect(0, 0, this.canvas!.nativeElement.width, this.canvas!.nativeElement.height);
      ctx.drawImage(mapImg, 0, 0);

      this.gameTokenService.renderTokens(gameState, ctx);
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
      this.gameTokenService.renderTokens(this.commandGateway.getGameState, ctx);
    };
    mapImg.src = './assets/img/map.png';
  }

}


