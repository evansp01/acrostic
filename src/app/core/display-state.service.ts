import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, filter, Subscription, switchMap } from 'rxjs';
import { Cursor, PuzzleStateService, ValueLabel, Group, GroupIndex, FillState, PuzzleState } from './puzzle-state.service';
import { Square, Puzzle } from './acrformat.service';

export type ClueLabel = number;

export interface Location {
  row: number,
  column: number,
}

function toGroupIndex(l: Location): GroupIndex {
  const maxWidth = 10000;
  return l.row * maxWidth + l.column;
}

function toLocation(g: GroupIndex): Location {
  const maxWidth = 10000;
  return {
    row: Math.floor(g / maxWidth),
    column: g % maxWidth,
  }
}

export enum DisplayState {
  REGULAR,
  HIGHLIGHTED,
}

export interface LinkedValue {
  readonly mapping: ValueLabel;
  readonly label: ClueLabel;

  state: DisplayState;
  value: string;
}

export interface GridSquare {
  readonly location: Location;
  readonly value: LinkedValue | null;
  focused: boolean;
}

export interface WordSquare {
  readonly group: Group;
  readonly index: GroupIndex;
  readonly value: LinkedValue;
  focused: boolean;
}

export interface DisplayGrid {
  rows: number;
  columns: number;
  display: GridSquare[][];
  valueToSquare: Map<ValueLabel, GridSquare>;

}

export interface DisplayClue {
  readonly group: Group;
  readonly hint: string;
  readonly label: ClueLabel;
  readonly squares: ReadonlyArray<WordSquare>;
}

export interface DisplayAuthor {
  readonly group: Group;
  readonly squares: ReadonlyArray<WordSquare>;
}

export interface Display {
  grid: DisplayGrid;
  clues: DisplayClue[];
  author: DisplayAuthor;
}

function clamp(min: number, x: number, max: number) {
  return Math.max(min, Math.min(max, x));
}

@Injectable()
export class DisplayStateService implements OnDestroy {
  private subscriptions = new Subscription();
  private display!: Display;
  private cursor!: Cursor;
  private puzzleState!: PuzzleState;
  public readonly currentClue: BehaviorSubject<ClueLabel>;

