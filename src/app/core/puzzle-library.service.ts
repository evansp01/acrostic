import { Injectable } from '@angular/core';
import { AcrFormatService, Puzzle } from './acrformat.service';
import { HttpClient } from '@angular/common/http';
import { filter, interval, take } from 'rxjs';
import { LocalStateStoreService } from './local-state-store.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const gapi: any | undefined;

export interface PuzzleListing {
  id: string,
  link: string,
  filename: string,
  puzzle: Puzzle,
}

interface DriveFile {
  name: string,
  id: string
}


@Injectable({
  providedIn: 'root'
})
export class PuzzleLibraryService {
  private puzzles: Map<string, PuzzleListing>;

  constructor(private acrFormat: AcrFormatService, private localStore: LocalStateStoreService, private httpClient: HttpClient) {
    this.puzzles = new Map()
    interval(50).pipe(filter(() => gapi != undefined), take(1)).subscribe(() => {
      gapi.load('client', () => { this.loadPuzzlesFromDrive() });
    })
  }


  async getAcrFilesInFolder(folderId: string): Promise<Array<DriveFile>> {
    let allFiles: Array<DriveFile> = [];
    let pageToken = null;

    do {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response: any = await gapi.client.drive.files.list({
          q: `'${folderId}' in parents and name contains '.acr' and trashed = false`,
          fields: 'nextPageToken, files(id, name)',
          pageToken: pageToken
        });

        const files = response.result.files;
        allFiles = allFiles.concat(files);
        pageToken = response.result.nextPageToken;
      } catch (error) {
        console.error('Error fetching .acr files:', error);
        throw error;
      }
    } while (pageToken);

    return allFiles;
  }

  async getFileContents(fileId: string): Promise<string> {
    const cache = this.localStore.fileCache();
    try {
      const cached = cache.getFile(fileId)
      if (cached != undefined) {
        return cached;
      }
      const response = await gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
      });
      cache.setFile(fileId, response.body);
      return response.body;
    } catch (error) {
      console.error('Error fetching file contents:', error);
      throw error;
    }
  }

  async getAcrFilesWithContents(folderId: string) {
    try {
      const files = await this.getAcrFilesInFolder(folderId);
      const filesWithContents = await Promise.all(files.map(async (file) => {
        const contents = await this.getFileContents(file.id);
        return { ...file, contents };
      }));
      return filesWithContents;
    } catch (error) {
      console.error('Error getting .acr files with contents:', error);
      throw error;
    }
  }

  loadPuzzlesFromDrive() {
    // 2. Initialize the JavaScript client library.
    gapi.client.init({
      apiKey: "AIzaSyA0FE5rL086cgl7IzbwRhufFzQ8wJi4xmY",
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    }).then(() => {
      this.getAcrFilesWithContents('1uajRYn32brdL5Unow6XhuvO1KHt2za89').then((files) => {
        for (const file of files) {
          this.addPuzzle(this.acrFormat.parseFile(file.contents), file.name)
        }
      })
    })
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
