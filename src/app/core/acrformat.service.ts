import { Injectable } from '@angular/core';

const _START_SECTION = '!start';

export type ValueLabel = number
export type ClueLabel = number

export interface Square {
  readonly label: ClueLabel;
  readonly mapping: ValueLabel;
  readonly answer: string;
}

export interface Grid {
  height: number;
  width: number;
  grid: readonly (readonly (Square | null)[])[];
}

export interface Clue {
  hint: string;
  label: ClueLabel;
  mapping: readonly ValueLabel[];
}

export interface Puzzle {
  grid: Grid,
  clues: Clue[],
  title: string,
  author: string,
}

@Injectable({
  providedIn: 'root'
})
export class AcrFormatService {
  private MAGIC_HEADER = "! This file made by Acrostic 3.0 program. DO NOT EDIT!"

  private parseSection(line: string): [string, boolean] {
    const trimmed = line.trim();
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      return [trimmed.substring(1, trimmed.length - 1).toLowerCase(), true];
    }
    return ["", false];
  }

  private parseSections(file: string): Map<string, string[]> {
    const sections = new Map<string, string[]>()

    let currentSection: string[] = []
    sections.set(_START_SECTION, currentSection)
    for (const  split of file.split(/\r?\n/)) {
      const trimmed = split.trim();
      if (trimmed == "") {
        continue;
      }
      const [sectionTitle, ok] = this.parseSection(trimmed)
      if (ok) {
        currentSection = []
        sections.set(sectionTitle, currentSection)
      } else {
        currentSection.push(trimmed)
      }
    }
    return sections
  }

  private parseClues(lines: string[]): [Clue[], Map<ValueLabel, Square>] {
    if (lines.length % 3 != 0) {
      throw new Error(`keywords section ended unexpectedly after ${lines.length} lines`);
    }
    if (lines.length > 26 * 3) {
      throw new Error('Too many clues -- only 26 are supported');
    }
    // A. Having a rose-like pattern
    // ROSEATE
    // 171 120 124 140 112 113 87
    const answerMap = new Map<ValueLabel, Square>()
    const clues: Clue[] = []
    let label = 0;
    for (let i = 0; i < lines.length; i += 3) {
      const labelStr = String.fromCharCode('A'.charCodeAt(0) + label)
      const clue = lines[i];
      if (clue[0].toLowerCase() != labelStr.toLowerCase()) {
        throw new Error(`Expected clue ${clue} to begin with ${labelStr}`);
      }
      const clueNoLabel = clue.replace(/[a-zA-Z][.]?/, '').trim();
      const answer = lines[i + 1];
      const mappings = lines[i + 2].split(/\s+/).map((x) => +x);
      for (const v of mappings) {
        if (Number.isNaN(v)) {
          throw new Error(`found unparseable value when reading mappping of ${clue}`);
        }
      }
      if (answer.length != mappings.length) {
        throw new Error(`Answer ${answer} and mapping ${mappings} have lengths ${answer.length} != ${mappings.length}`)
      }
      for (let j = 0; j < answer.length; j++) {
        const mapping = mappings[j]
        const already = answerMap.get(mapping)
        if (already != undefined) {
          throw new Error(`index ${mapping} appeared in clue ${already} and ${labelStr}`)
        }
        answerMap.set(mapping, {
          label: label,
          mapping: mapping,
          answer: answer.charAt(j)
        });
      }
      clues.push({
        hint: clueNoLabel,
        label: label,
        mapping: mappings,
      })
      // Increment label
      label++;
    }
    return [clues, answerMap]
  }

  private parseGrid(lines: string[], squares: Map<ValueLabel, Square>): Grid {
    const height = lines.length;
    const width = lines[0].length;
    const grid: (Square | null)[][] = [];
    let mapping: ValueLabel = 1;
    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];
      if (line.length != width) {
        throw new Error(`Line ${j + 1} of has length ${line.length} != ${width}`);
      }
      grid[j] = []
      for (let i = 0; i < line.length; i++) {
        const answer = line.charAt(i);
        if (answer == '#') {
          grid[j][i] = null;
        } else {
          const square = squares.get(mapping)
          if (square == undefined) {
            throw Error(`clue and grid mismatch, missing mapping for ${mapping}`);
          }
          if (square.answer != answer) {
            throw Error(`clue and grid mismatch for ${mapping}, clue gives ${square.answer}, grid ${answer}`);
          }
          grid[j][i] = square;
          mapping++;
        }
      }
    }
    return {
      grid: grid,
      width: width,
      height: height,
    }
  }

  private parseAuthor(author: string): string {
    return author.replace(/by/, '').trim();
  }

  private getOneLine(sections: Map<string, string[]>, section: string, fallback: string) {
    const lines = sections.get(section);
    if (lines == undefined) {
      return fallback
    }
    if (lines.length != 1) {
      throw new Error(`unexpected section length ${section}: ${lines.length}`)
    }
    return lines[0];
  }

  parseFile(file: string): Puzzle {
    const requiredSections = ['grid', 'keywords', _START_SECTION]
    const sections = this.parseSections(file)
    for (const rs of requiredSections) {
      if (!sections.has(rs)) {
        throw new Error(`file missing required section '${rs}'`);
      }
    }
    const start = this.getOneLine(sections, _START_SECTION, "")
    if (start != this.MAGIC_HEADER) {
      throw new Error('Missing magic header string');
    }
    const title = this.getOneLine(sections, "title", "Untitled");
    const author = this.parseAuthor(this.getOneLine(sections, "byline", "by Anonymous"))
    const [clues, answerMap] = this.parseClues(sections.get("keywords")!);
    const grid = this.parseGrid(sections.get("grid")!, answerMap);
    return {
      grid: grid,
      clues: clues,
      title: title,
      author: author,
    }
  }
}
