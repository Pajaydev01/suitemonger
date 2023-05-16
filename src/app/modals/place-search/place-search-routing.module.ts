import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PlaceSearchPage } from './place-search.page';

const routes: Routes = [
  {
    path: '',
    component: PlaceSearchPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PlaceSearchPageRoutingModule {}
