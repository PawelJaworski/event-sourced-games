import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { StoreModule } from '@ngrx/store';
import {metaReducers, reducers} from "./state/app.reducer";
import { ServiceWorkerModule } from '@angular/service-worker';
import { GnomeGameModule } from './gnome-game/gnome-game.module';
import { MemoryGameDialogComponent } from './dialog/memory-game-dialog.component';
import { MemoryGameComponent } from './dialog/memory-game/game.component';
import { DialogService } from './dialog/dialog.service';

@NgModule({
  declarations: [
    AppComponent,
    MemoryGameDialogComponent,
    MemoryGameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    StoreModule.forRoot(reducers, {
      metaReducers
    }),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000'
    }),
    GnomeGameModule
  ],
  providers: [
    DialogService
  ],
  exports: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule {

}
