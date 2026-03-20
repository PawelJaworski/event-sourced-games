import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {Locations} from "./gnome-game.state";
import {EventSourcingFacadeService} from "./event-sourcing-facade.service";
import {AppState} from '../state/app.state';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-gnome-game',
  templateUrl: './gnome-game.component.html',
  styleUrls: ['./gnome-game.component.css'],
  standalone: false
})
export class GnomeGameComponent implements OnInit, OnDestroy {
  isHorizontal = true;

  @HostListener('window:resize')
  onResize(): void {
    this.updateOrientation();
  }

  private updateOrientation(): void {
    this.isHorizontal = window.innerWidth > window.innerHeight;
  }

  private readonly subscriptions = new Subscription();

  constructor(
    private readonly store: Store<AppState>,
    private readonly commandGateway: EventSourcingFacadeService
  ) {}

  ngOnInit(): void {
    this.updateOrientation();
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

  handleLocationChange(location: Locations): void {
    this.commandGateway.handle(location);
  }
}