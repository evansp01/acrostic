import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { PuzzleLibraryService, PuzzleListing } from '../core/puzzle-library.service';
import { AcrFormatService } from '../core/acrformat.service';

@Component({
  selector: 'app-puzzle-selector',
  templateUrl: './puzzle-selector.component.html',
  styleUrl: './puzzle-selector.component.css'
})
export class PuzzleSelectorComponent implements OnInit {

  constructor(private puzzleLibrary: PuzzleLibraryService, private acrFormat: AcrFormatService, private  changeDetector: ChangeDetectorRef) {
  }

  ngOnInit() {
    this.puzzleLibrary.getPuzzles().subscribe(() => {
      this.changeDetector.detectChanges()
    })
  }

  puzzles(): Array<PuzzleListing> {
    return this.puzzleLibrary.getPuzzles().value
  }

  handleFileInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.item(0);
    if (file) {
      file.text().then((text) => {
        const puzzle = this.acrFormat.parseFile(text);
        this.puzzleLibrary.addPuzzle(puzzle, file.name);
        target.value = '';
      });
    }
  }

}
