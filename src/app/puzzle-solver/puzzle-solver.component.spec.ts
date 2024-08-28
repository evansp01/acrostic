import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleSolverComponent } from './puzzle-solver.component';
import { AppModule } from '../app.module';
import { AcrFormatService } from '../core/acrformat.service';
import { examplePuzzle } from '../testdata/puzzles';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('PuzzleSolverComponent', () => {
  let component: PuzzleSolverComponent;
  let fixture: ComponentFixture<PuzzleSolverComponent>;
  const puzzle = new AcrFormatService().parseFile(examplePuzzle);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PuzzleSolverComponent],
      imports: [AppModule],
      providers: [AppModule, {
        provide: ActivatedRoute,
        useValue: {
          data: of({
            puzzle: {
              id: "test",
              link: "test",
              filename: "test",
              puzzle: puzzle
            }
          })
        }
      }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PuzzleSolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
