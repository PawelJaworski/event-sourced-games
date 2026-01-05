import {Component, OnInit, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {AGGREGATE_ID, CommandGateway} from '../event-sourcing/event-sourcing-template.js';
import {GameTokenService} from './service/game-token.service';
import {CMD_TYPE} from "../event-sourcing/event-sourcing-template";

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
          [AGGREGATE_ID]: cmd[AGGREGATE_ID]
        }];
      }]
    ]),
    [
      (state: any, events: any[]) => {
        return {...state, events };
      }
    ])

  constructor(private readonly gameTokenService: GameTokenService) {}

  ngOnInit(): void {
    this.eventSourcingTemplate.handle({
      [CMD_TYPE]: 'select-token-cmd',
      [AGGREGATE_ID]: 'gnome'
    })
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
