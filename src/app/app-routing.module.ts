import { inject, NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, RedirectCommand, ResolveFn, Router, RouterModule, Routes, UrlTree } from '@angular/router';
import { PuzzleSolverComponent } from './puzzle-solver/puzzle-solver.component';
import { PuzzleSelectorComponent } from './puzzle-selector/puzzle-selector.component';
import { PuzzleLibraryService, PuzzleListing } from './core/puzzle-library.service';
import { filter, firstValueFrom, timeout } from 'rxjs';

export const puzzleResolver: ResolveFn<PuzzleListing | UrlTree> = async (
  route: ActivatedRouteSnapshot
) => {
  const id = route.params.id;
  const puzzleLibrary = inject(PuzzleLibraryService);
  // Make sure the puzzle library is loaded before trying to resolve the puzzle
  await firstValueFrom(puzzleLibrary.getPuzzles().pipe(filter((puzzles) => puzzles.length != 0), timeout(3000)))
  const puzzle = puzzleLibrary.getPuzzle(id)
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
})
export class AppRoutingModule { }
