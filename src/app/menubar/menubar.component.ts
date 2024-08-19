import { Component, OnInit } from '@angular/core';
import { AcrFormatService } from '../core/acrformat.service';
import { PuzzleStateService } from '../core/puzzle-state.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-menubar',
  templateUrl: './menubar.component.html',
  styleUrls: ['./menubar.component.css']
})
export class MenubarComponent implements OnInit {
  constructor(
    private serializationService: AcrFormatService, private puzzleStateService: PuzzleStateService,
    private route: ActivatedRoute) { }

  ngOnInit(): void {
  }

  handleFileInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.item(0);
    if (file) {
      file.text().then((text) => {
        const state = this.serializationService.parseFile(text);
        // this.puzzleStateService.setState(state);
        // Reset the file input
        target.value = '';
      });
    }
  }
}
