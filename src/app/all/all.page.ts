import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../services/actions.service'

@Component({
  selector: 'app-all',
  templateUrl: './all.page.html',
  styleUrls: ['./all.page.scss'],
})
export class AllPage implements OnInit {
  data: any = {};
  constructor(
    public action: ActionsService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.data['result'] = this.action.getItem();
  }

  goHouse(item) {
    let data = {
      load: true,
      item: item.id
    }
    this.action.saveItem(data);
    this.action.navigate('forward', '/house')
  }

}
