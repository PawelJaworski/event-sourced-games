import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {GnomeGameComponent} from './gnome-game.component';
import {MapComponent} from './map/map.component';
import {MemoryGameDialogComponent} from './memory-game/memory-game-dialog.component';
import {MemoryGameComponent} from './memory-game/game.component';
import {FisheryGameDialogComponent} from './fishery-game/fishery-game-dialog.component';
import {FisheryGameComponent} from './fishery-game/fishery-game.component';
import {InteractionsComponent} from './interactions/interactions.component';
import {InventoryComponent} from './inventory/inventory.component';

@NgModule({
  declarations: [
    GnomeGameComponent,
    MapComponent,
    MemoryGameDialogComponent,
    MemoryGameComponent,
    FisheryGameDialogComponent,
    FisheryGameComponent,
    InteractionsComponent,
    InventoryComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GnomeGameComponent,
    MemoryGameDialogComponent,
    FisheryGameDialogComponent
  ]
})
export class GnomeGameModule {
}