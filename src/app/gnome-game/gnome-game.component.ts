import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {AGGREGATE_ID, CommandGateway} from '../event-sourcing/event-sourcing-template.js';
import {GameTokenService} from './service/game-token.service';
import {CMD_TYPE, EVENT_TYPE, Projector} from "../event-sourcing/event-sourcing-template";
import {gameStartState, GnomeGameState, Locations} from "./gnome-game.state";
import {WENT_TO_LOCATION} from "./events/events";
import {GO_TO_LOCATION} from "./commands/commands";

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
      [GO_TO_LOCATION, (events: any[], cmd: any) => {
      return [{
          [AGGREGATE_ID]: cmd[AGGREGATE_ID],
          [EVENT_TYPE]: WENT_TO_LOCATION,
          currentLocation: cmd.currentLocation
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

    const selectedId = this.gameTokenService.getClickedTokenId(event, this.canvas.nativeElement);
    console.log('selectedId', selectedId)
    var currentLocation = Locations.GNOMES_HUT;
    if (selectedId === 'gnome-token') {
      currentLocation = Locations.GNOMES_HUT;
    } else {
      currentLocation = Locations.FISHERY_GROUND;
    }

    const events = this.eventSourcingTemplate.handle({
      [CMD_TYPE]: GO_TO_LOCATION,
      currentLocation
    }).success

    this.gameState = this.stateProjector(this.gameState, events);
    this.gameTokenService.renderTokens(this.gameState, this.canvas.nativeElement.getContext('2d')!)
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

      this.gameTokenService.renderTokens(this.gameState, ctx);
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
      this.gameTokenService.renderTokens(this.gameState, ctx);
    };
    mapImg.src = '/assets/img/map.png';
  }

}

export default GnomeGameComponent
const locationProjector: Projector<GnomeGameState> = (state: GnomeGameState, events: any[]) => {
  console.log('events', JSON.stringify(state))
  const currentLocation = events
    .filter(it => it[EVENT_TYPE] === WENT_TO_LOCATION)
    .map(it => it.currentLocation)
      .reduce((f, s) => {
        console.log('reducing', f, s)
        return s
      }, Locations.GNOMES_HUT)

  console.log('state recalculated', currentLocation)
  return {
    ...state,
    currentLocation
  };
}
