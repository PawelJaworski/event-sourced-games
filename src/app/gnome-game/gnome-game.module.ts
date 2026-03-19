import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GnomeGameComponent} from './gnome-game.component';
import {MemoryGameDialogComponent} from './memory-game/memory-game-dialog.component';
import {MemoryGameComponent} from './memory-game/game.component';
import {FisheryGameDialogComponent} from './fishery-game/fishery-game-dialog.component';
import {FisheryGameComponent} from './fishery-game/fishery-game.component';
import {DialogService} from './dialog.service';
import {InteractionsComponent} from './interactions/interactions.component';

@NgModule({
  declarations: [
    GnomeGameComponent,
    MemoryGameDialogComponent,
    MemoryGameComponent,
    FisheryGameDialogComponent,
    FisheryGameComponent,
    InteractionsComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GnomeGameComponent,
    MemoryGameDialogComponent,
    FisheryGameDialogComponent
  ],
  providers: [
    DialogService
  ]
})
export class GnomeGameModule {
}
