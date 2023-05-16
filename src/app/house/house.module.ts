import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HousePageRoutingModule } from './house-routing.module';

import { HousePage } from './house.page';
import {DividerModule} from 'primeng/divider';
import {AccordionModule} from 'primeng/accordion';
import { ChipModule } from 'primeng/chip';
import { NgImageSliderModule } from 'ng-image-slider';
import {ButtonModule} from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { CalendarModule } from 'primeng/calendar';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HousePageRoutingModule,
    DividerModule,
    AccordionModule,
    ChipModule,
    NgImageSliderModule,
    ButtonModule,
    CheckboxModule,
    CalendarModule
  ],
  declarations: [HousePage]
})
export class HousePageModule { }
