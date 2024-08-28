import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleSolverComponent } from './puzzle-solver.component';
import { AppModule } from '../app.module';

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
    fixture = TestBed.createComponent(PuzzleSolverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
