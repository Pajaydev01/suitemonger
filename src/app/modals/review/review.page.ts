import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../../services/actions.service';

@Component({
  selector: 'app-review',
  templateUrl: './review.page.html',
  styleUrls: ['./review.page.scss'],
})
export class ReviewPage implements OnInit {
  data: any = {};

  constructor(
    private action: ActionsService
  ) {
  }

  ngOnInit() { }

  change = (ev) => {
    this.data.feel = ev;
  }

  proceed = () => {
    if (this.data.feel == undefined || this.data.comment == undefined) {
      this.action.Toast('Please select your reaction and enter your comment to proceed', 'top');
    }
    else {
      //dismiss modal and pass data down
      this.action.modal.dismiss({ data: this.data });
    }
  }
}
