import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {GnomeGameComponent} from "./gnome-game/gnome-game.component";

const routes: Routes = [
  { path: '', redirectTo: 'gnome-game', pathMatch: 'full' },
  { path: 'gnome-game', component: GnomeGameComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
