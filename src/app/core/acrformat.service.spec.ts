import { TestBed } from '@angular/core/testing';
import { AcrFormatService } from './acrformat.service';
import { examplePuzzle, examplePuzzle2 } from '../testdata/puzzles';


describe('AcrformatService', () => {
  let service: AcrFormatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AcrFormatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should parse file', () => {
    const puzzle = service.parseFile(examplePuzzle)
    expect(puzzle.author).toEqual("Billym")
  })

  it('should parse file', () => {
    const puzzle = service.parseFile(examplePuzzle2)
    expect(puzzle.author).toEqual("Untitled")
  })
});
