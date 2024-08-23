import { Injectable } from '@angular/core';
import { AcrFormatService, Puzzle } from './acrformat.service';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface PuzzleListing {
  id: string,
  link: string,
  filename: string,
  puzzle: Puzzle,
}


@Injectable({
  providedIn: 'root'
})
export class PuzzleLibraryService {
  private puzzles: Map<string, PuzzleListing>;

  constructor(private acrFormat: AcrFormatService, private httpClient: HttpClient) {
    this.puzzles = new Map()
    this.loadPuzzles()
  }

  async loadPuzzles() {
    const puzzles = await firstValueFrom(this.httpClient.get('assets/puzzles/puzzles.json')) as Array<string>
    for(const puzzle of puzzles) {
      const response = await firstValueFrom(
        this.httpClient.get(`assets/puzzles/${puzzle}`, { responseType: 'text' } ))
      this.addPuzzle(this.acrFormat.parseFile(response), puzzle)
    }
  }

  addPuzzle(puzzle: Puzzle, filename: string) {
    const id = `${filename}-${puzzle.title}-${puzzle.author}`
    this.puzzles.set(id, {
      id: id,
      link: `/puzzle/${id}`,
      filename: filename,
      puzzle: puzzle,
    })
  }

  getPuzzles(): Array<PuzzleListing> {
    return Array.from(this.puzzles.values())
  }

  getPuzzle(id: string): PuzzleListing | undefined {
    return this.puzzles.get(id)
  }
}
