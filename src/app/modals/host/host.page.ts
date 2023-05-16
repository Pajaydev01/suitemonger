import { Component, OnInit } from '@angular/core';
import { ActionsService } from '../../services/actions.service';
import { FireServiceService } from '../../services/fire-service.service';

@Component({
  selector: 'app-host',
  templateUrl: './host.page.html',
  styleUrls: ['./host.page.scss'],
})
export class HostPage implements OnInit {
  data: any = {};
  constructor(
    private action: ActionsService,
    private fire: FireServiceService,
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.data['loading'] = true;
    let id = this.action.getItem();
    //fetch the company singly from server
    this.fetchData(id);
  }

  fetchData = (id) => {
    this.data['obs'] = this.fire.getSingle('company', parseInt(id)).subscribe((res: any) => {
      if (res == undefined) {
        this.data.loading = false;
        this.data['empty'] = true;
      }
      else {
        this.data.loading = false
        this.data['result'] = res;
        this.data['empty'] = false;
      }
    })
  }

  ionViewWillLeave() {
    this.data.obs.unsubscribe();
  }
}
