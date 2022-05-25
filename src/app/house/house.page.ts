import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionsService } from '../services/actions.service';
import { FireServiceService } from '../services/fire-service.service';
import { SliderServiceService } from '../services/slider-service.service';
import { IonContent } from '@ionic/angular';
import { LoginPage } from '../modals/login/login.page';

@Component({
  selector: 'app-house',
  templateUrl: './house.page.html',
  styleUrls: ['./house.page.scss'],
})
export class HousePage implements OnInit {
  data: any = {};
  @ViewChild(IonContent) content: IonContent;

  constructor(
    private action: ActionsService,
    private fire: FireServiceService,
    private slider: SliderServiceService,

  ) {
    this.data['loading'] = true;
  }

  ngOnInit() {
  }

  ionViewWillEnter() {
    //use the given id here to find the data
    let input = this.action.getItem();
    (input.load) ? this.loadHouse(input.item) : this.loadData(input.item);
  }

  loadHouse = (id) => {
    if (typeof id == 'string') {
      this.fire.getSingle('houses', id).subscribe(res => {
        if (res.length < 0) {
          this.data['loading'] = false;
          this.action.alerter('Error', 'Sorry a network error occured, please try again');
        }
        else {
          this.data.loading = false;
          this.data['result'] = res;
          this.data['user'] = [];
        }
      }, err => {
        this.data.loading = false;
        this.action.alerter('Error', err)
      })
    }
    else {
      //use the data directly from search cos it's coming without an id

      this.data['result'] = id;
      this.data['user'] = [];
      this.data.loading = false;
    }
  }

  loadData = (item) => {
    //first load the house item
    this.fire.getSingle('houses', item.id).subscribe(res => {
      if (res.length < 0) {
        this.data['loading'] = false;
        this.action.alerter('Error', 'Sorry a network error occured, please try again');
      }
      else {
        this.data.loading = false;
        this.data['result'] = res;
        this.data['user'] = [];
        this.data['user']['counter'] = item.counter;
        this.data['user']['suiteCount'] = item.suiteCount;
        this.data['user']['prices'] = item.prices;
        this.data['user']['total'] = item.total;
        this.data['dateTime'] = '';
        this.data['user']['day'] = item.day;
        this.data['user']['time'] = item.time;
        this.data['count'] = item.index;
        this.data['days'] = this.data.user.prices[0].charge_per;
        //scroll all contents down
        this.content.scrollToBottom(2000);
      }
    }, err => {
      this.data.loading = false;
      this.action.alerter('Error', err)
    })
  }

  editCount = (sign) => {
    //to edit number of days to book here

    switch (sign) {
      case '+':
        //this is the selected number of days
        this.data['user'].counter = (parseInt(this.data['user'].counter) + parseInt(this.data.days));
        let sub = ((this.data.user.prices[0].price) / (this.data.days));
        this.calcPrice(sub)
        break;

      case '-':
        if (parseInt(this.data['user'].counter) == parseInt(this.data.days)) {
          this.action.Toast('Sorry, the least day is 1', 'top');
        }
        else {
          //this is the selected number of days
          this.data['user'].counter = (this.data['user'].counter - this.data.days);
          let subb = ((this.data.user.prices[0].price) / (this.data.days));
          this.calcPrice(subb)
        }
        break;
    }
  }

  editSuite(sign) {
    //to dit number of suites booked here
    switch (sign) {
      case '+':
        let res = ((this.data.user.prices[0].spaces) - (this.data.user.prices[0].occupied));
        if (parseInt(this.data['user'].suiteCount) == res) {
          this.action.Toast('Sorry, you cannnot select beyond the available space', 'top');
        }
        else {
          //this is the selected number of spaces
          this.data['user'].suiteCount++;
          let sub = ((this.data.user.prices[0].price) / (this.data.days));
          this.calcPrice(sub)
        }
        break;

      case '-':
        if (this.data['user'].suiteCount === 1) {
          this.action.Toast('Sorry, the least room is 1', 'top');
        }
        else {
          //this is the selected number of spaces
          this.data['user'].suiteCount--;
          let sub = ((this.data.user.prices[0].price) / (this.data.days));
          this.calcPrice(sub)
        }
        break;
    }
  }

  calcPrice(sub) {
    //usong this to get the final calculation of suites booked
    let presub = sub * this.data['user'].counter;
    //this is the total money to be charged
    this.data['user']['total'] = presub * this.data['user'].suiteCount;
  }

  price = (item, i) => {
    this.data['count'] = i;
    this.data['user']['prices'] = [];
    this.data['user']['counter'] = 0;
    this.data['user']['total'] = 0;
    this.data['user']['suiteCount'] = 1;
    this.data.user.prices.push(item);
    this.data['user']['counter'] = this.data.user.prices[0].charge_per;
    this.data['days'] = this.data.user.prices[0].charge_per;
    let sub = ((this.data.user.prices[0].price) / (this.data.days));
    this.data['user']['total'] = sub * this.data.user.counter
    this.content.scrollToBottom(2000);
  }

  //use this for data time modal
  confirm = (ev) => {
    this.data['dateTemp'] = ev.detail.value;
  }

  proceed = () => {
    this.data['dateTime'] = this.data.dateTemp;
    this.data.user['day'] = this.action.formatDate(this.data.dateTemp);
    this.data.user['time'] = this.action.formatTime(this.data.dateTemp);
    this.action.modal.dismiss();
  }

  cancel = () => {
    this.action.modal.dismiss();
  }

  //save bookings here
  saveBooking = () => {
    if (localStorage.getItem('user_data') !== null) {
      this.data.user['id'] = this.data.result.id;
      this.data.user['company'] = this.data.result.company;
      this.data.user['currency'] = this.data.result.currency;
      this.data.user['name'] = this.data.result.name;
      this.data.user['index'] = this.data.count;
      let saved = JSON.parse(localStorage.getItem('bookings')) || [];
      if (saved.length > 0) {
        let check = saved.some(res => res.id === this.data.user.id);
        if (check) {
          this.action.Toast('You have this item saved in your bookings already', 'top');
        }
        else {
          //save it
          let data = {
            ...this.data.user
          }
          saved.push(data);
          localStorage.setItem('bookings', JSON.stringify(saved));
          this.action.Toast('Item saved', 'top');
        }
      }
      else {
        saved = [];
        let data = {
          ...this.data.user
        }
        saved.push(data);
        localStorage.setItem('bookings', JSON.stringify(saved));
        this.action.Toast('Item saved', 'top');
      }
    }
    else {
      this.action.Toast('Kindly login to save your item', 'bottom');
      let props = {}
      this.action.modalCreate(LoginPage, props);
    }
  }
}
