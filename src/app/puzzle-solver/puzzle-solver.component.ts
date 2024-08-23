import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { DisplayStateService } from '../core/display-state.service';
import { LocalStateStoreService } from '../core/local-state-store.service';
import { FillState, PuzzleStateService } from '../core/puzzle-state.service';

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
  ) {}


  ngOnInit(): void {
    let subscription: Subscription | null = null;
    this.subscriptions.add(this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id === null) {
        return;
      }
      if (subscription != null) {
        this.subscriptions.remove(subscription);
        subscription.unsubscribe();
      }
      this.puzzleState.setState(FillState.Empty());
      const storage = this.localStore.makeStateStore(id);
      subscription = storage.attach(this.puzzleState);
      this.subscriptions.add(subscription);
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
