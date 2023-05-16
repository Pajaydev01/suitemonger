import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../../services/actions.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.page.html',
  styleUrls: ['./notification.page.scss'],
})
export class NotificationPages implements OnInit {
  data: any = {}
  constructor(
    private action: ActionsService
  ) { }

  ngOnInit() {
    this.data['result'] = this.action.getItem();

  }

  close() {
    this.action.modal.dismiss();
  }

}
