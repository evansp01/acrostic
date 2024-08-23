import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { DisplayStateService } from '../core/display-state.service';
import { LocalStateStoreService } from '../core/local-state-store.service';
import { PuzzleStateService } from '../core/puzzle-state.service';
import { PuzzleListing } from '../core/puzzle-library.service';

@Component({
  selector: 'app-puzzle-solver',
  templateUrl: './puzzle-solver.component.html',
  styleUrls: ['./puzzle-solver.component.css'],
  providers: [PuzzleStateService, DisplayStateService]
})
export class PuzzleSolverComponent implements OnInit, OnDestroy {
  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private puzzleState: PuzzleStateService,
    private localStore: LocalStateStoreService,
  ) {
    this.subscriptions.add(this.puzzleState.getPuzzle().pipe(filter(p => p != null)).subscribe((puzzle) => {
      this.localStore.makeStateStore(puzzle!.getPuzzle().id).attach(puzzle!);
    }))
  }


  ngOnInit(): void {
    this.route.data.subscribe(({puzzle}) => {
      this.puzzleState.setPuzzle(puzzle as PuzzleListing);
    })
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
