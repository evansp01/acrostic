import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleSolverComponent } from './puzzle-solver.component';
import { AppModule } from '../app.module';
import { PuzzleStateService } from '../core/puzzle-state.service';
import { AcrFormatService } from '../core/acrformat.service';
import { examplePuzzle } from '../testdata/puzzles';

describe('PuzzleSolverComponent', () => {
  let component: PuzzleSolverComponent;
  let fixture: ComponentFixture<PuzzleSolverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PuzzleSolverComponent],
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

    fixture = TestBed.createComponent(PuzzleSolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
