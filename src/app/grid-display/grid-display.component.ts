import { Component, OnInit } from '@angular/core';
import { ClueLabel, DisplayState, DisplayStateService, GridSquare, WordSquare } from '../core/display-state.service';
import { PuzzleStateService } from '../core/puzzle-state.service';

@Component({
  selector: 'app-grid-display',
  templateUrl: './grid-display.component.html',
  styleUrls: ['./grid-display.component.css']
})
export class GridDisplayComponent implements OnInit {
  private state: PuzzleStateService;

  // Used by html template.
  grid: DisplayStateService;
  displayState = DisplayState;

  constructor(gridDisplay: DisplayStateService, puzzleStateService: PuzzleStateService) {
    this.grid = gridDisplay;
    this.state = puzzleStateService;
  }

  ngOnInit(): void {
  }

  gridClicked(square: GridSquare): void {
    this.grid.moveToGridSquare(square);
  }

  wordClicked(square: WordSquare): void {
    this.grid.moveToWordSquare(square);
  }

  getViewBox(): string {
    const width = 40 * this.grid.getDisplay().length + 2;
    const height = 40 * this.grid.getDisplay()[0].length + 2;
    return `0 0 ${height} ${width}`

  }

  displayLabel(l: ClueLabel): string {
    return String.fromCharCode('A'.charCodeAt(0) + l)
  }

  getSquareStyle(square: GridSquare): string {
    if (square.value == null) {
      if (square.focused) {
        return "stroke-width: 1; stroke: rgb(55,55,55); fill:rgb(90, 30, 90);"
      } else {
        return "stroke-width: 1; stroke: rgb(55,55,55); fill:rgb(0,0,0);"
      }
    }
    if (square.focused) {
      return "fill: rgb(241,245,130); stroke-width: 1; stroke: rgb(55,55,55);"
    }
    if (square.value.state == this.displayState.REGULAR) {
      return "fill: rgb(255,255,255); stroke-width: 1; stroke: rgb(55,55,55);"
    }
    if (square.value.state == this.displayState.HIGHLIGHTED) {
      return "fill: rgb(153,204,205); stroke-width: 1; stroke: rgb(55,55,55);"
    }
    return "";
  }

  // @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'z':
        case 'Z':
          if (event.ctrlKey && !event.shiftKey) {
            this.state.undo();
            event.preventDefault();
          } else if (event.ctrlKey && event.shiftKey) {
            this.state.redo();
            event.preventDefault();
          }
      }
      // Ignore anything other than z when control/meta is held down
      return;
    }
    // The switch statement handles keypresses with special meaning
    switch (event.key) {
      case 'ArrowLeft':
      case 'Left':
        this.grid.moveAcross(-1);
        event.preventDefault();
        return;
      case 'ArrowRight':
      case 'Right':
        this.grid.moveAcross(1);
        event.preventDefault();
        return;
      case 'ArrowUp':
      case 'Up':
        this.grid.moveDown(-1);
        event.preventDefault();
        return;
      case 'ArrowDown':
      case 'Down':
        this.grid.moveDown(1);
        event.preventDefault();
        return;
      case 'Tab':
        // handle tab
        return;
      case 'Enter':
        return;
      case 'Backspace':
        this.grid.mutateAndStep('', -1);
        event.preventDefault();
        return;
      case ' ':
      case 'Spacebar':
        this.grid.mutateAndStep('', 1);
        event.preventDefault();
        return;
    }
    const code = event.key.charCodeAt(0);
    if (event.key.length === 1 && code >= 32 && code < 127) {
      this.grid.mutateAndStep(event.key.toUpperCase(), 1);
      // event.preventDefault()
    }
  }
}

