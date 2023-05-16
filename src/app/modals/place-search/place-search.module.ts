import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PlaceSearchPageRoutingModule } from './place-search-routing.module';

import { PlaceSearchPage } from './place-search.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PlaceSearchPageRoutingModule
  ],
  declarations: [PlaceSearchPage]
})
export class PlaceSearchPageModule {}
