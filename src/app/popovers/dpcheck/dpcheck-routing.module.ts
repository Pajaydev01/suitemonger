import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DpcheckPage } from './dpcheck.page';

const routes: Routes = [
  {
    path: '',
    component: DpcheckPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DpcheckPageRoutingModule {}
