import { TestBed } from '@angular/core/testing';

import { PuzzleLibraryService } from './puzzle-library.service';

describe('PuzzleLibraryService', () => {
  let service: PuzzleLibraryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PuzzleLibraryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
