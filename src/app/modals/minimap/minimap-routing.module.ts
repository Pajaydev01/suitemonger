import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MinimapPage } from './minimap.page';

const routes: Routes = [
  {
    path: '',
    component: MinimapPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MinimapPageRoutingModule {}
