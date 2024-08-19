import { NgModule } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle, RouterModule, Routes } from '@angular/router';
import { RedirectComponent } from './redirect.component';
import { CrosswordComponent } from './crossword/crossword.component';
import { RouteReuseStrategy } from '@angular/router';

export class NeverReuseRoutesStrategy implements RouteReuseStrategy {
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle | null): void {
  }
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    return false;
  }
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle | null {
    return null;
  }
  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return false;
  }
}

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/puzzle' },
  { path: 'puzzle', pathMatch: 'full', component: RedirectComponent },
  {
    path: 'puzzle/:id', component: CrosswordComponent
  }
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: RouteReuseStrategy, useClass: NeverReuseRoutesStrategy },
  ]
})
export class AppRoutingModule { }
