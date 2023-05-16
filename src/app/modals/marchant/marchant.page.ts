import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../../services/actions.service'

@Component({
  selector: 'app-marchant',
  templateUrl: './marchant.page.html',
  styleUrls: ['./marchant.page.scss'],
})
export class MarchantPage implements OnInit {

  constructor(
    private action: ActionsService
  ) { }

  ngOnInit() {
  }

  go = (type) => {
    this.action.saveItem(type);
    this.action.modal.dismiss();
    this.action.navigate('forward', '/topop')
  }

}
