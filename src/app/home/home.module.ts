import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import {InputTextModule} from 'primeng/inputtext';
import { HomePageRoutingModule } from './home-routing.module';
import {DividerModule} from 'primeng/divider';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    InputTextModule,
    DividerModule
  ],
  declarations: [HomePage]
})
export class HomePageModule { }
