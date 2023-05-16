import { Component, OnInit } from '@angular/core';
import { FireServiceService } from '../../services/fire-service.service';
import { ActionsService } from '../../services/actions.service';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
})
export class HistoryPage implements OnInit {
  data: any = {};
  constructor(
    private action: ActionsService,
    public fire: FireServiceService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.data['loading'] = true;
    const user = JSON.parse(localStorage.getItem('user_data'));
    this.fire.queryData('transaction', 'user', user.id, 't_id', 'desc').then(res => {
      if (res.empty) {
        //user has no funds, return o
        this.data.loading = false;
        this.data['empty'] = true;
      }
      else {
        this.data.loading = false;
        this.data['empty'] = false;
        let info = [];
        res.forEach(res => {
          info.push(res.data());
        })
        this.data['result'] = info;
      }
    })
  }

  check = (item) => {
    if (item.toString().charAt(0) == '-') {
      return true
    }
    else {
      return false
    }
  }
}
