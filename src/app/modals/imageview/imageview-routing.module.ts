import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ImageviewPage } from './imageview.page';

const routes: Routes = [
  {
    path: '',
    component: ImageviewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ImageviewPageRoutingModule {}
