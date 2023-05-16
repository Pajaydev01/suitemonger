import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MarchantPage } from './marchant.page';

const routes: Routes = [
  {
    path: '',
    component: MarchantPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MarchantPageRoutingModule {}
