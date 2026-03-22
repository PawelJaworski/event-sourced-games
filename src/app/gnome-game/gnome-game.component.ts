import {Component, HostListener, OnInit} from '@angular/core';

@Component({
  selector: 'app-gnome-game',
  templateUrl: './gnome-game.component.html',
  styleUrls: ['./gnome-game.component.css'],
  standalone: false
})
export class GnomeGameComponent implements OnInit {
  isHorizontal = true;

  @HostListener('window:resize')
  onResize(): void {
    this.updateOrientation();
  }

  private updateOrientation(): void {
    this.isHorizontal = window.innerWidth > window.innerHeight;
  }

  ngOnInit(): void {
    this.updateOrientation();
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
}