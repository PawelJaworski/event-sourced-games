import {Component, OnInit} from '@angular/core';
import {VersionService} from './version.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  versionTimestamp: string | null = null;

  constructor(private readonly versionService: VersionService) {}

  ngOnInit(): void {
    this.versionService.getVersion().subscribe(version => {
      this.versionTimestamp = version.timestamp;
    });
  }
}