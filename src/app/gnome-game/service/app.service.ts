import { Injectable } from '@angular/core';
import {AppState} from "../../state/app.state";
import {Store} from "@ngrx/store";

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private readonly store: Store<AppState>) { }

  private initMap() {

  }
}
