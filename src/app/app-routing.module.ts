import { inject, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RedirectCommand, ResolveFn, Router, RouterModule, Routes, UrlTree } from '@angular/router';
import { PuzzleSolverComponent } from './puzzle-solver/puzzle-solver.component';
import { PuzzleSelectorComponent } from './puzzle-selector/puzzle-selector.component';
import { PuzzleLibraryService, PuzzleListing } from './core/puzzle-library.service';
import { provideHttpClient } from '@angular/common/http';


export const puzzleResolver: ResolveFn<PuzzleListing | UrlTree> = async (
  route: ActivatedRouteSnapshot
) => {
  const id = route.params.id;
  const puzzle = inject(PuzzleLibraryService).getPuzzle(id)
  if (puzzle == undefined) {
    return new RedirectCommand(inject(Router).parseUrl('/'))
  }
  return puzzle!;
};

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/library' },
  { path: 'library', pathMatch: 'full', component: PuzzleSelectorComponent },
  { path: 'puzzle/:id', component: PuzzleSolverComponent, resolve: {puzzle: puzzleResolver} },
];



@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [provideHttpClient()],
})
export class AppRoutingModule { }
