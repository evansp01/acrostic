import { Injectable } from '@angular/core';
import { AcrFormatService, Puzzle } from './acrformat.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, filter, interval, take } from 'rxjs';
import { LocalStateStoreService } from './local-state-store.service';
import { environment } from '../../environments/environment';

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

const cyrb53 = (str: string, seed = 0) => {
  // https://stackoverflow.com/a/52171480
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  for(let i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};


@Injectable({
  providedIn: 'root'
})
export class PuzzleLibraryService {
  private puzzles: Map<string, PuzzleListing>;
  private subject: BehaviorSubject<PuzzleListing[]>;

  constructor(private acrFormat: AcrFormatService, private localStore: LocalStateStoreService, private httpClient: HttpClient) {
    this.puzzles = new Map()
    this.subject = new BehaviorSubject<PuzzleListing[]>([])
    interval(100).pipe(filter(() => gapi != undefined), take(1)).subscribe(() => {
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
      if (cached != null) {
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
    console.log(environment.googleApiKey)
    gapi.client.init({
      apiKey: environment.googleApiKey,
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
    }).then(() => {
      this.getAcrFilesWithContents('1uajRYn32brdL5Unow6XhuvO1KHt2za89').then((files) => {
        for (const file of files) {
          try {
            this.addPuzzle(this.acrFormat.parseFile(file.contents), file.name)
          } catch (error) {
            console.log(`error converting ${file}: ${error}`)
          }
        }
      })
    })
  }

  addPuzzle(puzzle: Puzzle, filename: string) {
    const id = cyrb53(JSON.stringify(puzzle)).toString(16)
    this.puzzles.set(id, {
      id: id,
      link: `/puzzle/${id}`,
      filename: filename,
      puzzle: puzzle,
    })
    this.subject.next(Array.from(this.puzzles.values()))
  }

  getPuzzles(): BehaviorSubject<Array<PuzzleListing>> {
    return this.subject;
  }

  getPuzzle(id: string): PuzzleListing | undefined {
    return this.puzzles.get(id)
  }
}
