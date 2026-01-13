import {AfterViewInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {CommandGateway, CommandHandler} from '../event-sourcing/event-sourcing-template.js';
import {GameTokenService} from './service/game-token.service';
import {composeProjectors, Projector} from "../event-sourcing/event-sourcing-template";
import {gameStartState, GnomeGameState, Locations} from "./gnome-game.state";
import {GoToLocationCmd} from "./commands/go-to-location-cmd";
import {WentToLocationEvent} from "./events/went-to-location";

@Component({
  selector: 'app-gnome-game',
  templateUrl: './gnome-game.component.html',
  styleUrls: ['./gnome-game.component.css'],
  standalone: false
})
export class GnomeGameComponent implements OnInit, AfterViewInit {
  @ViewChild('canvas', { static: true })
  canvas?: ElementRef<HTMLCanvasElement>;

  private readonly eventSourcingTemplate;
  private readonly stateProjector;
  private gameState;

  constructor(private readonly gameTokenService: GameTokenService) {
    this.eventSourcingTemplate = new CommandGateway(this.initCommandHandlers());
    this.stateProjector = composeProjectors([locationProjector]);
    this.gameState = gameStartState;
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.loadMapImage();
  }

  onCanvasClick(event: MouseEvent): void {
    if (!this.canvas) return;

    const currentLocation = this.gameTokenService.getClickedLocation(event, this.canvas.nativeElement);

    const events = this.eventSourcingTemplate
      .handle(new GoToLocationCmd(currentLocation))
      .success

    const newState = this.stateProjector(this.gameState, events);
    if (JSON.stringify(this.gameState) === JSON.stringify(newState)) {
      return;
    }
    this.gameState = newState;
    this.gameTokenService.renderTokens(this.gameState, this.canvas.nativeElement.getContext('2d')!)
    this.redrawCanvas();
  }

  private initCommandHandlers(): Map<Function, CommandHandler<any>> {
    return new Map([
      [
        GoToLocationCmd, (events: any[], cmd: GoToLocationCmd) => [new WentToLocationEvent(cmd.location)]
      ]
    ])
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

const locationProjector: Projector<GnomeGameState> = (state: GnomeGameState, events: any[]) => {
  const currentLocation = events
    .filter(it => it instanceof WentToLocationEvent)
    .map(it => it.location)
    .reduce((f, s) => s, Locations.GNOMES_HUT);

  return {
    ...state,
    currentLocation
  };
}
