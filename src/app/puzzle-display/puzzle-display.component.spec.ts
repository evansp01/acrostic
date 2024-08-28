import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleDisplayComponent } from './puzzle-display.component';
import { AppModule } from '../app.module';

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
    fixture = TestBed.createComponent(PuzzleDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
