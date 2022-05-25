import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DpcheckPageRoutingModule } from './dpcheck-routing.module';

import { DpcheckPage } from './dpcheck.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DpcheckPageRoutingModule
  ],
  declarations: [DpcheckPage]
})
export class DpcheckPageModule {}
