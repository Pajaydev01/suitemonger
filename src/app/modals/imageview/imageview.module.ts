import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ImageviewPageRoutingModule } from './imageview-routing.module';

import { ImageviewPage } from './imageview.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ImageviewPageRoutingModule
  ],
  declarations: [ImageviewPage]
})
export class ImageviewPageModule { }
