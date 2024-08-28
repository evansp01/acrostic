import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleDisplayComponent } from './puzzle-display.component';
import { AppModule } from '../app.module';
import { PuzzleStateService } from '../core/puzzle-state.service';
import { AcrFormatService } from '../core/acrformat.service';
import { examplePuzzle } from '../testdata/puzzles';

describe('PuzzleDisplayComponent', () => {
  let component: PuzzleDisplayComponent;
  let fixture: ComponentFixture<PuzzleDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PuzzleDisplayComponent],
      imports: [AppModule],
      providers: [AppModule]
    })
      .compileComponents();
  });

  beforeEach(() => {
    const puzzleStateService = TestBed.inject(PuzzleStateService);
    const acrFormatService = TestBed.inject(AcrFormatService);
    puzzleStateService.setPuzzle({
      id: "test",
      link: "test",
      filename: "test",
      puzzle: acrFormatService.parseFile(examplePuzzle)
    });
    fixture = TestBed.createComponent(PuzzleDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
