import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { PuzzleListing } from './puzzle-library.service';

export type ValueLabel = number
export type Group = number;
export type GroupIndex = number;

export interface Cursor {
  readonly label: Group;
  readonly value: GroupIndex;
}

export class FillState {

  public constructor(
    public readonly cursor: Cursor,
    public readonly mapping: Map<ValueLabel, string>) {
  }

  static empty(): FillState {
    return new FillState({ label: 0, value: 0 }, new Map<ValueLabel, string>())
  }

  serialize(): string {
    return JSON.stringify({
      cursor: this.cursor,
      mapping: Array.from(this.mapping.entries()),
    })
  }

  static deserialize(json: string): FillState {
    const item = JSON.parse(json);
    return new FillState(item.cursor, new Map<ValueLabel, string>(item.mapping));
  }
}


export class PuzzleState {
  private readonly puzzle: PuzzleListing;
  private past: FillState[];
  private future: FillState[];
  private state: BehaviorSubject<FillState>;

  constructor(puzzle: PuzzleListing) {
    this.puzzle = puzzle;
    this.state = new BehaviorSubject(FillState.empty());
    this.past = [];
    this.future = [];
  }

  getPuzzle(): PuzzleListing {
    return this.puzzle;
  }

  getState(): BehaviorSubject<FillState> {
    return this.state;
  }

  setState(newState: FillState): FillState {
    this.past.push(this.state.value);
    this.state.next(newState);
    this.future = [];
    return newState;
  }

  setValue(cursor: Cursor, label: number, value: string): FillState {
    const state = this.getState().value;
    const mapping = new Map<number, string>();
    state.mapping.forEach((v, k) => {
      mapping.set(k, v);
    })
    mapping.set(label, value);
    return this.setState(new FillState(
      cursor,
      mapping,
    ));
  }

  clearValue(cursor: Cursor, label: number): FillState {
    const state = this.getState().value;
    const mapping = new Map<number, string>();
    state.mapping.forEach((v, k) => {
      mapping.set(k, v);
    })
    mapping.delete(label);
    return this.setState(new FillState(cursor, mapping)
    )
  }

  undo(): void {
    const newState = this.past.pop();
    if (newState === undefined) {
      return;
    }
    this.future.push(this.state.value);
    this.state.next(newState);
  }

  redo(): void {
    const newState = this.future.pop();
    if (newState === undefined) {
      return;
    }
    this.past.push(this.state.value);
    this.state.next(newState);
  }
}


@Injectable()
export class PuzzleStateService {

  private puzzle: BehaviorSubject<PuzzleState | null>;

  constructor() {
    this.puzzle = new BehaviorSubject<PuzzleState | null>(null)
  }

  setPuzzle(puzzle: PuzzleListing) {
    this.puzzle.next(new PuzzleState(puzzle))
  }

  getPuzzle(): Observable<PuzzleState | null> {
    return this.puzzle;
  }
}
