import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import GnomeGameComponent from "./gnome-game/gnome-game.component";

const routes: Routes = [
  { path: 'gnome-game', component: GnomeGameComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
