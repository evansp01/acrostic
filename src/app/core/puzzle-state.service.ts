import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ValueLabel = number
export type Group = number;
export type GroupIndex = number;

export interface Cursor {
  readonly label: Group;
  readonly value: GroupIndex;
}

export class FillState {
  public readonly cursor: Cursor
  public readonly mapping: Map<ValueLabel, string>;

  public constructor() {
    this.cursor = { label: 0, value: 0 };
    this.mapping = new Map<ValueLabel, string>;
  }
}



@Injectable()
export class PuzzleStateService {

  private past: FillState[];
  private future: FillState[];
  private state: BehaviorSubject<FillState>;

  constructor() {
    this.state = new BehaviorSubject(new FillState());
    this.past = [];
    this.future = [];
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
    return this.setState({
      cursor: cursor,
      mapping: mapping,
    });
  }

  clearValue(cursor: Cursor, label: number): FillState {
    const state = this.getState().value;
    const mapping = new Map<number, string>();
    state.mapping.forEach((v, k) => {
      mapping.set(k, v);
    })
    mapping.delete(label);
    return this.setState({
      cursor: cursor,
      mapping: mapping,
    })
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
