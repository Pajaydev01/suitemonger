import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-dpcheck',
  templateUrl: './dpcheck.page.html',
  styleUrls: ['./dpcheck.page.scss'],
})
export class DpcheckPage implements OnInit {

  constructor(
    public popover: PopoverController,
  ) { }

  ngOnInit() {
  }

  go = (type) => {
    this.popover.dismiss({ type: type })
  }

}
