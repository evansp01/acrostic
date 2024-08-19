import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { FillState, PuzzleStateService } from './puzzle-state.service';

interface StorageItem {
  state: FillState;
  time: number;
}

function stringToStorageItem(json: string | null): StorageItem | null {
  if (json === null) {
    return null;
  }
  try {
    return JSON.parse(json) as StorageItem;
  } catch {
    return null;
  }
}

export class LocalStateStore {

  constructor(private key: string) { }

  attach(puzzleState: PuzzleStateService): Subscription {
    const existing = this.locateState();
    if (existing) {
      puzzleState.setState(existing);
    }
    return puzzleState.getState().subscribe(s => {
      this.saveState(s);
    });
  }

  saveState(state: FillState): void {
    const item: StorageItem = { state: state, time: Date.now() };
    localStorage.setItem(this.key, JSON.stringify(item));
  }

  locateState(): FillState | null {
    const item = stringToStorageItem(localStorage.getItem(this.key));
    if (item == null) return null;
    return item.state;
  }
}

@Injectable({
  providedIn: 'root'
})
export class LocalStateStoreService {
  private static daysToMillis = 24 * 60 * 60 * 1000;

  constructor() {
    this.pruneOldObjects();
  }

  makeStateStore(key: string): LocalStateStore {
    return new LocalStateStore(key);
  }

  private pruneOldObjects(): void {
    for (const key of Object.keys(localStorage)) {
      const item = stringToStorageItem(localStorage.getItem(key));
      if (item === null) {
        localStorage.removeItem(key);
        continue;
      }
      if (Date.now() - item.time > LocalStateStoreService.daysToMillis * 7) {
        localStorage.removeItem(key);
      }
    }
  }
}
