import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { PuzzleDisplayComponent } from './puzzle-display/puzzle-display.component';
import { PuzzleSelectorComponent } from './puzzle-selector/puzzle-selector.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { PuzzleSolverComponent } from './puzzle-solver/puzzle-solver.component';


@NgModule({
  declarations: [
    AppComponent, PuzzleDisplayComponent,
    PuzzleSolverComponent, PuzzleSelectorComponent
  ],
  imports: [
    BrowserModule, ScrollingModule, FormsModule, ReactiveFormsModule, BrowserAnimationsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
