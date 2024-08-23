import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { GridDisplayComponent } from './grid-display/grid-display.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenubarComponent } from './menubar/menubar.component';
import { AppRoutingModule } from './app-routing.module';
import { PuzzleSolverComponent } from './puzzle-solver/puzzle-solver.component';
import { RedirectComponent } from './redirect.component';

@NgModule({
  declarations: [
    AppComponent, GridDisplayComponent,
    MenubarComponent, PuzzleSolverComponent, RedirectComponent
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
