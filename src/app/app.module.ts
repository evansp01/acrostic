import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { WordSuggestionComponent } from './word-suggestion/word-suggestion.component';
import { GridDisplayComponent } from './grid-display/grid-display.component';
import { CandidateDisplayComponent } from './word-suggestion/candidate-display/candidate-display.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CluesComponent } from './clues/clues.component';
import { QuillModule } from 'ngx-quill';
import { DictionarySearchComponent } from './dictionary-search/dictionary-search.component';
import { SidebarComponent } from './sidebar/sidebar.component';

@NgModule({
  declarations: [
    AppComponent, WordSuggestionComponent, GridDisplayComponent,
    CandidateDisplayComponent, CluesComponent, DictionarySearchComponent, SidebarComponent
  ],
  imports: [
    BrowserModule, ScrollingModule, FormsModule, ReactiveFormsModule, BrowserAnimationsModule, NgbModule,
    QuillModule.forRoot({
      modules: {
        syntax: false,
        toolbar: false,
        keyboard: {
          bindings: {
            tab: {
              key: 9,
              handler: () => true
            },
            handleEnter: {
              key: 13,
              handler: () => false
            }
          },
        }
      },
      theme: 'bubble',
      formats: [],
      format: 'text'
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
