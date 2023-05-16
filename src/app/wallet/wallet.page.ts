import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionsService } from '../services/actions.service';
import { IonSegment } from '@ionic/angular';
import { FireServiceService } from '../services/fire-service.service';
import { HistoryPage } from '../modals/history/history.page';
import { MarchantPage } from '../modals/marchant/marchant.page';
@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {
  @ViewChild('segment') segment: IonSegment;
  data: any = {};

  constructor(
    private action: ActionsService,
    public fire: FireServiceService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    //load wallet
    this.loadWallet();
  }

  loadWallet = () => {
    this.data['loading'] = true;
    this.data['segment'] = 0;
    const user = JSON.parse(localStorage.getItem('user_data'));
    this.fire.queryData('transaction', 'user', user.id).then(res => {
      if (res.empty) {
        //user has no funds, return o
        this.data.loading = false;
        this.data['balance'] = 0;
      }
      else {
        this.data.loading = false;
        let info = [];
        res.forEach(res => {
          info.push(res.data());
        })
        this.action.calcTotal(info).then(res => {
          this.data['balance'] = res;
        })
      }
    })
  }

  transactions = () => {
    this.action.modalCreate(HistoryPage,
      {
      },
      '',
      {
        breakpoints: [0, 0.2, 0.5, 0.7, 0.9, 1],
        initialBreakpoint: 0.9,

      }
    ).then(res => {

    })
  }

  topup = () => {
    this.action.modalCreate(MarchantPage,
      {
      },
      '',
      {
        breakpoints: [0, 0.2, 0.5, 0.7, 0.9, 1],
        initialBreakpoint: 0.5,

      }
    ).then(res => {

    })
  }

  segmentChanged = (ev) => {
    (ev.target.value == 0) ? this.loadWallet() : this.loadEarning();
  }

  loadEarning = () => {
    this.data.segment = 1;

  }
}
