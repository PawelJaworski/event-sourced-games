import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {shareReplay} from 'rxjs/operators';
import {Observable} from 'rxjs';

export interface VersionInfo {
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  private version$: Observable<VersionInfo> | undefined;

  constructor(private readonly http: HttpClient) {}

  getVersion(): Observable<VersionInfo> {
    if (!this.version$) {
      this.version$ = this.http.get<VersionInfo>('assets/version.json').pipe(
        shareReplay(1)
      );
    }
    return this.version$;
  }
}
