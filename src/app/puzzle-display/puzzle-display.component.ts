import { ChangeDetectorRef, Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { ClueLabel, DisplayState, DisplayStateService, GridSquare, WordSquare } from '../core/display-state.service';
import { debounceTime } from 'rxjs';

@Component({
  selector: 'app-puzzle-display',
  templateUrl: './puzzle-display.component.html',
  styleUrls: ['./puzzle-display.component.css']
})
export class PuzzleDisplayComponent implements OnInit, OnDestroy {
  // Used by html template.
  readonly grid: DisplayStateService;
  readonly changeRef: ChangeDetectorRef
  displayState = DisplayState;

  constructor(gridDisplay: DisplayStateService, changeRef: ChangeDetectorRef) {
    this.grid = gridDisplay;
    this.changeRef = changeRef;
  }

  ngOnInit(): void {
    this.grid.currentClue.pipe(debounceTime(300)).subscribe(l => {
      const elem = document.getElementById(this.clueId(l));
      elem?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    })
  }

  ngOnDestroy(): void {
    this.grid.currentClue.unsubscribe()
  }

  gridClicked(square: GridSquare): void {
    this.grid.moveToGridSquare(square);
  }

  wordClicked(square: WordSquare): void {
    this.grid.moveToWordSquare(square);
  }

  clueId(clue: ClueLabel): string {
    return 'clue' + clue
  }

  getViewBox(): string {
    const width = 40 * this.grid.getDisplay().length + 2;
    const height = 40 * this.grid.getDisplay()[0].length + 2;
    return `0 0 ${height} ${width}`
  }

  displayLabel(l: ClueLabel): string {
    return String.fromCharCode('A'.charCodeAt(0) + l)
  }

  getSquareClass(square: GridSquare): string {
    if (square.value == null) {
      if (square.focused) {
        return "grid-square black-square-focused"
      } else {
        return "grid-square black-square"
      }
    }
    if (square.focused) {
      return "grid-square white-square-focused"
    }
    switch(square.value.state) {
      case this.displayState.REGULAR:
        return "grid-square white-square";
      case this.displayState.HIGHLIGHTED:
        return "grid-square white-square-highlighted"
    }
  }

  getWordClass(square: WordSquare): string {
    if (square.focused) {
      return "letter-box letter-box-focused"
    } 
    switch(square.value.state) {
      case this.displayState.REGULAR:
        return "letter-box"
      case this.displayState.HIGHLIGHTED:
        return "letter-box letter-box-highlighted"
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 'z':
        case 'Z':
          if (event.ctrlKey && !event.shiftKey) {
            console.log('undo')
            this.grid.getState().undo();
            event.preventDefault();
          } else if (event.ctrlKey && event.shiftKey) {
            console.log('redo')
            this.grid.getState().redo();
            event.preventDefault();
          }
      }
      // Ignore anything other than z when control/meta is held down
      this.changeRef.detectChanges()
      return;
    }
    // The switch statement handles keypresses with special meaning
    switch (event.key) {
      case 'ArrowLeft':
      case 'Left':
        this.grid.moveAcross(-1);
        event.preventDefault();
        break;
      case 'ArrowRight':
      case 'Right':
        this.grid.moveAcross(1);
        event.preventDefault();
        break;
      case 'ArrowUp':
      case 'Up':
        this.grid.moveDown(-1);
        event.preventDefault();
        break;
      case 'ArrowDown':
      case 'Down':
        this.grid.moveDown(1);
        event.preventDefault();
        break;
      case 'Tab':
        // handle tab
        if (event.shiftKey) {
          this.grid.moveGroup(-1)
        } else {
          this.grid.moveGroup(1)
        }
        event.preventDefault();
        break;
      case 'Enter':
        break;
      case 'Backspace':
        this.grid.mutateAndStep('', -1);
        event.preventDefault();
        break;
      case ' ':
      case 'Spacebar':
        this.grid.mutateAndStep('', 1);
        event.preventDefault();
        break;
      default: {
        const code = event.key.charCodeAt(0);
        if (event.key.length === 1 && code >= 32 && code < 127) {
          this.grid.mutateAndStep(event.key.toUpperCase(), 1);
        }
      }
    }
    this.changeRef.detectChanges()
  }
}

