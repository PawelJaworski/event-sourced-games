import {Component, OnInit, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {AGGREGATE_ID, CommandGateway} from '../event-sourcing/event-sourcing-template.js';
import {GameTokenService} from './service/game-token.service';
import {CMD_TYPE, EVENT_TYPE, Projector} from "../event-sourcing/event-sourcing-template";
import {gameStartState, GnomeGameState, Locations} from "./gnome-game.state";
import {EventType, WENT_TO_LOCATION} from "./events/events";
import {GO_TO_GNOME_HUT} from "./commands/commands";

@Component({
  selector: 'app-gnome-game',
  templateUrl: './gnome-game.component.html',
  styleUrls: ['./gnome-game.component.css'],
  standalone: false
})
class GnomeGameComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvas?: ElementRef<HTMLCanvasElement>;
  private readonly eventSourcingTemplate = new CommandGateway(
    new Map([
      [GO_TO_GNOME_HUT, (events: any[], cmd: any) => {
      return [{
          [AGGREGATE_ID]: cmd[AGGREGATE_ID],
          [EVENT_TYPE]: 'went-to-location',
          location: Locations.GNOMES_HUT
        }];
      }]
    ]))
  private readonly stateProjector;
  private gameState = gameStartState;

  constructor(private readonly gameTokenService: GameTokenService) {
    this.stateProjector = this.eventSourcingTemplate.composeProjectors([locationProjector])
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.loadMapImage();
  }

  onCanvasClick(event: MouseEvent): void {
    if (!this.canvas) return;

    const rect = this.canvas.nativeElement.getBoundingClientRect();
    const scaleX = this.canvas.nativeElement.width / rect.width;
    const scaleY = this.canvas.nativeElement.height / rect.height;

    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    const selectedId = this.gameTokenService.getClickedTokenId(x, y);

    if (selectedId === 'gnome-token') {
      const events = this.eventSourcingTemplate.handle({
        [CMD_TYPE]: GO_TO_GNOME_HUT
      }).success

      this.gameState = this.stateProjector(this.gameState, events);
      this.gameTokenService.toggleTokenSize(selectedId);
      this.redrawCanvas();
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

      this.gameTokenService.drawAllTokens(ctx);
    };
    mapImg.src = '/assets/img/map.png';
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
      this.gameTokenService.drawAllTokens(ctx);
    };
    mapImg.src = '/assets/img/map.png';
  }

}

export default GnomeGameComponent
const locationProjector: Projector<GnomeGameState> = (state: GnomeGameState, events: any[]) => {
  const currentLocation = events
    .find(it => it[EVENT_TYPE] == WENT_TO_LOCATION)
    ?.location
    ?? state.currentLocation;

  return {
    ...state,
    currentLocation
  };
}
