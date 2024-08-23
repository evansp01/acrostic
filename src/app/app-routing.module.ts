import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RedirectComponent } from './redirect.component';
import { PuzzleSolverComponent } from './puzzle-solver/puzzle-solver.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/puzzle' },
  { path: 'puzzle', pathMatch: 'full', component: RedirectComponent },
  { path: 'puzzle/:id', component: PuzzleSolverComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
