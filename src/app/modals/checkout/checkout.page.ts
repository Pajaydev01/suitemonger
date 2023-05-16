import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../../services/actions.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
})
export class CheckoutPage implements OnInit {
  data: any = {};
  constructor(
    private action: ActionsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter(): void {
    this.data['all'] = this.action.getItem();
  }

  go = (con) => {
    this.action.modal.dismiss({ con });
  }
}
