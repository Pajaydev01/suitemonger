import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReviewonePage } from './reviewone.page';

const routes: Routes = [
  {
    path: '',
    component: ReviewonePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReviewonePageRoutingModule {}
