import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TopopPageRoutingModule } from './topop-routing.module';
import { TopopPage } from './topop.page';
//import { Angular4PaystackModule } from 'angular4-paystack';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TopopPageRoutingModule,
  //  Angular4PaystackModule.forRoot('pk_test_xxxxxxxxxxxxxxxxxxxxxxxx')
  ],
  declarations: [TopopPage]
})
export class TopopPageModule { }
