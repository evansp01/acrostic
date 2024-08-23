import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { FillState, PuzzleState } from './puzzle-state.service';

const daysToMillis = 24 * 60 * 60 * 1000;

interface StorageItem {
  state: string;
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
  private readonly key: string;

  constructor(key: string) {
    this.key = 'state-' + key;
  }

  attach(puzzleState: PuzzleState): Subscription {
    const existing = this.locateState();
    if (existing != null) {
      puzzleState.setState(existing);
    }
    return puzzleState.getState().subscribe(s => {
      this.saveState(s);
    });
  }

  saveState(state: FillState): void {
    const item: StorageItem = { state: state.serialize(), time: Date.now() + daysToMillis * 7 };
    localStorage.setItem(this.key, JSON.stringify(item));
  }

  locateState(): FillState | null {
    const item = stringToStorageItem(localStorage.getItem(this.key));
    if (item == null) return null;
    return FillState.deserialize(item.state)
  }
}

export class FileCache {
  constructor(private prefix: string) { }

  getFile(id: string): string | null {
    const item = stringToStorageItem(localStorage.getItem(this.prefix + id))
    if (item == null) return null;
    return item.state
  }

  setFile(id: string, contents: string) {
    const item: StorageItem = { state: contents, time: Date.now() + daysToMillis * 7 };
    localStorage.setItem(this.prefix + id, JSON.stringify(item));
  }
}

@Injectable({
  providedIn: 'root'
})
export class LocalStateStoreService {
  private cache: FileCache

  constructor() {
    this.pruneOldObjects();
    this.cache = new FileCache('files-');
  }

  makeStateStore(key: string): LocalStateStore {
    return new LocalStateStore(key);
  }

  fileCache(): FileCache {
    return this.cache
  }

  private pruneOldObjects(): void {
    for (const key of Object.keys(localStorage)) {
      const item = stringToStorageItem(localStorage.getItem(key));
      if (item === null) {
        localStorage.removeItem(key);
        continue;
      }
      if (Date.now() > item.time) {
        localStorage.removeItem(key);
      }
    }
  }
}
