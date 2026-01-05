import {Component, OnInit, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {AGGREGATE_ID, CommandGateway} from '../event-sourcing/event-sourcing-template.js';
import {GameTokenService} from './service/game-token.service';
import {CMD_TYPE, EVENT_TYPE, Projector} from "../event-sourcing/event-sourcing-template";
import {gameStartState, GnomeGameState, Locations} from "./gnome-game.state";

@Component({
  selector: 'app-gnome-game',
  templateUrl: './gnome-game.component.html',
  styleUrls: ['./gnome-game.component.css'],
  standalone: false
})
export class GnomeGameComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvas?: ElementRef<HTMLCanvasElement>;
  private readonly eventSourcingTemplate = new CommandGateway(
    new Map([
      ['select-token-cmd', (events: any[], cmd: any) => {
        console.log('handling ', cmd);
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
      this.eventSourcingTemplate.handle({
        [CMD_TYPE]: 'select-token-cmd',
        [AGGREGATE_ID]: 'gnome'
      })
      this.gameState = this.stateProjector(gameStartState);
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
const locationProjector: Projector<GnomeGameState> = (state: GnomeGameState, events: any[]) => {
  const currentLocation = events
    .filter(event => event[EVENT_TYPE] == 'went-to-location')
    .map(event => event.location)
    .reduce((f, s) => s);
  console.log('chec', currentLocation)
  return {
    ...state,
    currentLocation
  };
}
