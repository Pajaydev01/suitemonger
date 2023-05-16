import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MarchantPageRoutingModule } from './marchant-routing.module';

import { MarchantPage } from './marchant.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MarchantPageRoutingModule
  ],
  declarations: [MarchantPage]
})
export class MarchantPageModule {}
