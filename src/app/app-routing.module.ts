import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PuzzleSolverComponent } from './puzzle-solver/puzzle-solver.component';
import { PuzzleSelectorComponent } from './puzzle-selector/puzzle-selector.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/library' },
  { path: 'library', pathMatch: 'full', component: PuzzleSelectorComponent },
  { path: 'puzzle/:id', component: PuzzleSolverComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
