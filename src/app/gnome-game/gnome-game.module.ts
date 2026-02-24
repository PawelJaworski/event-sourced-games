import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GnomeGameComponent} from './gnome-game.component';
import {MemoryGameDialogComponent} from './memory-game/memory-game-dialog.component';
import {MemoryGameComponent} from './memory-game/game.component';
import {DialogService} from './dialog.service';

@NgModule({
  declarations: [
    GnomeGameComponent,
    MemoryGameDialogComponent,
    MemoryGameComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GnomeGameComponent,
    MemoryGameDialogComponent
  ],
  providers: [
    DialogService
  ]
})
export class GnomeGameModule {
}