  constructor(private puzzleStateService: PuzzleStateService) {
    this.currentClue = new BehaviorSubject<ClueLabel>(0);
    this.subscriptions.add(this.puzzleStateService.getPuzzle().pipe(filter(v => v != null)).pipe(
      switchMap(puzzle => {
        this.currentClue.next(0);
        this.puzzleState = puzzle!;
        this.display = this.puzzleToDisplay(this.puzzleState.getPuzzle().puzzle);
        return this.puzzleState.getState()
      })).subscribe(
        (state) => {
          this.refreshDisplayFromState(state);
        }
      ))
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private puzzleToDisplay(puzzle: Puzzle): Display {
    const values = new Map<ValueLabel, LinkedValue>();
    const displayClues = [];
    for (const [index, clue] of puzzle.clues.entries()) {
      displayClues.push({
        group: index + 1,
        hint: clue.hint,
        label: clue.label,
        squares: clue.mapping.map((v, i) => {
          const value = {
            mapping: v,
            label: clue.label,
            state: DisplayState.REGULAR,
            value: ''
          }
          values.set(v, value);
          return {
            group: index,
            index: i,
            value: value,
            focused: false
          }
        })
      })
    }
    const displayAuthor = {
      group: -1,
      squares: displayClues.map(c => {
        return {
          group: -1,
          index: c.label,
          value: c.squares[0].value,
          focused: false,
        }
      })
    }
    const squareMap = new Map<ValueLabel, GridSquare>();
    const grid = puzzle.grid.grid.map((row: readonly (Square | null)[], j) => row.map((square: (Square | null), i) => {
      const gridSquare = {
        location: {
          row: j,
          column: i,
        },
        value: square != null ? values.get(square.mapping)! : null,
        focused: false,
      };
      if (square != null) {
        squareMap.set(square.mapping, gridSquare);
      }
      return gridSquare
    }));
    return {
      grid: {
        rows: puzzle.grid.height,
        columns: puzzle.grid.width,
        display: grid,
        valueToSquare: squareMap,
      },
      author: displayAuthor,
      clues: displayClues,
    }
  }

  private refreshDisplayFromState(state: FillState): void {
    this.display.grid.valueToSquare.forEach((v, k) => {
      v.value!.value = state.mapping.get(k) ?? ''
    })
    this.updateDisplayHighlighting(state.cursor);
  }

  private updateDisplayHighlighting(cursor: Cursor): void {
    this.cursor = cursor;
    this.display.grid.display.forEach(row => row.forEach(square => {
      square.focused = false;
    }))
    this.display.author.squares.forEach(square => {
      square.focused = false;
    })
    this.display.clues.forEach(clue => clue.squares.forEach(square => {
      square.focused = false;
      square.value.state = DisplayState.REGULAR
    }))
    if (cursor.label == -2) {
      const location = toLocation(cursor.value);
      const square = this.display.grid.display[location.row][location.column];
      square.focused = true;
      if (square.value != null) {
        square.value.state = DisplayState.HIGHLIGHTED
        this.currentClue.next(square.value.label);
      }
    } else if (cursor.label == -1) {
      const square = this.display.author.squares[cursor.value];
      square.focused = true;
      square.value.state = DisplayState.HIGHLIGHTED
      this.currentClue.next(square.value.label);
    } else {
      const square = this.display.clues[cursor.label].squares[cursor.value];
      square.focused = true;
      square.value.state = DisplayState.HIGHLIGHTED
      this.currentClue.next(square.value.label);
    }
  }

  getDisplay(): GridSquare[][] {
    return this.display.grid.display;
  }

  getClues(): DisplayClue[] {
    return this.display.clues;
  }

  getAuthor(): DisplayAuthor {
    return this.display.author
  }

  getState(): PuzzleState {
    return this.puzzleState;
  }

  moveAcross(step: number): void {
    const cursor = this.cursor;
    if (cursor.label == -2) {
      const location = toLocation(cursor.value);
      const newLocation = {
        row: location.row,
        column: clamp(0, location.column + step, this.display.grid.columns - 1),
      }
      this.updateDisplayHighlighting({
        label: cursor.label,
        value: toGroupIndex(newLocation),
      });
    } else if (cursor.label == -1) {
      this.updateDisplayHighlighting({
        label: cursor.label,
        value: clamp(0, cursor.value + step, this.display.author.squares.length - 1)
      });
    } else {
      const clue = this.display.clues[cursor.label]
      this.updateDisplayHighlighting({
        label: cursor.label,
        value: clamp(0, cursor.value + step, clue.squares.length - 1)
      });
    }
  }

  moveToGridSquare(square: GridSquare): void {
    this.updateDisplayHighlighting({
      label: -2,
      value: toGroupIndex(square.location),
    })
  }

  moveToWordSquare(square: WordSquare): void {
    this.updateDisplayHighlighting({
      label: square.group,
      value: square.index,
    })
  }

  moveDown(step: number): void {
    const cursor = this.cursor;
    if (cursor.label == -2) {
      const location = toLocation(cursor.value);
      const newLocation = {
        row: clamp(0, location.row + step, this.display.grid.rows - 1),
        column: location.column
      }
      this.updateDisplayHighlighting({
        label: cursor.label,
        value: toGroupIndex(newLocation),
      });
    }
  }

  moveGroup(step: number): void {
    const cursor = this.cursor
    const newGroup = ((2 + cursor.label + step) % (2 + this.display.clues.length)) - 2
    this.updateDisplayHighlighting({
      label: newGroup,
      value: 0,
    })
  }

  mutateAndStep(value: string, step: number): void {
    const cursor = this.cursor;
    if (cursor.label == -2) {
      const location = toLocation(cursor.value);
      const square = this.display.grid.display[location.row][location.column];
      if (square.value == null) {
        return;
      }
      this.puzzleState.setValue(cursor, square.value.mapping, value);
      const nextSquare = this.display.grid.valueToSquare.get(square.value.mapping + step);
      if (nextSquare == undefined) {
        return;
      }
      return this.updateDisplayHighlighting({
        label: cursor.label,
        value: toGroupIndex(nextSquare.location),
      });
    } else if (cursor.label == -1) {
      const square = this.display.author.squares[cursor.value]
      this.puzzleState.setValue(cursor, square.value.mapping, value)
      this.moveAcross(step);
    } else {
      const clue = this.display.clues[cursor.label]
      const square = clue.squares[cursor.value]
      this.puzzleState.setValue(cursor, square.value.mapping, value)
      this.moveAcross(step);
    }
  }
}
