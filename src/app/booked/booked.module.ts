import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { BookedPageRoutingModule } from './booked-routing.module';

import { BookedPage } from './booked.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BookedPageRoutingModule
  ],
  declarations: [BookedPage]
})
export class BookedPageModule {}
