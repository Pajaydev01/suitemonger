import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReviewonePageRoutingModule } from './reviewone-routing.module';

import { ReviewonePage } from './reviewone.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReviewonePageRoutingModule
  ],
  declarations: [ReviewonePage]
})
export class ReviewonePageModule {}
