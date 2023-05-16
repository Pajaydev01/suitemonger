import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../../services/actions.service';

@Component({
  selector: 'app-reviewone',
  templateUrl: './reviewone.page.html',
  styleUrls: ['./reviewone.page.scss'],
})
export class ReviewonePage implements OnInit {
  data: any = {};
  constructor(
    public action: ActionsService
  ) { }

  ngOnInit() {
    this.data.item = this.action.getItem();
  }



}
