import { Component } from '@angular/core';
import { PuzzleLibraryService, PuzzleListing } from '../core/puzzle-library.service';
import { AcrFormatService } from '../core/acrformat.service';

@Component({
  selector: 'app-puzzle-selector',
  templateUrl: './puzzle-selector.component.html',
  styleUrl: './puzzle-selector.component.css'
})
export class PuzzleSelectorComponent {

  constructor(private puzzleLibrary: PuzzleLibraryService, private acrFormat: AcrFormatService) {
  }

  puzzles(): Array<PuzzleListing> {
    return this.puzzleLibrary.getPuzzles()
  }

  handleFileInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.item(0);
    if (file) {
      file.text().then((text) => {
        const puzzle = this.acrFormat.parseFile(text);
        this.puzzleLibrary.addPuzzle(puzzle);
        target.value = '';
      });
    }
  }

}
