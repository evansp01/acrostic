import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PuzzleSelectorComponent } from './puzzle-selector.component';
import { AppModule } from '../app.module';

describe('PuzzleSelectorComponent', () => {
  let component: PuzzleSelectorComponent;
  let fixture: ComponentFixture<PuzzleSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PuzzleSelectorComponent],
      imports: [AppModule],
      providers: [AppModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PuzzleSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
