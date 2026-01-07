import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import GnomeGameComponent from './gnome-game.component';

@NgModule({
  declarations: [
    GnomeGameComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    GnomeGameComponent
  ]
})
export class GnomeGameModule {
}
