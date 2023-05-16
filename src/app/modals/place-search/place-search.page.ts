import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../../services/actions.service'

@Component({
  selector: 'app-place-search',
  templateUrl: './place-search.page.html',
  styleUrls: ['./place-search.page.scss'],
})
export class PlaceSearchPage implements OnInit {
  data: any = {}
  constructor(
    public action: ActionsService
  ) { }

  ngOnInit() {
  }

  close = () => {
    this.action.modal.dismiss();
  }

  proceed = () => {
    if (this.data.input === undefined || this.data.input == "") {
      this.action.Toast('Please enter a location', 'bottom');
    }
    else {
      this.action.modal.dismiss({ data: this.data.input })
    }
  }

}
