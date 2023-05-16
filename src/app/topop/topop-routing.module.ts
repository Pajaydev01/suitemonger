import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TopopPage } from './topop.page';

const routes: Routes = [
  {
    path: '',
    component: TopopPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TopopPageRoutingModule {}
